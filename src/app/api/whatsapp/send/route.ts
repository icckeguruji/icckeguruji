import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const WA_URL = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:5001';

export async function POST(req: NextRequest) {
  try {
    const { phone, message } = await req.json();
    if (!phone || !message) {
      return NextResponse.json({ success: false, error: 'phone and message are required' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${WA_URL}/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message }),
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : 400 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'WhatsApp Baileys service is offline or unreachable.' },
      { status: 503 }
    );
  }
}
