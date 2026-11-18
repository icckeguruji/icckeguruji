import { NextResponse } from 'next/server';

// Fast direct download router with edge redirect
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mirror = searchParams.get('mirror');

  const githubReleaseUrl = 'https://github.com/icckeguruji/icckeguruji/releases/download/v1.0.1/ideal-coaching-release.apk';
  const cdnMirrorUrl = 'https://ghproxy.net/https://github.com/icckeguruji/icckeguruji/releases/download/v1.0.1/ideal-coaching-release.apk';

  const targetUrl = mirror === 'cdn' ? cdnMirrorUrl : githubReleaseUrl;

  return NextResponse.redirect(targetUrl, {
    status: 302,
    headers: {
      'Content-Disposition': 'attachment; filename="ideal-coaching-release.apk"',
      'Content-Type': 'application/vnd.android.package-archive',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
