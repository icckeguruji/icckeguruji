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
