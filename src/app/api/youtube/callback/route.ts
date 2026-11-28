import { NextRequest, NextResponse } from 'next/server';
import { getGoogleOAuthCredentials, saveYouTubeConfig } from '@/lib/youtubeAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state') || 'web';
  const err = req.nextUrl.searchParams.get('error');

  if (err || !code) {
    return NextResponse.redirect('https://icconline.vercel.app/admin/live-classes?yt_error=cancelled');
  }

  const { clientId, clientSecret, redirectUri } = getGoogleOAuthCredentials();
  if (!clientId || !clientSecret) {
    return NextResponse.redirect('https://icconline.vercel.app/admin/live-classes?yt_error=not_configured');
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return NextResponse.redirect('https://icconline.vercel.app/admin/live-classes?yt_error=token_exchange');
    }

    let channelId = '';
    let channelTitle = 'Connected YouTube Channel';
    try {
      const chRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const chData = await chRes.json();
      const ch = chData?.items?.[0];
      if (ch) {
        channelId = ch.id || '';
        channelTitle = ch.snippet?.title || channelTitle;
      }
    } catch {}

    await saveYouTubeConfig({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + (Number(tokenData.expires_in) || 3600) * 1000,
      channel_id: channelId,
      channel_title: channelTitle,
    });

    if (state === 'app') {
      return new NextResponse(
        `<html><body style="font-family:sans-serif;text-align:center;padding:40px;">
          <h2>YouTube Channel Connected!</h2>
          <p><strong>${channelTitle}</strong> is now connected to IDEAL COACHING CENTRE.</p>
          <p>You can close this window and return to the app.</p>
        </body></html>`,
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );
    }

    return NextResponse.redirect('https://icconline.vercel.app/admin/live-classes?yt_connected=1');
  } catch {
    return NextResponse.redirect('https://icconline.vercel.app/admin/live-classes?yt_error=unknown');
  }
}
