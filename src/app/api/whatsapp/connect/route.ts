import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const WA_URL = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:5001';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
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
