import { createClient } from '@supabase/supabase-js';

const LIVE_SUPABASE_URL = 'https://gshjxcoyfrskxnpdqooy.supabase.co';
const LIVE_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzaGp4Y295ZnJza3hucGRxb295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1NDE4MzEsImV4cCI6MjExMDExNzgzMX0.LUFOdUFv30uWvf1SdCoHo8vaewxquRq3JRRNrxHL-8g';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || LIVE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || LIVE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

