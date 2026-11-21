import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      let raw: string | null = null;
      if (Platform.OS === 'web') {
        raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      } else {
        raw = await SecureStore.getItemAsync(key);
      }
      if (raw && key.endsWith('-auth-token')) {
        try {
          const parsed = JSON.parse(raw);
          const token = parsed?.access_token || (Array.isArray(parsed) ? parsed[0] : null);
          if (token && token.includes('.')) {
            const payload = JSON.parse(
              atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
            );
            if (payload?.exp && payload.exp * 1000 < Date.now()) {
              console.warn('Proactively purged expired Supabase session token in mobile:', key);
              if (Platform.OS === 'web') {
                if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
              } else {
                await SecureStore.deleteItemAsync(key);
              }
              return null;
            }
          }
        } catch {}
      }
      return raw;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export const LIVE_SUPABASE_URL = 'https://gshjxcoyfrskxnpdqooy.supabase.co';
export const LIVE_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzaGp4Y295ZnJza3hucGRxb295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1NDE4MzEsImV4cCI6MjExMDExNzgzMX0.LUFOdUFv30uWvf1SdCoHo8vaewxquRq3JRRNrxHL-8g';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || LIVE_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || LIVE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
