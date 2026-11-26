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
  latest_version: '1.0.2',
  version_code: 3,
  min_required_version: '1.0.0',
  is_mandatory: false,
  apk_download_url: 'https://github.com/icckeguruji/icckeguruji/releases/download/v1.0.1/ideal-coaching-release.apk',
  apk_size_mb: 20.4,
  release_date: '2026-11-26',
  title_en: 'Official Update Available (v1.0.2)',
  title_hi: 'नया आधिकारिक अपडेट उपलब्ध है (v1.0.2)',
  changelog_en: [
    'Fixed Add Chapter & Subject button layout on all mobile screens',
    'Real-time Video and Handwritten Notes counters on Subject & Chapter cards',
    'Hindi Title option for Subjects, Disciplines, and Chapters',
    'Background auto-download with notification bar progress and auto-install',
    'AMOLED pure black theme optimizations for battery saving'
  ],
  changelog_hi: [
    'मोबाइल स्क्रीन पर अध्याय एवं विषय जोड़ने वाले बटन का लेआउट ठीक किया गया',
    'विषय और अध्याय के बाहर वीडियो और हस्तलिखित नोट्स की वास्तविक संख्या',
    'विषय और अध्याय में हिंदी नाम (Title in Hindi) दर्ज करने की सुविधा',
    'बैकग्राउंड ऑटो-डाउनलोड, नोटिफिकेशन बार में प्रोग्रेस एवं स्वतः इंस्टॉलेशन',
    'AMOLED प्योर ब्लैक डार्क मोड और बैटरी बचत में सुधार'
  ],
};

async function getUpdateConfig(): Promise<AppUpdateConfig> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'app_update_config')
        .maybeSingle();

      if (!error && data?.value && typeof data.value === 'object') {
        return {
          ...defaultAppUpdate,
          ...data.value,
        };
      }
    } catch (e) {
      console.warn('getUpdateConfig error:', e);
    }
  }
  return defaultAppUpdate;
}

export async function GET() {
  const config = await getUpdateConfig();
  return NextResponse.json(config, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
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
