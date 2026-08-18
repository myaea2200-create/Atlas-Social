// The anon key is designed for browser use. Never put a service_role key here.
window.SUPABASE_URL = 'https://qjtgtoadpztyipzdfbqs.supabase.co';
window.SUPABASE_ANON_KEY = 'sb_publishable_tO1eBpM1V1HAVCrcS_RFaw_Rrsmbv5k';

if (
  window.SUPABASE_URL.startsWith('PASTE_') ||
  window.SUPABASE_ANON_KEY.startsWith('PASTE_')
) {
  console.warn('Supabase is not configured yet. Update Project/supabase-config.js.');
} else {
  window.supabaseClient = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
  );
}
