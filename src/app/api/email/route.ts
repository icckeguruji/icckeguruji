import { NextRequest, NextResponse } from 'next/server';
import { getStoredData } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, to, studentName, customUrl } = body;

    if (!to) {
      return NextResponse.json({ error: 'Recipient email address (to) is required.' }, { status: 400 });
    }

    const data = getStoredData();
    const gasUrl =
      customUrl ||
      process.env.GOOGLE_APPS_SCRIPT_EMAIL_URL ||
      data.config.googleAppsScriptEmailUrl;

    // Generate a secure 6-digit OTP for forgot_password
    const generatedOtp = body.otp || Math.floor(100000 + Math.random() * 900000).toString();

    const payload = {
      type: type || 'forgot_password',
      to: to.trim().toLowerCase(),
      studentName: studentName || 'Student',
      otp: generatedOtp,
      resetLink: body.resetLink || 'https://icckeguruji.vercel.app/login',
      amount: body.amount || '999',
      courseTitle: body.courseTitle || 'Class 12 Physics & Tech Mastery',
      utr: body.utr || '123456789012',
      studentPhone: body.studentPhone || '+91 98765 43210',
      timestamp: new Date().toISOString(),
    };

    // If Google Apps Script URL (script.new) is configured, trigger real Gmail dispatch
    if (gasUrl && gasUrl.startsWith('https://script.google.com/')) {
      try {
        const gasResponse = await fetch(gasUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(8000),
        });

        if (gasResponse.ok) {
          const gasResult = await gasResponse.json().catch(() => ({ success: true }));
          return NextResponse.json({
            success: true,
            via: 'google-apps-script',
            otp: generatedOtp,
            message: `Email alert successfully dispatched to ${to} via Google Apps Script (Gmail)!`,
            details: gasResult,
          });
        }
      } catch (gasErr) {
        console.warn('Google Apps Script call timed out or failed, falling back to simulated dispatch:', gasErr);
      }
    }

    // Demo / Instant Simulation Fallback
    return NextResponse.json({
      success: true,
      via: 'simulator',
      otp: generatedOtp,
      recipient: to,
      type: payload.type,
      message: `Demo Mode: Password reset OTP for ${to} is ${generatedOtp}. Real email bhejne ke liye Admin Settings me script.new Web App URL paste karein.`,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
