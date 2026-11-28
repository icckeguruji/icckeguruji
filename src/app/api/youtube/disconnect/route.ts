import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { clearYouTubeConfig, YT_COOKIE_NAME } from '@/lib/youtubeAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin login required.' }, { status: 401 });
  }
  await clearYouTubeConfig(req);
  const res = NextResponse.json({ success: true });
  res.cookies.delete(YT_COOKIE_NAME);
  return res;
}
