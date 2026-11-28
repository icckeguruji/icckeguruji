import { NextRequest, NextResponse } from 'next/server';
import { getGoogleOAuthCredentials, getYouTubeConfig } from '@/lib/youtubeAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { isConfigured } = getGoogleOAuthCredentials();
  const cfg = await getYouTubeConfig(req);
  return NextResponse.json(
    {
      configured: isConfigured,
      connected: Boolean(cfg?.access_token),
      channelId: cfg?.channel_id || null,
      channelTitle: cfg?.channel_title || null,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
