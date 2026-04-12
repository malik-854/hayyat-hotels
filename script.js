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
async function fetchHotelData() {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!A2:G?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.values) {
            data.values.forEach(row => {
                const [type, price, mainImg, gallery, inventory, adultsCap, childrenCap] = row;
                sheetData[type.trim()] = {
                    price: price,
                    mainImg: mainImg,
                    gallery: gallery ? gallery.split(',').map(s => s.trim()) : [],
                    inventory: parseInt(inventory) || 0,
                    adults: parseInt(adultsCap) || 2,
                    children: parseInt(childrenCap) || 0
                };
            });
            updateRoomCards();
        }
    } catch (error) {
        console.error('Error fetching hotel data:', error);
    }
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
    const thumbRow = document.getElementById('modal-thumbnails');
    let images = sData ? [...sData.gallery] : [];
    if (sData && sData.mainImg) images.unshift(sData.mainImg);

    if (images.length > 0) {
        mainImg.src = images[0];
        thumbRow.innerHTML = images.map((img, i) => `
            <img src="${img}" class="${i === 0 ? 'active' : ''}" onclick="changeModalImg(this, '${img}')">
        `).join('');
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

window.changeModalImg = function(el, src) {
    document.getElementById('modal-main-img').src = src;
    document.querySelectorAll('.thumbnail-row img').forEach(img => img.classList.remove('active'));
    el.classList.add('active');
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
        if (reqA <= room.adults && totalReq <= (room.adults + room.children)) {
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
        let tempA = reqA;
        let tempC = reqC;
        let combo = [];
        let invTracker = {};
        Object.keys(sheetData).forEach(t => invTracker[t] = sheetData[t].inventory);

        // Force the first room
        combo.push(startType);
        invTracker[startType]--;
        let r1 = sheetData[startType];
        let a1 = Math.min(tempA, r1.adults);
        tempA -= a1;
        tempC -= Math.min(tempC, (r1.adults + r1.children - a1));

        // Fill greedily with available rooms
        const sortedByCap = [...allAvailable].sort((a, b) => (sheetData[b].adults + sheetData[b].children) - (sheetData[a].adults + sheetData[a].children));
        
        while (tempA > 0 || tempC > 0) {
            let found = false;
            for (let type of sortedByCap) {
                if (invTracker[type] > 0) {
                    const r = sheetData[type];
                    combo.push(type);
                    invTracker[type]--;
                    let aCov = Math.min(tempA, r.adults);
                    tempA -= aCov;
                    tempC -= Math.min(tempC, (r.adults + r.children - aCov));
                    found = true;
                    break;
                }
            }
            if (!found) break;
        }

        if (tempA <= 0 && tempC <= 0 && combo.length > 1) {
            let counts = {};
            combo.sort().forEach(t => counts[t] = (counts[t] || 0) + 1);
            let comboKey = JSON.stringify(counts);
            if (!uniqueCombos.has(comboKey)) {
                uniqueCombos.add(comboKey);
                let totalPrice = combo.reduce((s, t) => s + parseInt(sheetData[t].price.replace(/,/g, '')), 0);
                let comboDesc = Object.entries(counts).map(([t, c]) => `${c} x ${t}`).join(' + ');
                
                matches.push({
                    isGroup: true,
                    name: "Recommended Combination",
                    desc: comboDesc,
                    price: totalPrice.toLocaleString(),
                    totalPriceVal: totalPrice,
                    capacity: `${reqA} Adults, ${reqC} Children`
                });
            }
        }
    });

    // 3. Efficiency Filter: Only keep "Optimal" choices
    // A choice is optimal if there isn't another choice that has FEWER rooms AND LOWER/Equal price
    let optimalMatches = matches.filter(m1 => {
        const rooms1 = m1.isGroup ? m1.desc.split('+').reduce((sum, s) => sum + parseInt(s), 0) : 1;
        return !matches.some(m2 => {
            if (m1 === m2) return false;
            const rooms2 = m2.isGroup ? m2.desc.split('+').reduce((sum, s) => sum + parseInt(s), 0) : 1;
            // If m2 is both cheaper/equal AND has fewer rooms, m1 is inefficient
            return (m2.totalPriceVal <= m1.totalPriceVal && rooms2 < rooms1);
        });
    });

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
    const thumbRow = document.getElementById('modal-thumbnails');
    let images = sData ? [...sData.gallery] : [];
    if (sData && sData.mainImg) images.unshift(sData.mainImg);

    if (images.length > 0) {
        mainImg.src = images[0];
        thumbRow.innerHTML = images.map((img, i) => `
            <img src="${img}" class="${i === 0 ? 'active' : ''}" onclick="changeModalImg(this, '${img}')">
        `).join('');
    }
}


window.bookSelection = function(name, desc, price) {
    const cin = document.getElementById('checkin') ? document.getElementById('checkin').value : '';
    const cout = document.getElementById('checkout') ? document.getElementById('checkout').value : '';
    const reqA = document.getElementById('adults') ? document.getElementById('adults').value : '2';
    const reqC = document.getElementById('children') ? document.getElementById('children').value : '0';

    currentBookingSelection = {
        name: name,
        desc: desc,
        price: price,
        cin: cin,
        cout: cout,
        adults: reqA,
        children: reqC
    };

    // Populate Sidebar Summary
    document.getElementById('summary-dates').innerText = `${cin} to ${cout}`;
    document.getElementById('summary-guests').innerText = `${reqA} Adults, ${reqC} Children`;
    document.getElementById('summary-room-name').innerText = name;
    
    const descContainer = document.getElementById('summary-room-desc-container');
    if (desc) {
        document.getElementById('summary-room-desc').innerText = desc;
        descContainer.style.display = 'flex';
    } else {
        descContainer.style.display = 'none';
    }
    
    document.getElementById('summary-price').innerText = `Rs ${price}`;

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
    closeModal = document.querySelector('.close-modal');
    closeResults = document.querySelector('.close-results');
    closeCheckout = document.querySelector('.close-checkout');

    document.querySelectorAll('.open-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.room-card');
            const roomType = card.getAttribute('data-room');
            openRoomModal(roomType);
        });
    });

    [closeModal, closeResults, closeCheckout].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                if (modal) modal.classList.remove('active');
                if (resultsModal) resultsModal.classList.remove('active');
                if (checkoutModal) checkoutModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal || e.target === resultsModal || e.target === checkoutModal) {
            if (modal) modal.classList.remove('active');
            if (resultsModal) resultsModal.classList.remove('active');
            if (checkoutModal) checkoutModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
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

            const { name, desc, price, cin, cout, adults, children } = currentBookingSelection;
            const details = desc ? `Combination: ${desc}` : `Room: ${name}`;

            const msg = `*New Booking Request!* 🏨\n\n` +
                        `*Guest Details:*\n` +
                        `👤 Name: ${gName}\n` +
                        `📞 Phone: ${gPhone}\n` +
                        `✉️ Email: ${gEmail}\n\n` +
                        `*Stay Details:*\n` +
                        `📅 Check-in: ${cin}\n` +
                        `📅 Check-out: ${cout}\n` +
                        `👥 Guests: ${adults} Adults, ${children} Children\n` +
                        `🕒 Est. Arrival: ${gArrival}\n\n` +
                        `*Room Selection:*\n` +
                        `🛏️ ${details}\n` +
                        `💰 Quoted Price: Rs ${price} / night\n\n` +
                        `*Special Requests:*\n` +
                        `💬 ${gReq}\n\n` +
                        `Please process my reservation.`;

            window.open(`https://wa.me/923136766699?text=${encodeURIComponent(msg)}`);
        });
    }
});


