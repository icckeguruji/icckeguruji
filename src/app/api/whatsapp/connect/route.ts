import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const WA_URL = process.env.WHATSAPP_SERVICE_URL || 'https://icc-whatsapp-miss-zoya.onrender.com';

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin login required.' }, { status: 401 });
  }
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(`${WA_URL}/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ success: false, error: 'Failed to initiate WhatsApp connection' }, { status: 500 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'WhatsApp Baileys Service is not running. Start it with "npm run dev:whatsapp" (or set WHATSAPP_SERVICE_URL).',
    });
  }
}
