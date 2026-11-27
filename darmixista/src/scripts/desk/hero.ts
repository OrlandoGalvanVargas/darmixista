export function heroName(root: HTMLElement) {
  const h1 = root.querySelector<HTMLElement>('[data-hero-name]');
  if (!h1) return { wave: () => {} };
  const letters = [...h1.querySelectorAll<HTMLElement>('span')];
  const k = letters.map(() => 0);
  const target = letters.map(() => 0);
  let centers: number[] = [];
  let midY = 0;
  let size = 80;
  let px: number | null = null;
  let py = 0;
  let sweep = -1;
  let raf = 0;
  let last = 0;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const measure = () => {
    letters.forEach((l) => l.style.setProperty('--k', '0'));
    centers = letters.map((l) => {
      const r = l.getBoundingClientRect();
      return r.left + r.width / 2;
    });
    const r = h1.getBoundingClientRect();
    midY = r.top + r.height / 2;
    size = r.height;
    letters.forEach((l, i) => l.style.setProperty('--k', k[i].toFixed(3)));
  };

  const active = () => root.dataset.shot === 'home' && root.classList.contains('is-ready') && root.dataset.menu !== 'open';

  const tick = () => {
    raf = 0;
    const now = performance.now();
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
    last = now;
    const a = 1 - Math.exp(-dt / 0.085);
    const reach = size * 1.15;
    let x: number | null = null;
    let fall = 1;
    if (sweep >= 0) {
      const t = (now - sweep) / 1500;
      if (t >= 1) sweep = -1;
      else {
        const a = centers[0] - reach;
        const b = centers[centers.length - 1] + reach;
        x = a + (b - a) * (t * t * (3 - 2 * t));
      }
    } else if (px !== null && active()) {
      x = px;
      fall = Math.max(0, 1 - Math.max(0, Math.abs(py - midY) - size * 0.6) / (size * 1.6));
    }
    let moving = sweep >= 0;
    letters.forEach((l, i) => {
      if (l.classList.contains('sp')) return;
      const d = x === null ? Infinity : Math.abs(centers[i] - x);
      target[i] = x === null ? 0 : Math.exp(-((d / reach) ** 2)) * fall;
      const next = k[i] + (target[i] - k[i]) * a;
      if (Math.abs(next - k[i]) > 0.002) moving = true;
      k[i] = Math.abs(next - target[i]) < 0.002 ? target[i] : next;
      l.style.setProperty('--k', k[i].toFixed(3));
    });
    if (moving) raf = requestAnimationFrame(tick);
    else last = 0;
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const wave = () => {
    if (reduce) return;
    measure();
    sweep = performance.now();
    kick();
  };

  if (fine && !reduce) {
    window.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerType !== 'mouse') return;
        px = e.clientX;
        py = e.clientY;
        kick();
      },
      { passive: true },
    );
    document.addEventListener('pointerleave', () => {
      px = null;
      kick();
    });
  }
  window.addEventListener(
    'pointerup',
    (e) => {
      if (e.pointerType === 'mouse' || !active()) return;
      const r = h1.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top - 12 && e.clientY <= r.bottom + 12) wave();
    },
    { passive: true },
  );
  window.addEventListener('resize', measure, { passive: true });
  document.fonts?.ready.then(measure);
  measure();
  return { wave };
}
