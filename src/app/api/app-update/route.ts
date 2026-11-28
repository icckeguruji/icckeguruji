import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface AppUpdateConfig {
  latest_version: string;
  version_code: number;
  min_required_version: string;
  is_mandatory: boolean;
  apk_download_url: string;
  apk_size_mb: number;
  release_date: string;
  title_en: string;
  title_hi: string;
  changelog_en: string[];
  changelog_hi: string[];
}

const defaultAppUpdate: AppUpdateConfig = {
  latest_version: '1.0.3',
  version_code: 4,
  min_required_version: '1.0.0',
  is_mandatory: false,
  apk_download_url: 'https://github.com/icckeguruji/icckeguruji/releases/download/v1.0.1/ideal-coaching-release.apk',
  apk_size_mb: 21.2,
  release_date: '2026-11-27',
  title_en: 'Major Update Available (v1.0.3)',
  title_hi: 'नया आधिकारिक अपडेट उपलब्ध है (v1.0.3)',
  changelog_en: [
    '100% True Dark Mode across all screens & bottom navigation bar',
    'AI Smart Quiz restored: Course & PDF-based questions (Hindi & Urdu)',
    'Automatic Live-to-Recorded YouTube video promotion after class ends',
    'Fixed Guest Browse Courses & Enrollment Gate + 6-Digit Email OTP Reset',
    'Live Supabase sync for Courses, Subjects, Chapters, Notes & Students'
  ],
  changelog_hi: [
    'पूरी ऐप और बॉटम नेविगेशन बार में 100% क्लियर डार्क मोड',
    'AI स्मार्ट क्विज़ वापस जोड़ा गया (कोर्स व PDF आधारित प्रश्न — हिंदी व उर्दू में)',
    'लाइव क्लास समाप्त होने पर YouTube वीडियो स्वतः रिकॉर्डेड सेक्शन में जुड़ेगा',
    'गेस्ट कोर्स ब्राउज़, एनरोलमेंट गेट एवं 6-अंकों का ईमेल OTP पासवर्ड रीसेट',
    'कोर्स, विषय, अध्याय, नोट्स और विद्यार्थियों का लाइव डेटाबेस सिंक'
  ],
};

async function getLatestGitHubRelease(): Promise<Partial<AppUpdateConfig> | null> {
  try {
    const res = await fetch('https://api.github.com/repos/icckeguruji/icckeguruji/releases/latest', {
      headers: { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'ICC-Online-Updater' },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const rel = await res.json();
    const tag = String(rel.tag_name || '').replace(/^v/i, '').trim();
    if (!tag) return null;

    const buildMatch = String(rel.body || '').match(/Build\s+(\d+)/i);
    const patchNum = parseInt(tag.split('.')[2] || '0', 10) || 0;
    const versionCode = buildMatch ? parseInt(buildMatch[1], 10) : patchNum + 1;

    const assets = Array.isArray(rel.assets) ? rel.assets : [];
    const apkAsset = assets.find((a: any) => a.name?.endsWith('.apk'));
    const apkUrl =
      apkAsset?.browser_download_url ||
      `https://github.com/icckeguruji/icckeguruji/releases/latest/download/ideal-coaching-release.apk`;
    const sizeMb = apkAsset?.size ? Math.round((apkAsset.size / (1024 * 1024)) * 10) / 10 : 27.0;

    return {
      latest_version: tag,
      version_code: versionCode,
      apk_download_url: apkUrl,
      apk_size_mb: sizeMb,
      release_date: (rel.published_at || new Date().toISOString()).split('T')[0],
      title_en: `New Update Available (v${tag})`,
      title_hi: `नया आधिकारिक अपडेट उपलब्ध है (v${tag})`,
    };
  } catch {
    return null;
  }
}

async function getUpdateConfig(): Promise<AppUpdateConfig> {
  let config: AppUpdateConfig = { ...defaultAppUpdate };

  const [dbRes, ghRes] = await Promise.all([
    (async () => {
      if (!isSupabaseConfigured) return null;
      try {
        const { data } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'app_update_config')
          .maybeSingle();
        return data?.value || null;
      } catch {
        return null;
      }
    })(),
    getLatestGitHubRelease(),
  ]);

  if (dbRes && typeof dbRes === 'object') {
    config = { ...config, ...dbRes };
  }

  if (ghRes?.version_code && ghRes.version_code >= (config.version_code || 0)) {
    config = { ...config, ...ghRes };
  }

  return config;
}

export async function GET() {
  const config = await getUpdateConfig();
  return NextResponse.json(config, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated: AppUpdateConfig = {
      ...defaultAppUpdate,
      ...body,
      version_code: Number(body.version_code) || defaultAppUpdate.version_code,
      apk_size_mb: Number(body.apk_size_mb) || defaultAppUpdate.apk_size_mb,
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('platform_settings').upsert({
          key: 'app_update_config',
          value: updated,
          description: 'Android Mobile App Version & In-App Auto-Update Configuration',
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('saveUpdateConfig error:', e);
      }
    }

    return NextResponse.json({ success: true, config: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
