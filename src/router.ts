import { S, A, render } from './state';
import { SAFE } from './util';
import { screenLang, screenCountry } from './screens/onboarding';
import { renderAuth, authNext } from './screens/auth';
import { openAbout, openAdCenter } from './widgets/misc';
import { logout } from './boot';

/* ---------------- GLOBAL CLICK ROUTER ---------------- */
// Grows across every phase, exactly like the original single-file app's one
// big switch(act) on data-act — see the migration plan's note on why this
// stays one file rather than being decentralized during the migration.
export function initRouter(): void {
  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
    if (!el) return;
    const act = el.getAttribute('data-act');
    const v = el.getAttribute('data-v') || '';
    // const id = el.getAttribute('data-id') // wired in as later phases need it
    switch (act) {
      // onboarding
      case 'lang':
        S.lang = el.getAttribute('data-code') || S.lang;
        SAFE.setItem('w_lang', S.lang);
        screenLang();
        break;
      case 'go-country':
        S.view = 'country';
        render();
        break;
      case 'back-lang':
        S.view = 'lang';
        render();
        break;
      case 'country':
        S.country = el.getAttribute('data-code') || S.country;
        SAFE.setItem('w_country', S.country);
        screenCountry();
        break;
      case 'go-auth':
        S.view = 'auth';
        render();
        break;
      case 'about':
        openAbout();
        break;
      // auth
      case 'auth-back':
        if (A.mode === 'signup' && A.step > 0) {
          A.step--;
          renderAuth();
        } else {
          S.view = 'country';
          render();
        }
        break;
      case 'auth-next':
        void authNext();
        break;
      case 'auth-toggle':
        A.mode = A.mode === 'login' ? 'signup' : 'login';
        A.step = 0;
        renderAuth();
        break;
      case 'pw-toggle': {
        const pw = document.getElementById('f_pw') as HTMLInputElement | null;
        if (pw) pw.type = pw.type === 'password' ? 'text' : 'password';
        break;
      }
      case 'role':
        if (v === 'buyer') {
          A.role = 'buyer';
        } else if (v === 'seller') {
          A.role = 'seller';
          if (!A.sellerType || A.sellerType.indexOf('doctor_') === 0) A.sellerType = 'farmer';
        } else if (v === 'doctor') {
          A.role = 'doctor';
          if (!A.sellerType || A.sellerType.indexOf('doctor_') !== 0) A.sellerType = 'doctor_plants';
        } else if (v.indexOf('st-') === 0) {
          A.sellerType = v.slice(3);
        } else if (v.indexOf('dt-') === 0) {
          A.sellerType = 'doctor_' + v.slice(3);
        }
        renderAuth();
        break;
      case 'crop': {
        const i = A.crops.indexOf(v);
        if (i >= 0) A.crops.splice(i, 1);
        else A.crops.push(v);
        renderAuth();
        break;
      }
      case 'item': {
        const j = A.items.indexOf(v);
        if (j >= 0) A.items.splice(j, 1);
        else A.items.push(v);
        renderAuth();
        break;
      }
      case 'animal': {
        const ex = A.animals.find((x) => x.name === v);
        if (ex) A.animals = A.animals.filter((x) => x.name !== v);
        else A.animals.push({ name: v, count: 1 });
        renderAuth();
        break;
      }
      case 'animc': {
        const d = Number(el.getAttribute('data-d'));
        A.animals = A.animals.map((x) => (x.name === v ? { name: x.name, count: Math.max(1, x.count + d) } : x));
        renderAuth();
        break;
      }
      case 'open-adcenter':
        openAdCenter();
        break;
      case 'logout':
        void logout();
        break;
      // TODO Phase 4 (account/settings cluster): 'terms', 'settings', 'switch-account', etc.
      default:
        break;
    }
  });
}
