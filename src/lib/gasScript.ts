/**
 * ICC KE GURUJI — Google Apps Script Email Service Code
 * This code runs inside script.new (Google Apps Script) on the user's Google Account.
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * ICC KE GURUJI — Google Apps Script Email Service (script.new)
 * =========================================================================
 * 
 * 100% Free Gmail Email Service for Password Resets & Admission Alerts!
 * Zero Third-Party Subscriptions • Zero API Limits
 * 
 * 30-Second Setup Guide:
 * 1. Open your browser and type: script.new
 * 2. Delete everything and paste this entire code into the editor.
 * 3. Click 'Deploy' (top right blue button) ➜ 'New deployment'.
 * 4. Click the gear icon ⚙️ ➜ Select 'Web app':
 *    - Description: ICC KE GURUJI Email Service
 *    - Execute as: Me (your Gmail)
 *    - Who has access: Anyone (allows Vercel website to call it)
 * 5. Click 'Deploy' ➜ 'Authorize Access' with your Google account.
 * 6. Copy the generated 'Web app URL' (looks like: https://script.google.com/macros/s/.../exec)
 * 7. Paste it in ICC KE GURUJI Admin Dashboard ➜ Settings ➜ 'Google Apps Script Email URL'.
 */

function doPost(e) {
  try {
    var raw = e.postData.contents;
    var data = JSON.parse(raw);

    var type = data.type || 'forgot_password';
    var to = data.to;
    var studentName = data.studentName || 'Student';
    var coachingName = "ICC KE GURUJI";

    if (!to) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Missing recipient 'to' email address"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var subject = "";
    var htmlBody = "";

    if (type === 'forgot_password') {
      var otp = data.otp || Math.floor(100000 + Math.random() * 900000);
      var resetLink = data.resetLink || "https://icckeguruji.vercel.app/login";

      subject = "🔐 Password Reset Code: " + otp + " — " + coachingName;
      htmlBody = 
        "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;'>" +
          "<div style='background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 24px; text-align: center; color: #ffffff;'>" +
            "<h1 style='margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;'>ICC KE GURUJI</h1>" +
            "<p style='margin: 6px 0 0; font-size: 13px; opacity: 0.9;'>Official Student & Teacher Security Portal</p>" +
          "</div>" +
          "<div style='padding: 30px 24px; color: #1e293b; line-height: 1.6;'>" +
            "<h2 style='font-size: 18px; margin-top: 0;'>Namaste " + studentName + "! 🙏</h2>" +
            "<p style='font-size: 14px; color: #475569;'>Aapne ICC KE GURUJI account ka password reset karne ke liye request kiya hai. Naya password set karne ke liye niche diya gaya 6-digit OTP use karein:</p>" +
            "<div style='text-align: center; margin: 28px 0;'>" +
              "<div style='display: inline-block; background: #f8fafc; border: 2px dashed #2563eb; border-radius: 12px; padding: 14px 28px; font-size: 30px; font-weight: 900; letter-spacing: 6px; color: #1e3a8a; font-family: monospace;'>" +
                otp +
              "</div>" +
              "<p style='margin: 8px 0 0; font-size: 12px; color: #64748b;'>Ye code agle 15 minutes ke liye valid hai.</p>" +
            "</div>" +
            "<div style='background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #1e40af; margin-bottom: 24px;'>" +
              "<strong>💡 Security Tip:</strong> Agar ye request aapne nahi ki hai, toh is email ko ignore karein. Aapka password safe hai." +
            "</div>" +
            "<div style='text-align: center;'>" +
              "<a href='" + resetLink + "' style='display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 24px; border-radius: 10px;'>Login Page Par Jayein ➜</a>" +
            "</div>" +
          "</div>" +
          "<div style='background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;'>" +
            "© 2026 ICC KE GURUJI • Er. Alok Sharma • Automated Security System" +
          "</div>" +
        "</div>";

    } else if (type === 'payment_alert_to_admin') {
      var utr = data.utr || "N/A";
      var amount = data.amount || "999";
      var courseTitle = data.courseTitle || "Physics Mastery";
      var studentPhone = data.studentPhone || "N/A";

      subject = "💰 Naya Admission Payment: ₹" + amount + " (" + studentName + ") — " + coachingName;
      htmlBody =
        "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;'>" +
          "<div style='background: linear-gradient(135deg, #10b981, #059669); padding: 24px; text-align: center; color: #ffffff;'>" +
            "<h1 style='margin: 0; font-size: 22px;'>🎉 Naya Student Enrollment Alert!</h1>" +
            "<p style='margin: 6px 0 0; font-size: 13px;'>Direct UPI Zero Commission Payment</p>" +
          "</div>" +
          "<div style='padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;'>" +
            "<p>Pranam Guruji! Ek naye student ne batch ke liye direct UPI payment submit ki hai:</p>" +
            "<table style='width: 100%; border-collapse: collapse; margin: 16px 0;'>" +
              "<tr style='border-bottom: 1px solid #f1f5f9;'><td style='padding: 8px 0; color: #64748b;'>Student Name:</td><td style='padding: 8px 0; font-weight: bold;'>" + studentName + "</td></tr>" +
              "<tr style='border-bottom: 1px solid #f1f5f9;'><td style='padding: 8px 0; color: #64748b;'>Mobile Number:</td><td style='padding: 8px 0; font-weight: bold;'>" + studentPhone + "</td></tr>" +
              "<tr style='border-bottom: 1px solid #f1f5f9;'><td style='padding: 8px 0; color: #64748b;'>Batch:</td><td style='padding: 8px 0; font-weight: bold;'>" + courseTitle + "</td></tr>" +
              "<tr style='border-bottom: 1px solid #f1f5f9;'><td style='padding: 8px 0; color: #64748b;'>Amount:</td><td style='padding: 8px 0; font-weight: bold; color: #059669; font-size: 16px;'>₹" + amount + "</td></tr>" +
              "<tr style='border-bottom: 1px solid #f1f5f9;'><td style='padding: 8px 0; color: #64748b;'>12-Digit UTR:</td><td style='padding: 8px 0; font-family: monospace; font-weight: bold; color: #1e40af;'>" + utr + "</td></tr>" +
            "</table>" +
            "<p>Aap apne Telegram bot ya Admin Console se 1-click me ise approve kar sakte hain.</p>" +
          "</div>" +
        "</div>";

    } else if (type === 'payment_approved') {
      var courseTitle = data.courseTitle || "Physics Complete Mastery 2026";
      var classroomLink = data.classroomLink || "https://icckeguruji.vercel.app/course/course-1";

      subject = "🎓 Badhai Ho! Aapka Admission Approve Ho Gaya Hai — " + coachingName;
      htmlBody =
        "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;'>" +
          "<div style='background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 24px; text-align: center; color: #ffffff;'>" +
            "<h1 style='margin: 0; font-size: 24px;'>🎉 Admission Confirmed!</h1>" +
            "<p style='margin: 6px 0 0; font-size: 13px;'>Welcome to ICC KE GURUJI Family</p>" +
          "</div>" +
          "<div style='padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;'>" +
            "<h2 style='font-size: 18px;'>Namaste " + studentName + "! 🙏</h2>" +
            "<p>Guruji ne aapka UPI payment verify karke aapka batch unlock kar diya hai.</p>" +
            "<div style='background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin: 16px 0;'>" +
              "<div style='font-size: 16px; font-weight: bold; color: #1e293b;'>" + courseTitle + "</div>" +
              "<div style='font-size: 12px; color: #059669; font-weight: bold; margin-top: 4px;'>✅ Active & Enrolled</div>" +
            "</div>" +
            "<p>Ab aap turant sabhi YouTube Live classes, chapter-wise handwritten PDF notes aur 24/7 AI Doubt Guruji access kar sakte hain:</p>" +
            "<div style='text-align: center; margin: 24px 0;'>" +
              "<a href='" + classroomLink + "' style='display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 28px; border-radius: 10px;'>Open My Classroom ➜</a>" +
            "</div>" +
          "</div>" +
        "</div>";

    } else {
      subject = "✅ ICC KE GURUJI — Email Dispatcher Test Successful!";
      htmlBody = "<h3>Pranam Guruji!</h3><p>Aapka Google Apps Script (script.new) email webhook 100% active aur functional hai. Ab sabhi password reset aur student alerts aapke Gmail se directly bheje jayenge.</p>";
    }

    // Send email using Google Apps Script MailApp
    MailApp.sendEmail({
      to: to,
      subject: subject,
      htmlBody: htmlBody,
      name: coachingName
    });

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Email sent successfully via Google Apps Script (Gmail)!",
      recipient: to,
      type: type,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    service: "ICC KE GURUJI Email Dispatcher Webhook",
    instructions: "POST JSON data with { type, to, studentName, ... } to trigger email alerts."
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
