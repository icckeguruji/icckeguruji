import { supabase, isSupabaseConfigured } from './supabase';

export interface YouTubeOAuthConfig {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  channel_id?: string;
  channel_title?: string;
  updated_at?: string;
}

export function getGoogleOAuthCredentials() {
  const clientId = (process.env.GOOGLE_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || process.env.YOUTUBE_CLIENT_SECRET || '').trim();
  const redirectUri = (
    process.env.GOOGLE_REDIRECT_URI ||
    'https://icconline.vercel.app/api/youtube/callback'
  ).trim();
  return { clientId, clientSecret, redirectUri, isConfigured: Boolean(clientId && clientSecret) };
}

export async function getYouTubeConfig(): Promise<YouTubeOAuthConfig | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'youtube_oauth_config')
      .maybeSingle();
    if (data?.value && typeof data.value === 'object' && (data.value as any).access_token) {
      return data.value as YouTubeOAuthConfig;
    }
  } catch {}
  return null;
}

export async function saveYouTubeConfig(cfg: YouTubeOAuthConfig): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from('platform_settings').upsert({
    key: 'youtube_oauth_config',
    value: { ...cfg, updated_at: new Date().toISOString() },
    updated_at: new Date().toISOString(),
  });
}

export async function clearYouTubeConfig(): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from('platform_settings').delete().eq('key', 'youtube_oauth_config');
}

export async function getValidYouTubeAccessToken(): Promise<string> {
  const cfg = await getYouTubeConfig();
  if (!cfg?.access_token) {
    throw new Error('YouTube channel is not connected. Please connect your YouTube channel first.');
  }
  if (cfg.expires_at && Date.now() < cfg.expires_at - 60_000) {
    return cfg.access_token;
  }
  if (!cfg.refresh_token) {
    throw new Error('YouTube session expired. Please reconnect your YouTube channel.');
  }

  const { clientId, clientSecret } = getGoogleOAuthCredentials();
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials are missing on the server.');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: cfg.refresh_token,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || 'Failed to refresh YouTube access token.');
  }

  await saveYouTubeConfig({
    ...cfg,
    access_token: data.access_token,
    expires_at: Date.now() + (Number(data.expires_in) || 3600) * 1000,
  });

  return data.access_token;
}
