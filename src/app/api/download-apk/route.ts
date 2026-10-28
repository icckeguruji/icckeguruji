import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const localApkPath = path.join(process.cwd(), 'public', 'downloads', 'icckeguruji.apk');

    if (fs.existsSync(localApkPath)) {
      return NextResponse.redirect(new URL('/downloads/icckeguruji.apk', req.url));
    }

    // Default to the GitHub Releases latest download URL
    const githubReleaseUrl =
      process.env.APK_DOWNLOAD_URL ||
      'https://github.com/icckeguruji/icckeguruji/releases/latest/download/icckeguruji.apk';

    return NextResponse.redirect(githubReleaseUrl, { status: 307 });
  } catch (error) {
    console.error('APK Download Route Error:', error);
    return NextResponse.redirect(
      'https://github.com/icckeguruji/icckeguruji/releases/latest/download/icckeguruji.apk',
      { status: 307 }
    );
  }
}
