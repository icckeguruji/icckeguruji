import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const WA_URL = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:5001';

export async function POST() {
  try {
    const res = await fetch(`${WA_URL}/disconnect`, {
      method: 'POST',
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {}

  return NextResponse.json({ success: true, message: 'Disconnected locally' });
}
