import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const WA_URL = process.env.WHATSAPP_SERVICE_URL || 'https://icc-whatsapp-miss-zoya.onrender.com';

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin login required.' }, { status: 401 });
  }
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
