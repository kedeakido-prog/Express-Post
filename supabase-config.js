/* ================================================================
   SUPABASE CONFIGURATION — Express Post Australia
   Single source of truth. Used by BOTH admin and main website.
   ================================================================ */

const SUPABASE_URL  = 'https://zdddcokruzhyelovenra.supabase.co';
// JWT anon key — required for Edge Functions and Realtime
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkZGRjb2tydXpoeWVsb3ZlbnJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyOTczMTksImV4cCI6MjA5NDg3MzMxOX0.L0zXW0PO7sLq4a0zUnZPlikMMnMn_BTleNwBBsHyOW0';

(function initSupabase() {
  function tryInit() {
    if (typeof supabase === 'undefined' || typeof supabase.createClient !== 'function') return false;
    try {
      window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
        auth: { persistSession: false, autoRefreshToken: false, storageKey: null },
        realtime: { params: { eventsPerSecond: 5 } },
        global: {
          headers: {
            'apikey': SUPABASE_ANON,
            'Authorization': 'Bearer ' + SUPABASE_ANON,
            'X-Client-Info': 'expresspost-web'
          }
        }
      });
      console.info('[Supabase] ✓ Client ready —', SUPABASE_URL);
      // Fire event so other scripts know client is ready
      window.dispatchEvent(new Event('supabase_ready'));
      return true;
    } catch (err) {
      console.error('[Supabase] Failed to initialise:', err);
      window.supabaseClient = null;
      return false;
    }
  }

  if (!tryInit()) {
    document.addEventListener('DOMContentLoaded', function() {
      if (!tryInit()) {
        let attempts = 0;
        const iv = setInterval(function() {
          attempts++;
          if (tryInit() || attempts > 30) clearInterval(iv);
        }, 100);
      }
    });
  }
})();
