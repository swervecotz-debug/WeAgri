import { S } from './state';
import { money as hMoney } from './helpers';

export const root: HTMLElement = document.getElementById('root')!;

export function $<T extends Element = Element>(sel: string, r?: ParentNode): T | null {
  return (r || document).querySelector<T>(sel);
}

export function esc(s: unknown): string {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[c] as string;
  });
}

export function money(a: number | string | null | undefined): string {
  return hMoney(a, S.country);
}

export function firstLetter(name: string | null | undefined): string {
  return ((name || '').trim().charAt(0) || 'U').toUpperCase();
}

export function toast(msg: string): void {
  const wrap = document.getElementById('toast')!;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

export function showErr(msg: string): void {
  const bar = document.getElementById('errbar')!;
  if (String(msg).indexOf('Failed to fetch') >= 0 || String(msg).indexOf('NetworkError') >= 0) {
    bar.style.background = '#3a2d12';
    bar.innerHTML =
      'Could not reach the database. If you are viewing this inside the Claude chat preview, that is expected — the preview has no internet. Open the file from your web host (or a local server) and it will connect normally.';
    bar.classList.add('show');
    return;
  }
  bar.textContent = msg + '  (tap to dismiss)';
  bar.classList.add('show');
}

window.addEventListener('error', (e) => {
  showErr(e.message + '  @ ' + (e.filename || '').split('/').pop() + ':' + e.lineno);
});
window.addEventListener('unhandledrejection', (e) => {
  const reason = e.reason as { message?: string } | string | undefined;
  showErr('Promise: ' + (reason && typeof reason === 'object' && reason.message ? reason.message : reason));
});
document.getElementById('errbar')!.addEventListener('click', function (this: HTMLElement) {
  this.classList.remove('show');
});

// storage that uses real localStorage when available (so logins persist),
// and falls back to memory if the browser blocks it (e.g. inside a sandbox)
export const SAFE: { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void } =
  (function () {
    try {
      const k = '__weagri_t';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return window.localStorage;
    } catch {
      const m: Record<string, string> = {};
      return {
        getItem(k: string) {
          return m[k] == null ? null : m[k];
        },
        setItem(k: string, v: string) {
          m[k] = String(v);
        },
        removeItem(k: string) {
          delete m[k];
        },
      };
    }
  })();

// theme (light/dark) + notification preference, persisted
export function applyTheme(): void {
  document.documentElement.classList.toggle('dark', SAFE.getItem('w_theme') === 'dark');
}
export function notifyOn(): boolean {
  return SAFE.getItem('w_notify') !== 'off';
}
