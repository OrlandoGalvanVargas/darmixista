export function initButtons(): void {
  const fine = window.matchMedia('(pointer: fine)');
  document.addEventListener('pointermove', (e) => {
    if (!fine.matches) return;
    const btn = (e.target as Element | null)?.closest<HTMLElement>('.btn');
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    btn.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  });
  document.addEventListener('pointerdown', (e) => {
    const btn = (e.target as Element | null)?.closest<HTMLElement>('.btn');
    if (!btn) return;
    btn.classList.remove('is-pressed');
    void btn.offsetWidth;
    btn.classList.add('is-pressed');
    btn.addEventListener('animationend', () => btn.classList.remove('is-pressed'), { once: true });
  });
}
