import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch('http://localhost:5001/connect', {
      method: 'POST',
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ success: false, error: 'Failed to initiate WhatsApp connection' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: 'WhatsApp Background Service is not running on port 5001. Please run "npm run dev:whatsapp" or start the node service.',
    });
  }
}
