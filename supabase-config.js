// Get these values from Supabase Dashboard > Project Settings > API.
// The anon key is designed for browser use. Never put a service_role key here.
window.SUPABASE_URL = 'https://ouhvfwbksdcuybovfseu.supabase.co';
window.SUPABASE_ANON_KEY = 'sb_publishable_EXnSDybfCNs8_0wzQE6RtQ_poe38TpN';

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
