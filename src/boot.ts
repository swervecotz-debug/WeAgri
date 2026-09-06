import { S, render } from './state';
import { SAFE, applyTheme, showErr } from './util';
import { sb, initSupabase } from './supabaseClient';
import { wgShowSplash } from './widgets/splash';
import type { Profile } from './types/state';

export async function boot(): Promise<void> {
  applyTheme();
  S.lang = SAFE.getItem('w_lang') || 'sw';
  S.country = SAFE.getItem('w_country') || 'TZ';
  if (!initSupabase()) return;
  sb.auth.onAuthStateChange((_e, session) => {
    if (S._busy) return;
    S.session = session;
    void afterAuth();
  });
  try {
    const res = await sb.auth.getSession();
    S.session = res.data.session;
  } catch (e) {
    showErr((e as Error).message);
  }
  await afterAuth(true);
}

export async function afterAuth(_initial?: boolean): Promise<void> {
  if (S.session) {
    try {
      const r = await sb.from('profiles').select('*').eq('id', S.session.user.id).maybeSingle();
      S.profile = r.data as Profile | null;
    } catch (e) {
      showErr((e as Error).message);
    }
    if (S.profile) {
      const fromAuth = S.view === 'auth';
      S.view = 'dash';
      if (S.profile.role === 'admin') {
        // admin portal: its own dashboard, no marketplace tabs/presence/splash noise
        S.tab = 'ov';
        render();
        return;
      }
      // TODO Phase 4 (account/messages/notifications): recordAccount() — records
      // this profile in the local multi-account switcher on every login.
      S.tab = S.profile.role === 'buyer' || S.profile.role === 'doctor' ? 'discover' : 'home';
      // TODO Phase 4: wgPresencePing() + setInterval(wgPresencePing, 30000) —
      // writes profiles.last_seen every 30s while the app is open.
      // TODO Phase 4/6/7 (_gcBoot in the original): wgCheckUrlScan() [delivery,
      // Phase 6], wgStartNotifPoll() [notifications, Phase 4], wgCheckDevice()
      // [verification, Phase 7], wgStartPresencePing() [Phase 4].
      if (fromAuth) {
        wgShowSplash(() => render());
      } else {
        render();
      }
      return;
    }
  } else {
    S.profile = null;
  }
  if (S.view === 'dash' || !S.view) {
    S.view = SAFE.getItem('w_lang') && SAFE.getItem('w_country') ? 'auth' : 'lang';
  }
  render();
}

export async function logout(): Promise<void> {
  S._busy = true;
  await sb.auth.signOut();
  S._busy = false;
  S.session = null;
  S.profile = null;
  S.view = 'auth';
  render();
}
