import { NextRequest, NextResponse } from 'next/server';

/**
 * IDEAL COACHING CENTRE — GOOGLE APPS SCRIPT FREE EMAIL ENGINE
 * Zero paid SMTP / Zero third-party mailer fees.
 * Uses a deployed Google Apps Script Web App (from script.new) using MailApp.sendEmail()
 * Standard Gmail: 100 emails / day (100% free)
 * Google Workspace: 1,500 emails / day
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, htmlBody, body: plainTextBody, type = 'notification' } = body;

    if (!to || !to.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid recipient email address is required.' },
        { status: 400 }
      );
    }

    const scriptUrl =
      process.env.GOOGLE_APPS_SCRIPT_EMAIL_URL ||
      process.env.APPS_SCRIPT_EMAIL_URL ||
      process.env.APPS_SCRIPT_URL;

    // Standardized branded HTML wrapper if raw text or minimal HTML passed
    const brandedHtml =
      htmlBody ||
      `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px;">
          <h1 style="color: #1e3a8a; margin: 0; font-size: 22px; font-weight: 800;">IDEAL COACHING CENTRE</h1>
          <p style="color: #b45309; font-weight: 700; margin: 4px 0 0 0; font-size: 13px; text-transform: uppercase;">Director: BADE SIR</p>
          <p style="color: #64748b; font-size: 11px; margin: 2px 0 0 0;">Sarotiya, Mahagama, Godda (JH) 814165 • BSEB & JAC</p>
        </div>
        <div style="color: #334155; font-size: 14px; line-height: 1.6;">
          <h2 style="color: #0f172a; font-size: 16px; margin: 0 0 12px 0;">${subject}</h2>
          <div style="white-space: pre-wrap;">${plainTextBody || ''}</div>
        </div>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 11px;">
          <p style="margin: 0;">IDEAL COACHING CENTRE • Helpline WhatsApp: +91 9771350910</p>
          <p style="margin: 4px 0 0 0;">This email was sent via Google Apps Script Free Web App Engine.</p>
        </div>
      </div>
    `;

    if (scriptUrl && scriptUrl.startsWith('https://script.google.com/')) {
      try {
        const scriptRes = await fetch(scriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to,
            subject: subject || 'IDEAL COACHING CENTRE Notification',
            htmlBody: brandedHtml,
            body: plainTextBody || subject || 'Notification from IDEAL COACHING CENTRE',
            senderName: 'IDEAL COACHING CENTRE (BADE SIR)',
          }),
        });

        const scriptJson = await scriptRes.json().catch(() => ({ status: 'unknown' }));

        return NextResponse.json({
          success: true,
          delivered: true,
          provider: 'google-apps-script',
          response: scriptJson,
          recipient: to,
        });
      } catch (err: any) {
        console.warn('Google Apps Script forward error:', err);
        return NextResponse.json({
          success: true,
          delivered: false,
          fallbackLogged: true,
          recipient: to,
          warning: 'Failed to contact Apps Script URL, simulated fallback accepted.',
        });
      }
    }

    // If scriptUrl is not configured, log and return graceful simulated success
    console.log(`[Google Apps Script Email Simulation] To: ${to} | Subject: ${subject} | Type: ${type}`);

    return NextResponse.json({
      success: true,
      delivered: false,
      simulated: true,
      recipient: to,
      note: 'Google Apps Script Web App URL not yet configured in GOOGLE_APPS_SCRIPT_EMAIL_URL environment variable. Ready for deployment.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
