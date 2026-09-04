import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mdeerhajolxefhcgnyvb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_dPV8jAPjIlEh-jdtb1fUNg_8Rq7vuCe';

/**
 * Checks if Supabase credentials have been configured in .env
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'your-supabase-anon-key' &&
    !supabaseUrl.includes('placeholder')
  );
}

// Resilient initialization: if credentials are not configured yet,
// supply a valid dummy URL structure so the app boots without crashing.
const clientUrl = isSupabaseConfigured() ? supabaseUrl : 'https://dummy-app.supabase.co';
const clientKey = isSupabaseConfigured() ? supabaseAnonKey : 'dummy-anon-key-placeholder';

export const supabase: SupabaseClient = createClient(clientUrl, clientKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});
