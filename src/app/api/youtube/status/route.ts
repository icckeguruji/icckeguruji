import { NextRequest, NextResponse } from 'next/server';
import { getGoogleOAuthCredentials, getYouTubeConfig, getYouTubeConfigFromDb, saveYouTubeConfig } from '@/lib/youtubeAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { isConfigured } = getGoogleOAuthCredentials();
  let cfg = await getYouTubeConfigFromDb();
  if (!cfg) {
    const reqCfg = await getYouTubeConfig(req);
    if (reqCfg?.access_token) {
      cfg = reqCfg;
      // Auto-sync existing Web cookie or App header token into Supabase so all devices stay connected
      await saveYouTubeConfig(reqCfg, req);
    }
  }
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
