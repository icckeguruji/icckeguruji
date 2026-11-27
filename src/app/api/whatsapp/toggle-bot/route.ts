import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const WA_URL = process.env.WHATSAPP_SERVICE_URL || 'https://icc-whatsapp-miss-zoya.onrender.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${WA_URL}/toggle-bot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {}

  return NextResponse.json({ success: true, isBotEnabled: true });
}
