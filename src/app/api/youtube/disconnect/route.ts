import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { clearYouTubeConfig } from '@/lib/youtubeAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin login required.' }, { status: 401 });
  }
  await clearYouTubeConfig();
  return NextResponse.json({ success: true });
}
