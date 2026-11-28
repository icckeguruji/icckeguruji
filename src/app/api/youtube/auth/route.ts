import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { getGoogleOAuthCredentials } from '@/lib/youtubeAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const source = req.nextUrl.searchParams.get('source') || 'web';
  if (source !== 'app' && !isAdminRequest(req)) {
    return NextResponse.redirect(new URL('/login?error=admin_session_expired', req.url));
  }

  const { clientId, isConfigured, redirectUri } = getGoogleOAuthCredentials();
  if (!isConfigured) {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;padding:32px;max-width:560px;margin:auto;">
        <h2>YouTube OAuth Setup Required</h2>
        <p>Add <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> in your Vercel Environment Variables, and add <code>${redirectUri}</code> as an Authorized Redirect URI in Google Cloud Console.</p>
        <p><a href="/admin/live-classes">Back to Live Classes</a></p>
      </body></html>`,
      { status: 400, headers: { 'Content-Type': 'text/html' } }
    );
  }

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.force-ssl');
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', source);

  return NextResponse.redirect(authUrl.toString());
}
