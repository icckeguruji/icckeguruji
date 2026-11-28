import { NextResponse } from 'next/server';

// Fast direct download router with edge redirect to latest GitHub release
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mirror = searchParams.get('mirror');

  let githubReleaseUrl = 'https://github.com/icckeguruji/icckeguruji/releases/latest/download/ideal-coaching-release.apk';
  try {
    const res = await fetch('https://api.github.com/repos/icckeguruji/icckeguruji/releases/latest', {
      headers: { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'ICC-Online-Updater' },
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const rel = await res.json();
      const apkAsset = Array.isArray(rel.assets) ? rel.assets.find((a: any) => a.name?.endsWith('.apk')) : null;
      if (apkAsset?.browser_download_url) {
        githubReleaseUrl = apkAsset.browser_download_url;
      }
    }
  } catch {}

  const cdnMirrorUrl = `https://ghproxy.net/${githubReleaseUrl}`;
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
