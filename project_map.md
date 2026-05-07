# Hayyat Luxury Hotel Apartments - Project Map

## 🏨 Project Overview
A premium, modern, and high-performance hotel apartment website for **Hayyat Luxury Hotel Apartments, Lahore**. The site is designed to feel premium with rich aesthetics, smooth animations, and a seamless booking flow.

- **URL:** https://hayyathotels.com
- **Hosting:** GitHub Pages (Static)
- **Deployment Date (Migration from Wix):** April 2026

## 🛠️ Technology Stack
- **Frontend:** HTML5, Vanilla CSS3 (Custom Design System), Vanilla JavaScript (ES6+).
- **Backend (Serverless):** 
    - **Google Sheets API:** Acts as the CMS for Room Prices, Inventory, and Gallery.
    - **Google Apps Script:** Handles form submissions and email notifications.
- **Libraries:**
    - **FontAwesome:** Icons.
    - **Google Fonts:** Outfit & Playfair Display.
    - **html2pdf.js:** For generating instant reservation receipts for guests.

## 📁 File Structure
- `index.html`: Main landing page, SEO head tags, and booking modals.
- `style.css`: Custom design system, responsive layouts, and animations.
- `script.js`: Core engine (Sheets fetching, Search logic, Checkout flow, PDF gen).
- `sitemap.xml`: SEO sitemap with updated `lastmod` signals.
- `robots.txt`: Crawler instructions.
- `CNAME`: Domain mapping for `hayyathotels.com`.

## ⚙️ Core Integrations
- **Google Sheets CMS:**
    - **Sheet ID:** `1PxkC_kniknYbxFRV6brev1Fv3y_ZrPx2AHEcKkYbJhY`
    - **Data Columns:** Room Type, Price, Main Image, Gallery, Inventory, Capacity, Hero Images, Breakfast Price.
- **Booking Webhook:**
    - **Service:** Google Apps Script.
    - **Endpoint:** `https://script.google.com/macros/s/AKfycbyCIp5BWdtdw1kLzVXuofmvhx8on-4ESR6aqHxJQ1jFjbHEqGoER3Z3_-hDQITHc14E/exec`
    - **Action:** Sends a `POST` request with guest details when a booking is confirmed.

## 🚀 Key Features
1. **Dynamic Pricing:** Prices are fetched in real-time from Google Sheets.
2. **Smart Suite Search:** An algorithm that finds the best room or combination of rooms (Group Booking) based on guest count.
3. **Automated Checkout:** Guests enter details, a notification is sent to management, and a PDF receipt is generated for the guest.
4. **Guest Gallery Reel:** A scrolling slideshow of guest moments fetched from Google Sheets.
5. **Mobile First:** Fully optimized for touch devices with swipeable galleries.

## ✨ UX & Feature Updates (May 2026)
- **Multi-Currency Viewer:** Real-time exchange rate integration via Frankfurter API. Allows users to view prices in USD, EUR, and GBP dynamically across room cards, booking modals, summary panels, and final PDF receipts.
- **Mobile Header Optimization:** Cleaned up mobile navigation by converting the currency selector to a borderless text link and hiding redundant "Book Now" buttons to prevent layout crowding.
- **Neighborhood Map UX:** Split-view approach where Desktop uses interactive Google Maps iframes with dynamic route rendering, while Mobile uses horizontal pill-buttons linking out to native map applications for better performance.
- **Custom Currency Selector (Dual-Screen Fix):** Replaced native `<select>` with a custom HTML/CSS dropdown to resolve rendering issues in WindowTop software on dual-screen setups. Ensures visibility on both staff laptop and guest monitors.
- **Mobile Location Layout:** Optimized the "Explore Lahore" section for mobile by allowing location tags to wrap to multiple rows, ensuring all points of interest are immediately accessible without swiping.

## 🔍 SEO Strategy (May 2026 Updates)
- **Canonicalization:** Fixed to `https://hayyathotels.com/` to overwrite old Wix indexing.
- **Enhanced Schema:** Implemented `LodgingBusiness` JSON-LD with individual `HotelRoom` offers to feed Google Hotel Search.
- **Social Graph:** Linked via `sameAs` to Instagram, Facebook, Booking.com, and TripAdvisor.
- **Robots:** Explicit indexing instructions added to `<head>`.

## 📝 Maintenance Notes
- To update prices or room images, edit the linked **Google Sheet (Sheet1)**.
- To add/remove deals, edit the **Deals** tab in the Google Sheet.
- Versioning is controlled by `APP_VERSION` in `script.js` and cell `K1` in the Sheet. If they don't match, the site prompts for a refresh.
