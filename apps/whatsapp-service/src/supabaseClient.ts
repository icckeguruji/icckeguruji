import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://gshjxcoyfrskxnpdqooy.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzaGp4Y295ZnJza3hucGRxb295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1NDE4MzEsImV4cCI6MjExMDExNzgzMX0.LUFOdUFv30uWvf1SdCoHo8vaewxquRq3JRRNrxHL-8g';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const isSupabaseReady = !!supabaseKey && !supabaseUrl.includes('placeholder');
