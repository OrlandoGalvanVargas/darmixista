export function initButtons(): void {
  document.addEventListener('pointerdown', (e) => {
    const btn = (e.target as Element | null)?.closest<HTMLElement>('.btn');
    if (!btn) return;
    btn.classList.remove('is-pressed');
    void btn.offsetWidth;
    btn.classList.add('is-pressed');
    btn.addEventListener('animationend', () => btn.classList.remove('is-pressed'), { once: true });
  });
}
