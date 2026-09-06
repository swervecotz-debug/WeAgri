import { S, A } from '../state';
import { CFG } from '../config';
import { t } from '../i18n';
import { esc, root, $ } from '../util';
import { ic } from '../icons';
import { REGIONS } from '../regions';
import { CROP_PRESETS, ANIMAL_PRESETS, SEED_PRESETS, FERTILIZER_PRESETS, SELLER_CARDS } from '../categories';
import { normPhone, makeQrPayload } from '../helpers';
import { sb } from '../supabaseClient';
import { afterAuth } from '../boot';

export function screenAuth(): void {
  A.step = 0;
  root.innerHTML = '<div class="app-shell"><div class="page-pad fade-in"><div class="wrap-narrow" id="authwrap"></div></div></div>';
  renderAuth();
}

export function renderAuth(): void {
  const wrap = document.getElementById('authwrap');
  if (!wrap) return;
  const lastStep = A.role === 'buyer' ? 0 : A.role === 'doctor' ? 1 : 2;
  const head =
    '<button class="muted" data-act="auth-back" style="font-size:18px;margin-bottom:14px">' +
    ic('back', 18) +
    '</button>' +
    '<div style="display:flex;align-items:center;gap:12px"><img src="/assets/logo-mark.jpg" style="width:40px;height:44px;border-radius:10px;object-fit:cover">' +
    '<h1 style="font-size:28px;color:var(--forest)">' +
    (A.mode === 'login' ? t('login') : t('signup')) +
    '</h1></div>' +
    '<p class="muted" style="margin:6px 0">' +
    t('welcome') +
    '</p>' +
    (A.mode === 'signup'
      ? '<p style="font-size:12px;color:var(--leaf);font-weight:700;margin-bottom:16px">' + t('freeNote') + '</p>'
      : '<div style="height:8px"></div>');

  let body = '';
  if (A.mode === 'login') {
    body = field(t('phone'), '<input class="input" id="f_phone" placeholder="+255 7XX XXX XXX">') + pwField();
  } else if (A.step === 0) {
    body =
      '<div class="field"><label>' +
      t('iAmA') +
      '</label><div class="grid-2">' +
      roleCard('buyer', 'basket', t('buyer'), t('buyerDesc'), A.role === 'buyer') +
      roleCard('seller', 'box', t('seller'), t('sellerDesc'), A.role === 'seller') +
      roleCard('doctor', 'shield', t('doctor'), t('doctorDesc'), A.role === 'doctor') +
      '</div></div>' +
      field(t('fullName'), '<input class="input" id="f_name">') +
      field(t('phone'), '<input class="input" id="f_phone" placeholder="+255 7XX XXX XXX">') +
      field(t('email'), '<input class="input" id="f_email" type="email">') +
      field(
        t('region'),
        '<select class="select" id="f_region"><option value="">—</option>' +
          (REGIONS[S.country] || REGIONS.TZ || []).map((r) => '<option>' + esc(r) + '</option>').join('') +
          '</select>'
      ) +
      pwField();
  } else if (A.step === 1) {
    if (A.role === 'doctor') {
      body =
        '<div class="field"><label>' +
        t('chooseSpecialty') +
        '</label><div class="grid-2">' +
        roleCard('dt-plants', 'leaf', t('plantDoctor'), t('plantDoctorDesc'), A.sellerType === 'doctor_plants') +
        roleCard('dt-animals', 'animal', t('animalDoctor'), t('animalDoctorDesc'), A.sellerType === 'doctor_animals') +
        '</div></div>';
    } else {
      const sellerTypeIcon: Record<string, string> = { farmer: 'leaf', livestock: 'animal', seed: 'seed', fertilizer: 'flask' };
      body =
        '<div class="field"><label>' +
        t('iAmA') +
        '</label><div class="grid-2">' +
        SELLER_CARDS.map((sc) =>
          roleCard('st-' + sc.key, sellerTypeIcon[sc.key] || 'leaf', t(sc.titleKey), t(sc.descKey), A.sellerType === sc.key)
        ).join('') +
        '</div></div>';
    }
  } else if (A.step === 2) {
    if (A.sellerType === 'farmer') {
      body =
        '<label class="muted" style="font-size:13px;font-weight:600">' +
        t('whatCrops') +
        '</label><div class="row-scroll" style="flex-wrap:wrap;margin:10px 0 16px">' +
        CROP_PRESETS.map(
          (c) => '<button class="chip ' + (A.crops.indexOf(c) >= 0 ? 'selected' : '') + '" data-act="crop" data-v="' + esc(c) + '">' + esc(c) + '</button>'
        ).join('') +
        '</div>' +
        field(t('farmSize'), '<input class="input" id="f_size" type="number" value="' + esc(A.farmSize) + '">');
    } else if (A.sellerType === 'livestock') {
      body =
        '<label class="muted" style="font-size:13px;font-weight:600">' +
        t('whichAnimals') +
        '</label><div class="row-scroll" style="flex-wrap:wrap;margin:10px 0 14px">' +
        ANIMAL_PRESETS.map((a) => {
          const sel = A.animals.find((x) => x.name === a);
          return '<button class="chip ' + (sel ? 'selected' : '') + '" data-act="animal" data-v="' + esc(a) + '">' + esc(a) + '</button>';
        }).join('') +
        '</div>' +
        A.animals
          .map(
            (a) =>
              '<div class="card" style="display:flex;justify-content:space-between;align-items:center;padding:12px;margin-bottom:8px"><span style="font-weight:600">' +
              esc(a.name) +
              '</span><div style="display:flex;gap:12px;align-items:center"><button class="chip" data-act="animc" data-v="' +
              esc(a.name) +
              '" data-d="-1">−</button><b>' +
              a.count +
              '</b><button class="chip selected" data-act="animc" data-v="' +
              esc(a.name) +
              '" data-d="1">+</button></div></div>'
          )
          .join('');
    } else {
      const presets = A.sellerType === 'seed' ? SEED_PRESETS : FERTILIZER_PRESETS;
      body =
        '<label class="muted" style="font-size:13px;font-weight:600">' +
        (A.sellerType === 'seed' ? t('whatSeeds') : t('whatFertilizers')) +
        '</label><div class="row-scroll" style="flex-wrap:wrap;margin:10px 0 16px">' +
        presets
          .map((c) => '<button class="chip ' + (A.items.indexOf(c) >= 0 ? 'selected' : '') + '" data-act="item" data-v="' + esc(c) + '">' + esc(c) + '</button>')
          .join('') +
        '</div>';
    }
  }

  const btnLabel = A.mode === 'login' ? t('login') : A.step < lastStep ? t('continue') : t('finish');
  const footer =
    '<div id="autherr" style="color:var(--clay);font-size:14px;margin-bottom:10px"></div>' +
    '<button class="btn btn-primary" data-act="auth-next">' +
    btnLabel +
    '</button>' +
    '<p class="center muted" style="margin-top:18px;font-size:14px">' +
    (A.mode === 'login' ? t('noAccount') : t('haveAccount')) +
    ' <button data-act="auth-toggle" style="color:var(--leaf);font-weight:700">' +
    (A.mode === 'login' ? t('signup') : t('login')) +
    '</button></p>' +
    '<p class="center" style="margin-top:12px"><button data-act="about" style="background:none;color:var(--ink-soft);font-size:13px;text-decoration:underline;cursor:pointer">' +
    t('aboutUs') +
    '</button></p>' +
    '<p class="center" style="margin-top:6px"><button data-act="terms" style="background:none;color:var(--ink-soft);font-size:13px;text-decoration:underline;cursor:pointer">' +
    t('termsLink') +
    '</button></p>' +
    '<p class="center" style="margin-top:14px"><button data-act="open-adcenter" style="display:inline-flex;align-items:center;gap:7px;padding:11px 20px;border-radius:99px;background:linear-gradient(100deg,#1f3d2b 0%,#3f7d4f 55%,#c85a3a 100%);color:#fff;font-size:13.5px;font-weight:700;border:none;cursor:pointer;box-shadow:0 8px 20px -8px rgba(31,61,43,.45)">' +
    ic('boost', 14) +
    ' ' +
    t('adCenterLink') +
    '</button></p>';
  wrap.innerHTML = head + body + footer;
}

export function field(label: string, inner: string): string {
  return '<div class="field"><label>' + esc(label) + '</label>' + inner + '</div>';
}

export function pwField(): string {
  return (
    '<div class="field"><label>' +
    t('password') +
    '</label><div style="position:relative"><input class="input" id="f_pw" type="password" style="padding-right:46px"><button data-act="pw-toggle" style="position:absolute;right:12px;top:11px;color:var(--ink-soft)">' +
    ic('eye', 18) +
    '</button></div></div>'
  );
}

export function roleCard(act: string, emoji: string, title: string, desc: string, sel: boolean): string {
  return (
    '<button class="opt ' +
    (sel ? 'sel' : '') +
    '" data-act="role" data-v="' +
    act +
    '" style="flex-direction:column;align-items:flex-start;gap:8px"><span class="em">' +
    ic(emoji, 22) +
    '</span><span><span style="font-weight:700;font-family:var(--display);display:block">' +
    esc(title) +
    '</span><span class="muted" style="font-size:12px">' +
    esc(desc) +
    '</span></span></button>'
  );
}

export async function authNext(): Promise<void> {
  const err = document.getElementById('autherr');
  if (err) err.textContent = '';
  // read step-0 / login fields if present
  const fPhone = $<HTMLInputElement>('#f_phone');
  const fName = $<HTMLInputElement>('#f_name');
  const fEmail = $<HTMLInputElement>('#f_email');
  const fRegion = $<HTMLSelectElement>('#f_region');
  const fPw = $<HTMLInputElement>('#f_pw');
  const fSize = $<HTMLInputElement>('#f_size');
  if (fPhone) A.phone = fPhone.value.trim();
  if (fName) A.name = fName.value.trim();
  if (fEmail) A.email = fEmail.value.trim();
  if (fRegion) A.region = fRegion.value;
  if (fPw) A.pw = fPw.value;
  if (fSize) A.farmSize = fSize.value;

  if (A.mode === 'login') return doLogin();
  // validate step 0
  if (A.step === 0) {
    if (!A.name || !A.phone || !A.region || !(A.pw && A.pw.length >= 6)) {
      setAuthErr('Please fill name, phone, region and a 6+ char password.');
      return;
    }
    if (A.role === 'buyer') return doSignup();
    A.step = 1;
    return renderAuth();
  }
  const lastStep = A.role === 'buyer' ? 0 : A.role === 'doctor' ? 1 : 2;
  if (A.step < lastStep) {
    A.step++;
    return renderAuth();
  }
  return doSignup();
}

export function setAuthErr(m: string): void {
  const e = document.getElementById('autherr');
  if (e) e.textContent = m;
}

// translate raw Supabase messages into clear next steps
export function friendlyAuthError(msg: string | null | undefined): string {
  const m = String(msg || '').toLowerCase();
  if (m.indexOf('rate limit') >= 0)
    return 'Too many signups too quickly. In Supabase, turn OFF Authentication → Email → "Confirm email" (WeAgri does not need it). If you just hit the limit, wait about an hour, then try again.';
  if (m.indexOf('already registered') >= 0 || m.indexOf('already been registered') >= 0 || m.indexOf('user already') >= 0)
    return 'That phone/email already has an account. Tap "Log in" instead.';
  if (m.indexOf('database error') >= 0) return 'Run supabase-fix.sql once in Supabase (SQL Editor), then try again.';
  if (m.indexOf('row-level security') >= 0 || m.indexOf('violates') >= 0)
    return 'Run supabase-fix.sql in Supabase so profiles can be created, then try again.';
  if (m.indexOf('invalid login') >= 0) return 'Wrong phone (or username) / password, or no account yet — check details or create an account.';
  if (m.indexOf('failed to fetch') >= 0 || m.indexOf('networkerror') >= 0)
    return 'Cannot reach the database. If this is the Claude chat preview, that is expected — use your deployed or local site.';
  return msg || 'Something went wrong. Try again.';
}

// auth identity is ALWAYS derived from the phone number (email is optional, stored only in the profile) —
// except the one admin username, which maps to a fixed admin email instead of a phone number.
function authEmail(): string {
  const typed = (A.phone || '').trim();
  if (typed && typed.toLowerCase() === String(CFG.ADMIN_USERNAME || '').toLowerCase()) return CFG.ADMIN_EMAIL;
  const d = normPhone(A.phone);
  return (d || (A.email || 'user').split('@')[0]) + '@weagri.app';
}

export async function doLogin(): Promise<void> {
  try {
    S._busy = true;
    const r = await sb.auth.signInWithPassword({ email: authEmail(), password: A.pw || '' });
    S._busy = false;
    if (r.error) throw r.error;
    S.session = r.data.session;
    await afterAuth();
  } catch (e) {
    S._busy = false;
    setAuthErr(friendlyAuthError((e as Error).message));
  }
}

export async function doSignup(): Promise<void> {
  try {
    S._busy = true;
    // pass everything as user metadata so the database trigger can build the profile
    const meta = {
      full_name: A.name,
      phone: A.phone || '',
      region: A.region || '',
      country: S.country,
      role: A.role,
      seller_type: A.role === 'seller' || A.role === 'doctor' ? A.sellerType : '',
      farm_size: A.role === 'seller' && A.sellerType === 'farmer' && A.farmSize ? String(A.farmSize) : '',
    };
    const su = await sb.auth.signUp({ email: authEmail(), password: A.pw || '', options: { data: meta } });
    if (su.error) throw su.error;
    const user = su.data.user;
    if (!user) {
      S._busy = false;
      setAuthErr('Account created — please log in.');
      A.mode = 'login';
      renderAuth();
      return;
    }
    S.session = su.data.session;
    // Best-effort: if the trigger isn't installed yet but the user IS logged in
    // (Confirm email OFF), this creates the profile directly. If it's blocked by
    // RLS we ignore it — the database trigger handles profile creation.
    const profile = {
      id: user.id,
      full_name: A.name,
      phone: A.phone,
      email: A.email || null,
      region: A.region,
      country: S.country,
      role: A.role,
      seller_type: A.role === 'seller' || A.role === 'doctor' ? A.sellerType : null,
      farm_size: A.role === 'seller' && A.sellerType === 'farmer' ? Number(A.farmSize) || null : null,
      qr_code: makeQrPayload(user.id),
    };
    await sb.from('profiles').upsert(profile); // error (if any) ignored on purpose
    if (A.role === 'seller') {
      if (A.sellerType === 'farmer' && A.crops.length) {
        await sb.from('crops').insert(A.crops.map((n) => ({ profile_id: user.id, name: n })));
      } else if (A.sellerType === 'livestock' && A.animals.length) {
        await sb.from('livestock').insert(A.animals.map((a) => ({ profile_id: user.id, animal_type: a.name, count: a.count })));
      } else if ((A.sellerType === 'seed' || A.sellerType === 'fertilizer') && A.items.length) {
        await sb.from('crops').insert(A.items.map((n) => ({ profile_id: user.id, name: n })));
      }
    }
    S._busy = false;
    await afterAuth();
    if (!S.profile) {
      setAuthErr('Account created. If it did not sign you in, turn OFF "Confirm email" in Supabase, then log in.');
      A.mode = 'login';
      renderAuth();
    }
  } catch (e) {
    S._busy = false;
    setAuthErr(friendlyAuthError((e as Error).message));
  }
}
