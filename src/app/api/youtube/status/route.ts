import { NextResponse } from 'next/server';
import { getGoogleOAuthCredentials, getYouTubeConfig } from '@/lib/youtubeAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { isConfigured } = getGoogleOAuthCredentials();
  const cfg = await getYouTubeConfig();
  return NextResponse.json({
    configured: isConfigured,
    connected: Boolean(cfg?.access_token),
    channelId: cfg?.channel_id || null,
    channelTitle: cfg?.channel_title || null,
  });
}
