import Constants from 'expo-constants';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const extra = Constants.expoConfig?.extra ?? {};
const supabaseUrl =
  (typeof extra.supabaseUrl === 'string' ? extra.supabaseUrl : '') ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  '';
const supabaseAnonKey =
  (typeof extra.supabaseAnonKey === 'string' ? extra.supabaseAnonKey : '') ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isBackendConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function createSupabaseClient(deviceId?: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: deviceId
      ? {
          headers: {
            'x-device-id': deviceId,
          },
        }
      : undefined,
  });
}