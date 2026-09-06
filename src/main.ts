import { S, setRender } from './state';
import { esc, root } from './util';
import { t } from './i18n';
import { screenLang, screenCountry } from './screens/onboarding';
import { screenAuth } from './screens/auth';
import { closeSheet } from './widgets/sheet';
import { initRouter } from './router';
import { boot } from './boot';

// TODO Phase 2: replace with the real seller dashboard (sellerDash).
function sellerDashStub(): void {
  root.innerHTML =
    '<div class="app-shell"><div class="page-pad fade-in center" style="padding-top:80px">' +
    '<h2 style="color:var(--forest)">' +
    esc(S.profile?.full_name || '') +
    '</h2>' +
    '<p class="muted" style="margin:10px 0 24px">Seller dashboard — coming in a later phase of the migration.</p>' +
    '<button class="btn btn-ghost" data-act="logout">' +
    t('logout') +
    '</button></div></div>';
}

// TODO Phase 3: replace with the real buyer dashboard (buyerDash).
function buyerDashStub(): void {
  root.innerHTML =
    '<div class="app-shell"><div class="page-pad fade-in center" style="padding-top:80px">' +
    '<h2 style="color:var(--forest)">' +
    esc(S.profile?.full_name || '') +
    '</h2>' +
    '<p class="muted" style="margin:10px 0 24px">Buyer dashboard — coming in a later phase of the migration.</p>' +
    '<button class="btn btn-ghost" data-act="logout">' +
    t('logout') +
    '</button></div></div>';
}

// TODO Phase 5: replace with the real admin dashboard (adminDash).
function adminDashStub(): void {
  root.innerHTML =
    '<div class="app-shell"><div class="page-pad fade-in center" style="padding-top:80px">' +
    '<h2 style="color:var(--forest)">Admin</h2>' +
    '<p class="muted" style="margin:10px 0 24px">Admin dashboard — coming in a later phase of the migration.</p>' +
    '<button class="btn btn-ghost" data-act="logout">' +
    t('logout') +
    '</button></div></div>';
}

function realRender(): void {
  closeSheet();
  if (S.view === 'lang') return screenLang();
  if (S.view === 'country') return screenCountry();
  if (S.view === 'auth') return screenAuth();
  if (S.view === 'dash') {
    if (S.profile && S.profile.role === 'admin') return adminDashStub();
    if (S.profile && (S.profile.role === 'buyer' || S.profile.role === 'doctor')) return buyerDashStub();
    return sellerDashStub();
  }
}

setRender(realRender);
initRouter();
void boot();
