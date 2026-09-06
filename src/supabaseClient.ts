import type { SupabaseClient, createClient as CreateClientFn } from '@supabase/supabase-js';
import { CFG } from './config';
import { SAFE } from './util';
import { showErr } from './util';

// The Supabase JS UMD build is loaded via a plain <script> CDN tag (see
// public/index.html) — it is never bundled — so it only exists as a global.
declare global {
  interface Window {
    supabase: { createClient: typeof CreateClientFn };
  }
}

export let sb: SupabaseClient = null as unknown as SupabaseClient;

// Mirrors the original boot()'s guard exactly: if the CDN script failed to
// load, show the same soft error banner instead of throwing.
export function initSupabase(): boolean {
  if (!window.supabase) {
    showErr('Supabase library failed to load (check your internet / CDN).');
    return false;
  }
  sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {
    auth: { storage: SAFE, persistSession: true, autoRefreshToken: true },
  });
  return true;
}
