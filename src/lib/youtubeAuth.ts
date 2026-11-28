import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { supabase, isSupabaseConfigured, LIVE_SUPABASE_URL, LIVE_SUPABASE_ANON_KEY } from './supabase';

export interface YouTubeOAuthConfig {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  channel_id?: string;
  channel_title?: string;
  updated_at?: string;
}

export const YT_COOKIE_NAME = 'icc-yt-oauth';
const YT_NOTIF_FALLBACK_ID = '00000000-0000-0000-0000-000000007974';

export function getGoogleOAuthCredentials() {
  const clientId = (process.env.GOOGLE_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || process.env.YOUTUBE_CLIENT_SECRET || '').trim();
  const redirectUri = (
    process.env.GOOGLE_REDIRECT_URI ||
    'https://icconline.vercel.app/api/youtube/callback'
  ).trim();
  return { clientId, clientSecret, redirectUri, isConfigured: Boolean(clientId && clientSecret) };
}

export function extractSupabaseAccessToken(req?: NextRequest): string | null {
  if (!req) return null;
  let token = req.cookies.get('sb-access-token')?.value || null;
  if (!token) {
    const sbCookie = req.cookies
      .getAll()
      .find((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
    if (sbCookie?.value) {
      try {
        const parsed = JSON.parse(sbCookie.value);
        token = parsed?.access_token || (Array.isArray(parsed) ? parsed[0] : null);
      } catch {
        token = sbCookie.value;
      }
    }
  }
  return token && token.includes('.') ? token : null;
}

function getWriteSupabaseClient(req?: NextRequest) {
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (serviceKey) {
    return createClient(LIVE_SUPABASE_URL, serviceKey, { auth: { persistSession: false } });
  }
  const userToken = extractSupabaseAccessToken(req);
  if (userToken) {
    return createClient(LIVE_SUPABASE_URL, LIVE_SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${userToken}` } },
    });
  }
  return supabase;
}

export async function getYouTubeConfigFromDb(): Promise<YouTubeOAuthConfig | null> {
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

  try {
    const { data } = await supabase
      .from('notifications')
      .select('message')
      .eq('id', YT_NOTIF_FALLBACK_ID)
      .maybeSingle();
    if (data?.message) {
      const parsed = JSON.parse(data.message);
      if (parsed?.access_token) return parsed as YouTubeOAuthConfig;
    }
  } catch {}
  return null;
}

export async function getYouTubeConfig(req?: NextRequest): Promise<YouTubeOAuthConfig | null> {
  const dbCfg = await getYouTubeConfigFromDb();
  if (dbCfg) return dbCfg;

  // Header fallback from Android App (when deep-link token is stored in SecureStore)
  if (req) {
    const rawHeader = req.headers.get('x-icc-yt-token');
    if (rawHeader) {
      try {
        const parsed = JSON.parse(Buffer.from(rawHeader, 'base64').toString('utf8'));
        if (parsed?.access_token) return parsed as YouTubeOAuthConfig;
      } catch {}
    }

    // Cookie fallback (works on Admin Web even if platform_settings RLS blocks anon write)
    const rawCookie = req.cookies.get(YT_COOKIE_NAME)?.value;
    if (rawCookie) {
      try {
        const parsed = JSON.parse(Buffer.from(rawCookie, 'base64').toString('utf8'));
        if (parsed?.access_token) return parsed as YouTubeOAuthConfig;
      } catch {}
    }
  }
  return null;
}

export async function saveYouTubeConfig(cfg: YouTubeOAuthConfig, req?: NextRequest): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const payload = { ...cfg, updated_at: new Date().toISOString() };
  try {
    const client = getWriteSupabaseClient(req);
    const { error } = await client.from('platform_settings').upsert(
      {
        key: 'youtube_oauth_config',
        value: payload,
        updated_at: payload.updated_at,
      },
      { onConflict: 'key' }
    );
    if (!error) return true;
    console.warn('saveYouTubeConfig platform_settings warning:', error.message);
  } catch {}

  // Fallback to open-CRUD notifications config row when platform_settings RLS blocks anon write
  try {
    const { error } = await supabase.from('notifications').upsert(
      {
        id: YT_NOTIF_FALLBACK_ID,
        user_id: null,
        title: '__yt_oauth_config__',
        message: JSON.stringify(payload),
        type: '__yt_oauth__',
        target_board: '__SYSTEM__',
        target_class: '__SYSTEM__',
        is_read: true,
      },
      { onConflict: 'id' }
    );
    if (!error) return true;
    console.warn('saveYouTubeConfig fallback warning:', error.message);
  } catch {}
  return false;
}

export async function clearYouTubeConfig(req?: NextRequest): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const client = getWriteSupabaseClient(req);
    await client.from('platform_settings').delete().eq('key', 'youtube_oauth_config');
  } catch {}
  try {
    await supabase.from('notifications').delete().eq('id', YT_NOTIF_FALLBACK_ID);
  } catch {}
}

export async function getValidYouTubeAccessToken(req?: NextRequest): Promise<string> {
  const cfg = await getYouTubeConfig(req);
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

  await saveYouTubeConfig(
    {
      ...cfg,
      access_token: data.access_token,
      expires_at: Date.now() + (Number(data.expires_in) || 3600) * 1000,
    },
    req
  );

  return data.access_token;
}
