# Google Apps Script for Hayyat Hotels

The reason the email failed is because your Google Apps Script is still looking for the variables from your **other app** (like `customerName`, `orderSummary` and `split('[ITEM_')`). 
Because the booking payload for the hotel does not contain these variables, your script encounters an error and crashes before it can send the email.

To fix this, you must deploy a NEW Apps Script Web App specifically designed to handle the hotel's `reservationData` payload.

**Follow these exact steps:**

1. Go to [script.google.com](https://script.google.com/) and create a **New Project**.
2. Name it "Hayyat Hotel Webhook".
3. Delete any code currently in the editor and **paste the following code block** exactly as it is:

```javascript
function doPost(e) {
  try {
    // 1. Get the booking data from the website
    const data = JSON.parse(e.postData.contents);

    // 2. Prepare Email Subject
    const emailSubject = `(NEW BOOKING) Hayyat Hotels - ${data.name}`;

    // 3. Prepare Email Body
    let emailBody = `NEW RESERVATION REQUEST
================================

GUEST INFORMATION:
-----------------
Name: ${data.name}
Country: ${data.country}
Phone: ${data.phone}
Email: ${data.email}

STAY DETAILS:
-----------------
Check-in: ${data.checkin}
Check-out: ${data.checkout}
Duration: ${data.nights} Nights
Guests: ${data.adults} Adults, ${data.children} Children

ACCOMMODATION & BILLING:
-----------------
Room: ${data.roomDetails}
Stay: ${data.nights} ${data.nights > 1 ? 'Nights' : 'Night'}

Base Rate: Rs ${data.perNightRate} / night
Discount: ${data.discountApplied}
Net Rate: Rs ${data.netRate} / night (after discount)

Room Subtotal: Rs ${data.roomTotal}
Breakfast: ${data.breakfastCharges} (Qty: ${data.breakfastCount})

-----------------
GRAND TOTAL: Rs ${data.totalPrice}
-----------------

Special Requests: ${data.specialRequests}

================================
Booking Submitted at: ${new Date().toLocaleString()}
`;

    // 4. Send email (using GmailApp)
    GmailApp.sendEmail("info@hayyathotels.com", emailSubject, emailBody);

    // 5. Return success response
    return ContentService.createTextOutput("Email sent successfully");
    
  } catch(error) {
    // If something goes wrong, log the error and return it
    console.error(error);
    return ContentService.createTextOutput("Error: " + error.message);
  }
}

```

4. Click the **Deploy** button at the top right, then select **New Deployment**.
5. Click the "gear" icon next to "Select type" and choose **Web app**.
6. Set the configuration exactly to:
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Click **Deploy**. (You will need to click "Authorize access", then "Advanced", and "Go to Hayyat Hotel Webhook (unsafe)").
8. Copy the **Web app URL** it provides.

**Once you have the NEW Web App URL, replace the URL in `script.js` (line 1202) and you will receive instant emails perfectly!**
