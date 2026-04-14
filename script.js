// Google Sheets Configuration
const SHEET_ID = '1PxkC_kniknYbxFRV6brev1Fv3y_ZrPx2AHEcKkYbJhY';
const API_KEY = 'AIzaSyA05kFZ9ejXco6wpLFfV8WUVaUBbjnhhVI'; // Reusing your webstore key
const CLOUD_NAME = ''; // To be filled once provided

// Static Room Data (Descriptions and Features match the ones in HTML)
const roomDetails = {
    'Two-Bedroom Apartment': {
        size: '1000 sq ft',
        amenities: ['1 King, 2 Twin', 'Gourmet Kitchen', 'Separate Dining Area', 'Smart TV with Netflix', '24/7 Security', 'Full Power Backup']
    },
    'The Maisonette': {
        size: 'Maximum Space',
        amenities: ['Premier Luxury Unit', '1 Queen, 2 Twin', 'Extremely Spacious', 'Gourmet Kitchen', 'Down Duvets', 'Pillow Menu', 'In-Room Safe']
    },
    'One-Bedroom Apartment': {
        size: '615 sq ft',
        amenities: ['1 King Bed', 'Gourmet Kitchenette', 'Spacious Sitting Area', 'Smart TV', 'Free WiFi', 'Select-Comfort Bedding']
    },
    'Twin Studio Room': {
        size: 'Cozy',
        amenities: ['2 Twin Beds', 'Select-Comfort Beds', 'Daily Housekeeping', 'Free Toiletries', 'Slippers & Hairdryer', 'Smart TV']
    },
    'Twin Studio Apartment': {
        size: '490 sq ft',
        amenities: ['2 Twin Beds', 'Dedicated Work Station', 'Gourmet Kitchenette', 'Laundry Access', 'Free WiFi', 'CCTV Security']
    },
    'Deluxe Apartment': {
        size: '500 sq ft',
        amenities: ['1 Queen Bed', 'Gourmet Kitchenette', 'Modern Layout', 'Air Conditioning', 'Total Power Backup', 'Premium Bedding']
    }
};

let sheetData = {};

// --- Link Transformer Helper ---
function isVideo(url) {
    if (!url || typeof url !== 'string') return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('.mp4') || lowerUrl.includes('.webm') || lowerUrl.includes('.mov') || lowerUrl.includes('.ogg');
}

function transformToDirectLink(url) {
    if (!url || typeof url !== 'string') return url || '';
    
    // Google Drive
    if (url.includes('drive.google.com')) {
        let fileId = '';
        if (url.includes('/file/d/')) {
            fileId = url.split('/file/d/')[1].split('/')[0];
        } else if (url.includes('id=')) {
            fileId = url.split('id=')[1].split('&')[0];
        }
        // Use export=download for better video streaming support
        return fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : url;
    }
    
    // Dropbox
    if (url.includes('dropbox.com')) {
        return url.replace('dl=0', 'raw=1');
    }
    
    return url;
}

// 1. Navbar Scroll Effect
const header = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// 2. Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links li');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
    if(navLinks.classList.contains('active')) {
        header.classList.add('scrolled');
    } else if(window.scrollY <= 50) {
        header.classList.remove('scrolled');
    }
});

links.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// 3. Google Sheets Integration
let heroUrls = [];
let currentHeroIndex = 0;

async function fetchHotelData() {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!A2:H?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.values) {
            data.values.forEach(row => {
                const [type, price, mainImg, gallery, inventory, adultsCap, childrenCap, heroImages] = row;
                if (!type) return;
                sheetData[type.trim()] = {
                    price: price,
                    mainImg: transformToDirectLink(mainImg ? mainImg.trim() : ''),
                    gallery: gallery ? gallery.split(',').map(s => transformToDirectLink(s.trim())).filter(s => s) : [],
                    inventory: parseInt(inventory) || 0,
                    adults: parseInt(adultsCap) || 2,
                    children: parseInt(childrenCap) || 0
                };
            });

            // Extract Hero Images from Column H of the first valid row
            const firstRowData = data.values.find(row => row[7]);
            if (firstRowData && firstRowData[7]) {
                const rawUrls = firstRowData[7].split(',').map(u => u.trim()).filter(u => u !== '');
                // Auto-transform links
                const cleanUrls = rawUrls.map(u => transformToDirectLink(u));
                startHeroSlideshow(cleanUrls);
            }

            updateRoomCards();
            fetchGalleryData(); // Single call to get the gallery
        }
    } catch (error) {
        console.error('Error fetching hotel data:', error);
    }
}

function startHeroSlideshow(urls) {
    if (!urls || urls.length === 0) return;
    heroUrls = urls;
    const container = document.getElementById('hero-slider');
    if (!container) return;

    // Check if the first URL is a YouTube link
    const originalUrl = urls[0];
    const firstUrlLow = originalUrl.toLowerCase();
    
    if (firstUrlLow.includes('youtube.com') || firstUrlLow.includes('youtu.be')) {
        let videoId = '';
        if (originalUrl.includes('v=')) {
            videoId = originalUrl.split('v=')[1].split('&')[0];
        } else if (originalUrl.includes('youtu.be/')) {
            videoId = originalUrl.split('youtu.be/')[1].split('?')[0];
        }

        if (videoId) {
            console.log('Hayyat Hero Video ID:', videoId);
            container.innerHTML = `
                <div class="video-background">
                    <iframe 
                        src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&rel=0&playsinline=1" 
                        frameborder="0" 
                        allow="autoplay; encrypted-media; picture-in-picture" 
                        style="width:100%; height:100%; border:none;">
                    </iframe>
                </div>
            `;
            return;
        }
    }

    // Fallback to Image Slideshow
    container.innerHTML = heroUrls.map((url, i) => `
        <img src="${url}" class="hero-slide ${i === 0 ? 'active' : ''}" alt="Hayyat Luxury">
    `).join('');

    if (heroUrls.length > 1) {
        setInterval(nextHeroSlide, 5500); // Change slide every 5.5s
    }
}

function nextHeroSlide() {
    const slides = document.querySelectorAll('.hero-slide');
    if (!slides.length) return;
    
    const oldSlide = slides[currentHeroIndex];
    currentHeroIndex = (currentHeroIndex + 1) % slides.length;
    const newSlide = slides[currentHeroIndex];
    
    // Prepare new slide to come on top
    newSlide.style.zIndex = '3';
    oldSlide.style.zIndex = '2';
    
    newSlide.classList.add('active');

    // Wait for the fade-in of the new slide then cleanup the old one
    setTimeout(() => {
        oldSlide.classList.remove('active');
        oldSlide.style.zIndex = '1';
    }, 1500); // Matches CSS transition duration
}

function updateRoomCards() {
    document.querySelectorAll('.room-card').forEach(card => {
        const type = card.getAttribute('data-room');
        const data = sheetData[type];
        if (data) {
            // Update Price
            const priceEl = card.querySelector('.price');
            if (priceEl && data.price) {
                priceEl.innerText = `Rs ${data.price} / night`;
            }
            // Update Main Image
            const imgEl = card.querySelector('.room-img');
            if (imgEl && data.mainImg) {
                imgEl.src = data.mainImg;
            }
            // Update Button if sold out
            const btn = card.querySelector('.btn-text');
            if (data.inventory === 0) {
                btn.innerText = 'Sold Out';
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            }
        }
    });
}

async function openRoomModal(type) {
    const staticData = roomDetails[type];
    if (!staticData) return;
    const sData = sheetData[type];

    // Hide combo tabs and back button when viewing a single room directly
    const tabsEl = document.getElementById('room-tabs');
    if (tabsEl) { tabsEl.style.display = 'none'; tabsEl.innerHTML = ''; }
    const backBtn = document.getElementById('back-to-results');
    if (backBtn) backBtn.style.display = 'none';
    viewingResultContext = null;
    document.querySelector('.btn-book-now').innerText = 'Check Availability';
    
    document.getElementById('modal-title').innerText = type;
    const mPrice = document.getElementById('modal-price');
    mPrice.style.display = 'block';
    mPrice.innerText = sData ? `Rs ${sData.price} / night` : 'View Rates';
    document.getElementById('modal-size').innerText = staticData.size;

    const mBadges = document.querySelector('.modal-badges');
    if(mBadges) mBadges.style.display = 'flex';
    const mAmenities = document.querySelector('.modal-amenities');
    if(mAmenities) mAmenities.style.display = 'block';
    const mThumbs = document.getElementById('modal-thumbnails');
    if(mThumbs) mThumbs.style.display = 'flex';
    
    const card = document.querySelector(`[data-room="${type}"]`);
    if (card) document.getElementById('modal-desc').innerText = card.querySelector('p').innerText;
    
    const availEl = document.getElementById('modal-availability');
    if (sData && sData.inventory > 0) {
        availEl.innerText = `${sData.inventory} Rooms Left`;
        availEl.style.background = '#dcfce7';
        availEl.style.color = '#166534';
    } else {
        availEl.innerText = 'Fully Booked';
        availEl.style.background = '#fee2e2';
        availEl.style.color = '#991b1b';
    }

    const amenitiesList = document.getElementById('modal-amenities-list');
    amenitiesList.innerHTML = staticData.amenities.map(a => `<li>${a}</li>`).join('');

    const mainImg = document.getElementById('modal-main-img');
    const mainVideo = document.getElementById('modal-main-video');
    const thumbRow = document.getElementById('modal-thumbnails');
    let images = sData ? [...sData.gallery] : [];
    if (sData && sData.mainImg) images.unshift(sData.mainImg);

    if (images.length > 0) {
        if (isVideo(images[0])) {
            mainImg.style.display = 'none';
            mainVideo.style.display = 'block';
            mainVideo.src = images[0];
            mainVideo.play();
        } else {
            mainVideo.style.display = 'none';
            mainVideo.pause();
            mainImg.style.display = 'block';
            mainImg.src = images[0];
        }

        thumbRow.innerHTML = images.map((img, i) => {
            if (isVideo(img)) {
                return `<div class="thumb-item ${i === 0 ? 'active' : ''}" onclick="changeModalImg(this, '${img}')" style="position:relative;">
                            <video src="${img}"></video>
                            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:white; font-size:1.5rem; text-shadow:0 0 5px rgba(0,0,0,0.8); pointer-events:none;"><i class="fas fa-play-circle"></i></div>
                        </div>`;
            } else {
                return `<img src="${img}" class="thumb-item ${i === 0 ? 'active' : ''}" onclick="changeModalImg(this, '${img}')">`;
            }
        }).join('');
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

window.changeModalImg = function(el, src) {
    const mainImg = document.getElementById('modal-main-img');
    const mainVideo = document.getElementById('modal-main-video');
    
    if (isVideo(src)) {
        mainImg.style.display = 'none';
        mainVideo.style.display = 'block';
        mainVideo.src = src;
        mainVideo.play();
    } else {
        mainVideo.style.display = 'none';
        mainVideo.pause();
        mainImg.style.display = 'block';
        mainImg.src = src;
    }

    document.querySelectorAll('.thumbnail-row .thumb-item').forEach(img => img.classList.remove('active'));
    el.classList.add('active');
};

window.scrollThumbnails = function(direction) {
    const thumbRow = document.getElementById('modal-thumbnails');
    if (thumbRow) {
        const scrollAmount = 100;
        thumbRow.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
};

// 5. Scroll Animation Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-in-scroll').forEach(el => observer.observe(el));

// 6. Booking Action (Modal)
document.querySelector('.btn-book-now').addEventListener('click', () => {
    if (viewingResultContext) {
        // Came from search results — proceed to checkout with full config
        bookSelection(viewingResultContext.name, viewingResultContext.desc, viewingResultContext.price);
    } else {
        // Opened directly from room cards — close modal and scroll to booking bar
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        document.querySelector('.booking-bar').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});

// 7. Search Algorithm (Option B: Smart Suite - Varied Options)
function performSearch(reqA, reqC) {
    let matches = [];
    const totalReq = reqA + reqC;
    const allAvailable = Object.keys(sheetData).filter(t => sheetData[t].inventory > 0);
    let uniqueCombos = new Set();

    // 1. Check for single room matches
    allAvailable.forEach(type => {
        const room = sheetData[type];
        const capacity = room.adults + room.children;
        if (totalReq <= capacity) {
            matches.push({
                isGroup: false,
                name: type,
                price: room.price,
                totalPriceVal: parseInt(room.price.replace(/,/g, '')),
                capacity: `${room.adults} Adults, ${room.children} Children`
            });
            uniqueCombos.add(JSON.stringify({[type]: 1}));
        }
    });

    // 2. Generate Multi-room combinations (Trying each room as a starting point for variety)
    allAvailable.forEach(startType => {
        let tempHeads = totalReq;
        let combo = [];
        let invTracker = {};
        Object.keys(sheetData).forEach(t => invTracker[t] = sheetData[t].inventory);

        // Force the first room
        combo.push(startType);
        invTracker[startType]--;
        let r1 = sheetData[startType];
        tempHeads -= (r1.adults + r1.children);

        // Fill greedily with available rooms
        const sortedByCap = [...allAvailable].sort((a, b) => (sheetData[b].adults + sheetData[b].children) - (sheetData[a].adults + sheetData[a].children));
        
        while (tempHeads > 0) {
            let found = false;
            for (let type of sortedByCap) {
                if (invTracker[type] > 0) {
                    const r = sheetData[type];
                    combo.push(type);
                    invTracker[type]--;
                    tempHeads -= (r.adults + r.children);
                    found = true;
                    break;
                }
            }
            if (!found) break;
        }

        if (tempHeads <= 0 && combo.length > 1) {
            let counts = {};
            combo.sort().forEach(t => counts[t] = (counts[t] || 0) + 1);
            let comboKey = JSON.stringify(counts);
            if (!uniqueCombos.has(comboKey)) {
                uniqueCombos.add(comboKey);
                let totalPrice = combo.reduce((s, t) => s + parseInt(sheetData[t].price.replace(/,/g, '')), 0);
                let comboDesc = Object.entries(counts).map(([t, c]) => `${c} x ${t}`).join(' + ');
                
                matches.push({
                    isGroup: true,
                    name: "Privacy / Split Group Option",
                    desc: comboDesc,
                    price: totalPrice.toLocaleString(),
                    totalPriceVal: totalPrice,
                    capacity: `Up to ${combo.reduce((s,t) => s + sheetData[t].adults + sheetData[t].children, 0)} Guests`
                });
            }
        }
    });

    // 3. Efficiency Filter: Relaxed! 
    // We now show all viable unique combinations to give users flexible privacy options, 
    // instead of aggressively hiding them if a single room fits.
    let optimalMatches = matches;

    // Sort final list by price
    optimalMatches.sort((a, b) => a.totalPriceVal - b.totalPriceVal);

    // 4. Assign dynamic tags based on price tiers
    optimalMatches.forEach((m, i) => {
        const count = optimalMatches.length;
        if (i === 0) {
            m.tag = "Budget";
            m.tagClass = "badge-budget";
        } else if (i === count - 1) {
            if (m.isGroup) {
                m.tag = "Extra Space";
                m.tagClass = "badge-extra-space";
            } else {
                m.tag = "Luxury";
                m.tagClass = "badge-luxury";
            }
        } else {
            const ratio = i / count;
            if (ratio < 0.4) {
                m.tag = "Economy";
                m.tagClass = "badge-economy";
            } else {
                m.tag = "Premium";
                m.tagClass = "badge-premium";
            }
        }
    });

    displayResults(optimalMatches, reqA, reqC);
}




function displayResults(matches, reqA, reqC) {
    const listEl = document.getElementById('results-list');
    const summaryEl = document.getElementById('results-summary');
    
    if (!listEl || !summaryEl) return;
    
    // Switch to compact mode if many results
    if (matches.length > 3) {
        listEl.classList.add('compact-results');
    } else {
        listEl.classList.remove('compact-results');
    }
    
    summaryEl.innerText = `Showing options for ${reqA} Adults and ${reqC} Children.`;
    listEl.innerHTML = '';

    if (matches.length === 0) {
        listEl.innerHTML = `<div class="no-results">
            <p>No available combinations found for this group size. Please contact us directly for customized group arrangements.</p>
            <a href="https://wa.me/923136766699" class="btn-primary" style="margin-top: 1rem;">Contact Support</a>
        </div>`;
    } else {
        matches.forEach(m => {
            const card = document.createElement('div');
            card.className = 'result-card fade-in-scroll visible';
            const detailsBtn = m.isGroup
                ? `<button class="btn-details" onclick="viewComboDetails('${m.desc}', '${m.name}', '${m.price}')">View Room Details</button>`
                : `<button class="btn-details" onclick="viewDetails('${m.name}', '${m.price}')">View Room Details</button>`;
            card.innerHTML = `
                <div class="result-main">
                    ${m.tag ? `<span class="result-badge ${m.tagClass}">${m.tag}</span>` : ''}
                    <div class="result-name">${m.name}</div>
                    ${m.isGroup ? `<div class="result-combination">${m.desc}</div>` : `<div class="result-combination">Max Capacity: ${m.capacity}</div>`}
                    <div class="result-price">Rs ${m.price} / night</div>
                </div>
                <div class="result-actions">
                    ${detailsBtn}
                    <button class="btn-primary btn-result" onclick="bookSelection('${m.name}', '${m.isGroup ? m.desc : ''}', '${m.price}')">Proceed to Checkout</button>
                </div>
            `;
            listEl.appendChild(card);
        });
    }

    if (resultsModal) {
        resultsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Stores the full search result context when viewing details
let viewingResultContext = null;

// View Details for a single room type
window.viewDetails = function(roomType, price) {
    viewingResultContext = { name: roomType, desc: '', price: price };
    const tabsEl = document.getElementById('room-tabs');
    tabsEl.style.display = 'none';
    tabsEl.innerHTML = '';
    if (resultsModal) resultsModal.classList.remove('active');
    document.getElementById('back-to-results').style.display = 'inline-flex';
    document.querySelector('.btn-book-now').innerText = 'Book this Room';
    openRoomModal(roomType);
};

// View Details for a combo
window.viewComboDetails = function(desc, name, price) {
    viewingResultContext = { name: name, desc: desc, price: price };
    const parts = desc.split('+').map(s => s.trim());
    const roomTypes = parts.map(p => p.replace(/^\d+\s*x\s*/, '').trim());
    const uniqueTypes = [...new Set(roomTypes)];

    const tabsEl = document.getElementById('room-tabs');
    tabsEl.innerHTML = '';
    tabsEl.style.display = 'flex';

    uniqueTypes.forEach((type, i) => {
        const count = parts.filter(p => p.includes(type)).length;
        const label = count > 1 ? `${count}x ${type}` : type;
        const tab = document.createElement('button');
        tab.className = `room-tab ${i === 0 ? 'active-tab' : ''}`;
        tab.innerText = label;
        tab.onclick = () => {
            document.querySelectorAll('.room-tab').forEach(t => t.classList.remove('active-tab'));
            tab.classList.add('active-tab');
            loadRoomIntoModal(type);
        };
        tabsEl.appendChild(tab);
    });

    if (resultsModal) resultsModal.classList.remove('active');
    document.getElementById('back-to-results').style.display = 'inline-flex';
    document.querySelector('.btn-book-now').innerText = 'Book this Option';

    loadRoomIntoModal(uniqueTypes[0]);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

// Go back from room details to search results
window.goBackToResults = function() {
    if (modal) modal.classList.remove('active');
    document.getElementById('back-to-results').style.display = 'none';
    if (resultsModal) {
        resultsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

// Helper: loads a room type's data into the existing modal fields
function loadRoomIntoModal(type) {
    const staticData = roomDetails[type];
    const sData = sheetData[type];
    if (!staticData) return;

    document.getElementById('modal-title').innerText = type;
    document.getElementById('modal-price').innerText = sData ? `Rs ${sData.price} / night` : 'View Rates';
    document.getElementById('modal-size').innerText = staticData.size;

    const card = document.querySelector(`[data-room="${type}"]`);
    if (card) document.getElementById('modal-desc').innerText = card.querySelector('p').innerText;

    const availEl = document.getElementById('modal-availability');
    if (sData && sData.inventory > 0) {
        availEl.innerText = `${sData.inventory} Rooms Left`;
        availEl.style.background = '#dcfce7';
        availEl.style.color = '#166534';
    } else {
        availEl.innerText = 'Fully Booked';
        availEl.style.background = '#fee2e2';
        availEl.style.color = '#991b1b';
    }

    const amenitiesList = document.getElementById('modal-amenities-list');
    amenitiesList.innerHTML = staticData.amenities.map(a => `<li>${a}</li>`).join('');

    const mainImg = document.getElementById('modal-main-img');
    const mainVideo = document.getElementById('modal-main-video');
    const thumbRow = document.getElementById('modal-thumbnails');
    let images = sData ? [...sData.gallery] : [];
    if (sData && sData.mainImg) images.unshift(sData.mainImg);

    if (images.length > 0) {
        if (isVideo(images[0])) {
            mainImg.style.display = 'none';
            mainVideo.style.display = 'block';
            mainVideo.src = images[0];
            mainVideo.play();
        } else {
            mainVideo.style.display = 'none';
            mainVideo.pause();
            mainImg.style.display = 'block';
            mainImg.src = images[0];
        }

        thumbRow.innerHTML = images.map((img, i) => {
            if (isVideo(img)) {
                return `<div class="thumb-item ${i === 0 ? 'active' : ''}" onclick="changeModalImg(this, '${img}')" style="position:relative;">
                            <video src="${img}"></video>
                            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:white; font-size:1.5rem; text-shadow:0 0 5px rgba(0,0,0,0.8); pointer-events:none;"><i class="fas fa-play-circle"></i></div>
                        </div>`;
            } else {
                return `<img src="${img}" class="thumb-item ${i === 0 ? 'active' : ''}" onclick="changeModalImg(this, '${img}')">`;
            }
        }).join('');
    }
}


window.bookSelection = function(name, desc, price) {
    const cin = document.getElementById('checkin') ? document.getElementById('checkin').value : '';
    const cout = document.getElementById('checkout') ? document.getElementById('checkout').value : '';
    const reqA = document.getElementById('adults') ? document.getElementById('adults').value : '2';
    const reqC = document.getElementById('children') ? document.getElementById('children').value : '0';

    // Calculate nights
    const dateIn = new Date(cin);
    const dateOut = new Date(cout);
    const diffTime = Math.abs(dateOut - dateIn);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const priceNum = parseInt(price.replace(/,/g, ''));
    const totalPrice = (priceNum * nights).toLocaleString();

    currentBookingSelection = {
        name: name,
        desc: desc,
        basePrice: price,
        totalPrice: totalPrice,
        nights: nights,
        cin: cin,
        cout: cout,
        adults: reqA,
        children: reqC
    };

    // Populate Sidebar Summary
    document.getElementById('summary-dates').innerText = `${cin} to ${cout} (${nights} ${nights > 1 ? 'Nights' : 'Night'})`;
    document.getElementById('summary-guests').innerText = `${reqA} Adults, ${reqC} Children`;
    document.getElementById('summary-room-name').innerText = name;
    
    const descContainer = document.getElementById('summary-room-desc-container');
    if (desc) {
        document.getElementById('summary-room-desc').innerText = desc;
        descContainer.style.display = 'flex';
    } else {
        descContainer.style.display = 'none';
    }
    
    // Reset breakfast selection when opening a new checkout
    const bfCheckbox = document.getElementById('add-breakfast');
    if (bfCheckbox) bfCheckbox.checked = false;
    const bfOptions = document.getElementById('breakfast-options');
    if (bfOptions) bfOptions.style.display = 'none';
    const bfCount = document.getElementById('breakfast-count');
    if (bfCount) bfCount.value = 1;
    
    updateCheckoutSummary();

    // Open Checkout Modal
    if (resultsModal) resultsModal.classList.remove('active');
    if (modal) modal.classList.remove('active');
    if (checkoutModal) {
        checkoutModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

// 4. Modal Initialisation
let modal, resultsModal, checkoutModal, closeModal, closeResults, closeCheckout;

// To store selected booking data for final checkout
let currentBookingSelection = {};

function initModals() {
    modal = document.getElementById('room-modal');
    resultsModal = document.getElementById('results-modal');
    checkoutModal = document.getElementById('checkout-modal');
    // Use specific close button for room-modal only
    closeModal = document.querySelector('#room-modal .close-modal');
    closeResults = document.querySelector('.close-results');
    closeCheckout = document.querySelector('.close-checkout');

    document.querySelectorAll('.open-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.room-card');
            const roomType = card.getAttribute('data-room');
            openRoomModal(roomType);
        });
    });

    window.closeAllModals = function() {
        const modalMainVideo = document.getElementById('modal-main-video');
        if (modalMainVideo) { modalMainVideo.pause(); modalMainVideo.currentTime = 0; }
        
        if (modal) modal.classList.remove('active');
        if (resultsModal) resultsModal.classList.remove('active');
        if (checkoutModal) checkoutModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    [closeModal, closeResults, closeCheckout].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', closeAllModals);
        }
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal || e.target === resultsModal || e.target === checkoutModal) {
            closeAllModals();
        }
    });

    // Amenities All Modal (mobile)
    const amenitiesModal = document.getElementById('amenities-modal');
    const openAmenitiesBtn = document.getElementById('open-amenities-modal');
    const closeAmenitiesBtn = document.getElementById('close-amenities-modal');

    if (openAmenitiesBtn && amenitiesModal) {
        openAmenitiesBtn.addEventListener('click', () => {
            amenitiesModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    if (closeAmenitiesBtn && amenitiesModal) {
        closeAmenitiesBtn.addEventListener('click', () => {
            amenitiesModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }
    if (amenitiesModal) {
        amenitiesModal.addEventListener('click', (e) => {
            if (e.target === amenitiesModal) {
                amenitiesModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Breakfast Logic
    const bfCheckbox = document.getElementById('add-breakfast');
    const bfOptions = document.getElementById('breakfast-options');
    const bfInc = document.getElementById('btn-increase-bf');
    const bfDec = document.getElementById('btn-decrease-bf');
    const bfCount = document.getElementById('breakfast-count');
    const bfInfoIcon = document.getElementById('breakfast-info-icon');
    const bfInfoModal = document.getElementById('breakfast-info-modal');
    const closeBfModal = document.getElementById('close-breakfast-modal');

    if (bfCheckbox) {
        bfCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                bfOptions.style.display = 'block';
            } else {
                bfOptions.style.display = 'none';
            }
            updateCheckoutSummary();
        });
    }

    if (bfInc && bfCount) {
        bfInc.addEventListener('click', () => {
            bfCount.value = parseInt(bfCount.value) + 1;
            updateCheckoutSummary();
        });
    }

    if (bfDec && bfCount) {
        bfDec.addEventListener('click', () => {
            if (parseInt(bfCount.value) > 1) {
                bfCount.value = parseInt(bfCount.value) - 1;
                updateCheckoutSummary();
            }
        });
    }
    
    if (bfInfoIcon && bfInfoModal) {
        bfInfoIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            bfInfoModal.classList.add('active');
        });
    }
    
    if (closeBfModal && bfInfoModal) {
        closeBfModal.addEventListener('click', () => {
            bfInfoModal.classList.remove('active');
        });
    }
    
    if (bfInfoModal) {
        bfInfoModal.addEventListener('click', (e) => {
            if (e.target === bfInfoModal) {
                bfInfoModal.classList.remove('active');
            }
        });
    }
}

function updateCheckoutSummary() {
    if (!currentBookingSelection || !currentBookingSelection.totalPrice) return;
    const addBf = document.getElementById('add-breakfast').checked;
    const bfCount = parseInt(document.getElementById('breakfast-count').value) || 1;
    const { basePrice, totalPrice, nights } = currentBookingSelection;
    let finalPrice = parseInt(totalPrice.replace(/,/g, ''));
    
    let bfHtml = '';
    if (addBf) {
        let bfCost = 1200 * bfCount * nights;
        finalPrice += bfCost;
        bfHtml = `<br><small style="color:var(--clr-orange); font-size: 0.85em;">+ Breakfast: Rs ${bfCost.toLocaleString()} (Rs ${1200 * bfCount} x ${nights})</small>`;
    }
    
    document.getElementById('summary-price').innerHTML = `Rs ${basePrice} / night<br><small style="color:var(--clr-gray); font-size: 0.8em; font-weight: normal;">Room Total: Rs ${totalPrice}</small>${bfHtml}<br><strong style="font-size: 1.1em; color: var(--clr-darker); display: block; margin-top: 5px;">Grand Total: Rs ${finalPrice.toLocaleString()}</strong>`;
}

// Initial Setup logic
function initDateConstraints() {
    const cin = document.getElementById('checkin');
    const cout = document.getElementById('checkout');
    if (!cin || !cout) return;

    const today = new Date().toISOString().split('T')[0];
    cin.min = today;
    if (!cin.value) cin.value = today;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    if (!cout.value || cout.value <= cin.value) {
        cout.min = tomorrowStr;
        cout.value = tomorrowStr;
    }

    cin.addEventListener('change', () => {
        const selectedDate = new Date(cin.value);
        const nextDay = new Date(selectedDate);
        nextDay.setDate(selectedDate.getDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];
        cout.min = nextDayStr;
        if (cout.value <= cin.value) {
            cout.value = nextDayStr;
        }
    });
}

// --- Guest Gallery (Infinity Reel) Integration ---

async function fetchGalleryData() {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Gallery!A2:C?key=${API_KEY}`;
        console.log('Fetching Gallery from:', url);
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('Gallery Data Received:', data);

        if (data.values && data.values.length > 0) {
            const cleanRows = data.values.filter(row => row[0]).map(row => {
                row[0] = transformToDirectLink(row[0]);
                return row;
            });
            renderGuestGallery(cleanRows);
        } else {
            console.warn('Gallery sheet is empty or has no data.');
            const gal = document.getElementById('gallery');
            if (gal) gal.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching gallery data:', error);
        const gal = document.getElementById('gallery');
        if (gal) gal.style.display = 'none';
    }
}

function renderGuestGallery(rows) {
    const track = document.getElementById('guest-reel');
    if (!track) return;

    const htmlMarkup = rows.map(row => {
        const [url, type, caption] = row;
        if (!url) return '';
        const isVideo = type ? type.toLowerCase().includes('video') : false;
        
        return `
            <div class="guest-card" onclick="openMediaModal('${url}', ${isVideo})">
                ${isVideo ? `
                    <video src="${url}" muted loop playsinline></video>
                    <div class="video-badge"><i class="fas fa-play"></i></div>
                ` : `
                    <img src="${url}" loading="lazy" alt="Guest Moment">
                `}
                <div class="card-overlay">
                    <p>${caption || 'Wonderful Stay'}</p>
                </div>
            </div>
        `;
    }).join('');

    // Only duplicate for a loop if we have enough items
    if (rows.length > 4) {
        track.innerHTML = htmlMarkup + htmlMarkup;
        track.classList.remove('no-scroll');
    } else {
        track.innerHTML = htmlMarkup;
        track.classList.add('no-scroll'); // Center items if only a few
    }

    // Auto-play videos on hover for energy
    const cards = track.querySelectorAll('.guest-card');
    cards.forEach(card => {
        const v = card.querySelector('video');
        if (v) {
            card.addEventListener('mouseenter', () => v.play());
            card.addEventListener('mouseleave', () => { v.pause(); v.currentTime = 0; });
        }
    });
}

window.openMediaModal = function(url, isVideo) {
    // Reusing the existing room modal for a quick media preview
    const modalMainImg = document.getElementById('modal-main-img');
    const modalMainVideo = document.getElementById('modal-main-video');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalPrice = document.getElementById('modal-price');
    const modalBadges = document.querySelector('.modal-badges');
    const modalAmenities = document.querySelector('.modal-amenities');
    const thumbRow = document.getElementById('modal-thumbnails');
    const bookBtn = document.querySelector('.btn-book-now');
    const tabsEl = document.getElementById('room-tabs');

    if (!modalMainImg || !modalMainVideo) return;

    // Reset and Show Gallery Mode
    modalTitle.innerText = "Guest Moment";
    modalDesc.innerText = "Captured by one of our valued guests. Experience the same comfort at Hayyat.";
    modalPrice.style.display = 'none';
    if(modalBadges) modalBadges.style.display = 'none';
    if(modalAmenities) modalAmenities.style.display = 'none';
    if(thumbRow) thumbRow.style.display = 'none';
    if(tabsEl) tabsEl.style.display = 'none';
    bookBtn.innerText = "Book Your Experience";

    if (isVideo) {
        modalMainImg.style.display = 'none';
        modalMainVideo.style.display = 'block';
        modalMainVideo.src = url;
        modalMainVideo.style.objectFit = 'contain'; // Show whole portrait video
        modalMainVideo.play().catch(e => console.warn('Autoplay prevented or video error:', e));
    } else {
        modalMainVideo.pause();
        modalMainVideo.style.display = 'none';
        modalMainImg.style.display = 'block';
        modalMainImg.src = url;
    }

    const roomModal = document.getElementById('room-modal');
    if (roomModal) {
        const modalContent = roomModal.querySelector('.modal-content');
        if (modalContent) modalContent.classList.add('gallery-mode');
        
        roomModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.closeMediaModal = function() {
    closeAllModals();
};

// Also ensure the room modal reset shows the image again
const originalOpenRoomModal = openRoomModal;
openRoomModal = async function(type) {
    const modalMainImg = document.getElementById('modal-main-img');
    const modalMainVideo = document.getElementById('modal-main-video');
    
    const roomModal = document.getElementById('room-modal');
    if (roomModal) {
        const modalContent = roomModal.querySelector('.modal-content');
        if (modalContent) modalContent.classList.remove('gallery-mode');
    }

    if(modalMainImg) modalMainImg.style.display = 'block';
    if(modalMainVideo) {
        modalMainVideo.style.display = 'none';
        modalMainVideo.pause();
    }
    return originalOpenRoomModal(type);
};

document.addEventListener('DOMContentLoaded', () => {
    fetchHotelData();
    initDateConstraints();
    initModals();

    const bookingForm = document.querySelector('.booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const reqA = parseInt(document.getElementById('adults').value) || 0;
            const reqC = parseInt(document.getElementById('children').value) || 0;
            performSearch(reqA, reqC);
        });
    }

    const finalForm = document.getElementById('final-booking-form');
    if (finalForm) {
        finalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const gName = document.getElementById('guest-name').value;
            const gPhone = document.getElementById('guest-phone').value;
            const gEmail = document.getElementById('guest-email').value || 'Not provided';
            const gArrival = document.getElementById('guest-arrival').value;
            const gReq = document.getElementById('guest-requests').value || 'None';

            const { name, desc, basePrice, totalPrice, nights, cin, cout, adults, children } = currentBookingSelection;
            const details = desc ? `Combination: ${desc}` : `Room: ${name}`;

            const addBf = document.getElementById('add-breakfast').checked;
            const bfCount = parseInt(document.getElementById('breakfast-count').value) || 1;
            const bfType = document.getElementById('breakfast-type').value;

            let finalPrice = parseInt(totalPrice.replace(/,/g, ''));
            let bfCostStr = "";
            if (addBf) {
                let bfTotalCost = 1200 * bfCount * nights;
                finalPrice += bfTotalCost;
                bfCostStr = `🍳 *Breakfast Added:*\n` +
                            `Type: ${bfType}\n` +
                            `Quantity: ${bfCount} per day\n` +
                            `Cost: Rs ${bfTotalCost.toLocaleString()} (Rs 1200 pp x ${bfCount} x ${nights})\n`;
            }

            const msg = `*New Booking Request!* 🏨\n\n` +
                        `*Guest Details:*\n` +
                        `👤 Name: ${gName}\n` +
                        `📞 Phone: ${gPhone}\n` +
                        `✉️ Email: ${gEmail}\n\n` +
                        `*Stay Details:*\n` +
                        `📅 Check-in: ${cin}\n` +
                        `📅 Check-out: ${cout}\n` +
                        `🌙 Duration: ${nights} ${nights > 1 ? 'Nights' : 'Night'}\n` +
                        `👥 Guests: ${adults} Adults, ${children} Children\n` +
                        `🕒 Est. Arrival: ${gArrival}\n\n` +
                        `*Room Selection:*\n` +
                        `🛏️ ${details}\n` +
                        `💳 Rate: Rs ${basePrice} / night\n` +
                        `💰 *Room Total: Rs ${totalPrice}*\n\n` +
                        bfCostStr +
                        (bfCostStr ? `\n` : ``) +
                        `🔥 *Grand Total: Rs ${finalPrice.toLocaleString()}*\n\n` +
                        `*Special Requests:*\n` +
                        `💬 ${gReq}\n\n` +
                        `Please process my reservation.`;

            window.open(`https://wa.me/923136766699?text=${encodeURIComponent(msg)}`);
        });
    }
});


