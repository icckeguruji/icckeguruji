import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const WA_URL = process.env.WHATSAPP_SERVICE_URL || 'https://icc-whatsapp-miss-zoya.onrender.com';

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin login required.' }, { status: 401 });
  }
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
