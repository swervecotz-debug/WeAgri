import { esc, $ } from '../util';
import { ic } from '../icons';
import { S } from '../state';

export function openSheet(title: string, innerHTML: string, onMount?: (body: HTMLElement) => void): void {
  closeSheet();
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.id = 'sheet';
  ov.innerHTML =
    '<div class="sheet"><div class="sheet-head"><h3>' +
    esc(title) +
    '</h3><button class="x" data-close>' +
    ic('x', 18) +
    '</button></div><div id="sheet-body">' +
    innerHTML +
    '</div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target === ov || target.closest?.('[data-close]')) closeSheet();
  });
  if (onMount) {
    const body = $<HTMLElement>('#sheet-body', ov);
    if (body) onMount(body);
  }
}

export function setSheetBody(html: string, onMount?: (body: HTMLElement) => void): void {
  const b = $<HTMLElement>('#sheet-body');
  if (b) {
    b.innerHTML = html;
    if (onMount) onMount(b);
  }
}

export function closeSheet(): void {
  if (S._scanner) {
    try {
      S._scanner.stop().then(() => {
        S._scanner = null;
      });
    } catch {
      S._scanner = null;
    }
  }
  const s = document.getElementById('sheet');
  if (s) s.remove();
}
