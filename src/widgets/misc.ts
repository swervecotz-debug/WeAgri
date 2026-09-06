export function openAbout(): void {
  window.open('https://swervetechcompany.business/', '_blank', 'noopener');
}

export function openAdCenter(): void {
  if (document.getElementById('adcenter-ov')) return;
  const ov = document.createElement('div');
  ov.id = 'adcenter-ov';
  ov.style.cssText = 'position:fixed;inset:0;z-index:500;background:#16243f';
  ov.innerHTML =
    '<button id="adcenter-close" style="position:fixed;top:14px;left:14px;z-index:501;background:#e8b04b;color:#1f3d2b;border:none;border-radius:100px;padding:9px 18px;font-weight:800;cursor:pointer;font-family:var(--body)">‹ WeAgri</button><iframe id="adcenter-frame" style="width:100%;height:100%;border:0"></iframe>';
  document.body.appendChild(ov);
  const frame = document.getElementById('adcenter-frame') as HTMLIFrameElement;
  frame.src = '/assets/ad-center.html';
  document.getElementById('adcenter-close')!.onclick = () => ov.remove();
}

window.addEventListener('message', (e) => {
  if (e && e.data === 'close-adcenter') {
    const o = document.getElementById('adcenter-ov');
    if (o) o.remove();
  }
});
