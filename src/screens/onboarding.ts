import { S } from '../state';
import { t } from '../i18n';
import { esc, root } from '../util';
import { ic } from '../icons';
import { LANGUAGES, COUNTRIES } from '../regions';

export function screenLang(): void {
  const opts = LANGUAGES.map((l) => {
    return (
      '<button class="opt ' +
      (S.lang === l.code ? 'sel' : '') +
      '" data-act="lang" data-code="' +
      l.code +
      '" style="margin-bottom:12px"><span style="font-weight:700;font-size:17px;font-family:var(--display)">' +
      esc(l.label) +
      '</span>' +
      (S.lang === l.code
        ? '<span style="margin-left:auto;color:var(--leaf);font-weight:800">' + ic('check', 16) + '</span>'
        : '') +
      '</button>'
    );
  }).join('');
  root.innerHTML =
    '<div class="app-shell"><div class="page-pad fade-in"><div class="wrap-narrow" style="min-height:100vh;display:flex;flex-direction:column;justify-content:center">' +
    '<div class="pop" style="width:120px;height:132px;border-radius:28px;overflow:hidden;margin:0 auto 18px;box-shadow:var(--shadow);background:var(--navy)"><img src="/assets/logo-mark.jpg" alt="WeAgri" style="width:100%;height:100%;object-fit:cover"></div>' +
    '<h1 style="font-size:40px;text-align:center;color:var(--forest)">WeAgri</h1>' +
    '<p class="muted center" style="margin:6px 0 10px">' +
    t('tagline') +
    '</p>' +
    '<p class="center" style="margin:0 0 34px;font-size:17px;font-weight:600;color:var(--forest);letter-spacing:-0.2px">' +
    t('connectTag') +
    '</p>' +
    '<h3 style="margin-bottom:16px;font-size:18px">' +
    t('chooseLanguage') +
    '</h3>' +
    opts +
    '<button class="btn btn-primary" data-act="go-country" style="margin-top:18px">' +
    t('continue') +
    '</button>' +
    '<p class="center" style="margin-top:16px"><button data-act="about" style="background:none;color:var(--ink-soft);font-size:13px;text-decoration:underline;cursor:pointer">' +
    t('aboutUs') +
    '</button></p>' +
    '<p class="center" style="margin-top:6px"><button data-act="terms" style="background:none;color:var(--ink-soft);font-size:13px;text-decoration:underline;cursor:pointer">' +
    t('termsLink') +
    '</button></p>' +
    '<p class="center" style="margin-top:14px"><button data-act="open-adcenter" style="display:inline-flex;align-items:center;gap:7px;padding:11px 20px;border-radius:99px;background:linear-gradient(100deg,#1f3d2b 0%,#3f7d4f 55%,#c85a3a 100%);color:#fff;font-size:13.5px;font-weight:700;border:none;cursor:pointer;box-shadow:0 8px 20px -8px rgba(31,61,43,.45)">' +
    ic('boost', 14) +
    ' ' +
    t('adCenterLink') +
    '</button></p>' +
    '</div></div></div>';
}

export function screenCountry(): void {
  const grid = COUNTRIES.map((c) => {
    return (
      '<button class="opt ' +
      (S.country === c.code ? 'sel' : '') +
      '" data-act="country" data-code="' +
      c.code +
      '" style="flex-direction:column;align-items:flex-start;gap:6px"><span style="font-weight:700;font-family:var(--display)">' +
      esc(c.name) +
      '</span><span class="muted" style="font-size:12px">' +
      c.currency +
      '</span></button>'
    );
  }).join('');
  root.innerHTML =
    '<div class="app-shell"><div class="page-pad fade-in"><div class="wrap-narrow">' +
    '<button class="muted" data-act="back-lang" style="font-size:18px;margin-bottom:14px">' +
    ic('back', 18) +
    '</button>' +
    '<h1 style="font-size:30px;color:var(--forest);margin-bottom:6px">' +
    t('chooseCountry') +
    '</h1>' +
    '<div class="grid-2" style="margin:18px 0">' +
    grid +
    '</div>' +
    '<button class="btn btn-primary" data-act="go-auth">' +
    t('continue') +
    '</button>' +
    '</div></div></div>';
}
