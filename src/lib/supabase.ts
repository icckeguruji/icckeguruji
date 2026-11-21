import { createClient } from '@supabase/supabase-js';

export const LIVE_SUPABASE_URL = 'https://gshjxcoyfrskxnpdqooy.supabase.co';
export const LIVE_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzaGp4Y295ZnJza3hucGRxb295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1NDE4MzEsImV4cCI6MjExMDExNzgzMX0.LUFOdUFv30uWvf1SdCoHo8vaewxquRq3JRRNrxHL-8g';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || LIVE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || LIVE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = true;

// Pre-flight check: If browser localStorage contains an expired JWT token, clean it up immediately
// so that PostgREST does not reject requests with PGRST301 (JWT expired)!
if (typeof window !== 'undefined') {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const token = parsed?.access_token || (Array.isArray(parsed) ? parsed[0] : null);
            if (token && token.includes('.')) {
              const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
              if (payload?.exp && payload.exp * 1000 < Date.now()) {
                console.warn('Proactively purged expired Supabase session token:', key);
                localStorage.removeItem(key);
              }
            }
          } catch {}
        }
      }
    }
  } catch {}
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

