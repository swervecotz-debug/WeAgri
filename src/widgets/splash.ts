// "By Swerve" splash (login/signup -> dashboard only) — a thin gold ring
// spinning around the Swerve W mark, with a caption fading in underneath.
export function wgShowSplash(cb: () => void): void {
  const existing = document.getElementById('wg-splash');
  if (existing) existing.remove();
  const ov = document.createElement('div');
  ov.id = 'wg-splash';
  ov.innerHTML =
    '<div class="wg-emblem-wrap">' +
    '<svg class="wg-emblem-ring" viewBox="0 0 160 160"><defs><linearGradient id="wgEmblemGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" stop-color="#f6e2a8"/><stop offset="55%" stop-color="#d4af5c"/><stop offset="100%" stop-color="#a9822f"/>' +
    '</linearGradient></defs><circle cx="80" cy="80" r="72" fill="none" stroke="url(#wgEmblemGrad)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="113 240" opacity=".85"/></svg>' +
    '<img class="wg-emblem-mark" src="/assets/swerve-mark.png" alt="Swerve">' +
    '</div>' +
    '<div class="wg-emblem-caption">By Swerve</div>';
  document.body.appendChild(ov);
  setTimeout(() => {
    ov.style.opacity = '0';
    setTimeout(() => {
      ov.remove();
      cb();
    }, 400);
  }, 1300);
}
