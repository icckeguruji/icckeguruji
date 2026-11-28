import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const WA_URL = process.env.WHATSAPP_SERVICE_URL || 'https://icc-whatsapp-miss-zoya.onrender.com';

/**
 * Broadcasts a WhatsApp auto-alert (e.g., Live Class scheduled or Quiz reminder)
 * to a bounded list of student/guardian phone numbers via Miss Zoya Baileys service.
 * Never throws or blocks if the WhatsApp service is offline.
 */
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin login required.' }, { status: 401 });
  }

  try {
    const { phones, message } = await req.json();
    if (!Array.isArray(phones) || phones.length === 0 || !message) {
      return NextResponse.json({ success: false, error: 'phones[] and message are required' }, { status: 400 });
    }

    const targets = phones
      .map((p: string) => String(p || '').replace(/\D/g, ''))
      .filter((p: string) => p.length >= 10)
      .slice(0, 50);

    let sent = 0;
    for (const phone of targets) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${WA_URL}/send-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, message }),
          signal: controller.signal,
          cache: 'no-store',
        });
        clearTimeout(timeout);
        if (res.ok) sent++;
      } catch {
        // Skip failed recipient and continue
      }
    }

    return NextResponse.json({ success: true, total: targets.length, sent });
  } catch {
    return NextResponse.json(
      { success: false, error: 'WhatsApp auto-alert service unavailable.' },
      { status: 503 }
    );
  }
}
