# IDEAL COACHING CENTRE — 100% Free Email Integration Guide
## Powered by Google Apps Script (`script.new`)

This service allows **IDEAL COACHING CENTRE** to dispatch course enrollment approval notifications, student welcome emails, and password resets directly to students and parents at **₹0 cost forever** with **zero paid SMTP or third-party email gateway subscriptions**.

- **Standard Free Gmail**: 100 emails / day (Free forever)
- **Google Workspace**: 1,500 emails / day

---

### Step 1: Open Google Apps Script
1. Open your browser and go to: **[https://script.new](https://script.new)** (Sign in with your institute Gmail account, e.g. `icckeguruji@gmail.com`).
2. Rename the project title from "Untitled project" to `ICC Email Webhook`.

---

### Step 2: Paste the Webhook Code
Delete any default code in `Code.gs` and paste the following snippet:

```javascript
/**
 * IDEAL COACHING CENTRE — Free Email Dispatch Web App
 * Director: BADE SIR | Location: Sarotiya, Mahagama, Godda (JH)
 */

function doPost(e) {
  try {
    var rawData = e.postData ? e.postData.contents : "{}";
    var data = JSON.parse(rawData);
    
    var to = data.to;
    var subject = data.subject || "IDEAL COACHING CENTRE Notification";
    var htmlBody = data.htmlBody || "";
    var body = data.body || "Notification from IDEAL COACHING CENTRE";
    var senderName = data.senderName || "IDEAL COACHING CENTRE (BADE SIR)";
    
    if (!to) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Missing recipient 'to' address"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    MailApp.sendEmail({
      to: to,
      subject: subject,
      body: body,
      htmlBody: htmlBody,
      name: senderName
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      delivered: true,
      recipient: to,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "IDEAL COACHING CENTRE Free Email Webhook",
    director: "BADE SIR",
    location: "Sarotiya, Mahagama, Godda (JH)"
  })).setMimeType(ContentService.MimeType.JSON);
}
```

---

### Step 3: Deploy as Web App
1. Click the blue **Deploy** button at the top-right -> Select **New deployment**.
2. Click the gear icon (⚙️) next to "Select type" and select **Web app**.
3. Configure the settings:
   - **Description**: `ICC Email Webhook v1`
   - **Execute as**: `Me (your email address)`
   - **Who has access**: `Anyone` *(Crucial so our Next.js API can trigger it)*
4. Click **Deploy**.
5. Google will ask to **Authorize access**:
   - Click *Review permissions*
   - Select your Google account
   - Click *Advanced* -> Click *Go to ICC Email Webhook (unsafe)* -> Click *Allow*.
6. Copy the **Web App URL** provided (Format: `https://script.google.com/macros/s/AKfycb.../exec`).

---

### Step 4: Add to Environment Variables
In `apps/admin-web/.env.local` (and your production deployment environment):

```bash
GOOGLE_APPS_SCRIPT_EMAIL_URL="https://script.google.com/macros/s/AKfycb.../exec"
```

Once added, every payment approval in the Admin Dashboard automatically triggers a professional confirmation email to the student with zero manual effort!
