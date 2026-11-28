import { NextRequest, NextResponse } from 'next/server';
import { getGoogleOAuthCredentials, saveYouTubeConfig, YT_COOKIE_NAME } from '@/lib/youtubeAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state') || 'web';
  const err = req.nextUrl.searchParams.get('error');

  if (err || !code) {
    return NextResponse.redirect(
      `https://icconline.vercel.app/admin/live-classes?yt_error=cancelled&yt_error_desc=${encodeURIComponent(err || 'Authorization cancelled')}`
    );
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
      const desc = tokenData?.error_description || tokenData?.error || 'Google token exchange failed';
      return NextResponse.redirect(
        `https://icconline.vercel.app/admin/live-classes?yt_error=token_exchange&yt_error_desc=${encodeURIComponent(desc)}`
      );
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

    const configPayload = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + (Number(tokenData.expires_in) || 3600) * 1000,
      channel_id: channelId,
      channel_title: channelTitle,
    };

    await saveYouTubeConfig(configPayload, req);

    const cookieValue = Buffer.from(JSON.stringify(configPayload), 'utf8').toString('base64');
    const appDeepLink = `idealcoaching://admin/go-live?yt_token=${encodeURIComponent(cookieValue)}`;

    const res =
      state === 'app'
        ? new NextResponse(
            `<html><body style="font-family:sans-serif;text-align:center;padding:40px;">
              <h2>YouTube Channel Connected!</h2>
              <p><strong>${channelTitle}</strong> is now connected to IDEAL COACHING CENTRE.</p>
              <p style="margin:24px 0;"><a href="${appDeepLink}" style="background:#dc2626;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold;">Return to ICC App</a></p>
              <script>setTimeout(function(){ window.location.href = ${JSON.stringify(appDeepLink)}; }, 400);</script>
            </body></html>`,
            { status: 200, headers: { 'Content-Type': 'text/html' } }
          )
        : NextResponse.redirect('https://icconline.vercel.app/admin/live-classes?yt_connected=1');

    res.cookies.set(YT_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (e: any) {
    return NextResponse.redirect(
      `https://icconline.vercel.app/admin/live-classes?yt_error=unknown&yt_error_desc=${encodeURIComponent(e?.message || 'Unexpected callback error')}`
    );
  }
}
