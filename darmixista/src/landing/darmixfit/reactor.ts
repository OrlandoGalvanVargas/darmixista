import { reducedMotion } from '../kit/kit';

function setLevel(svg: SVGSVGElement, level: number): void {
  const l = Math.max(0, Math.min(3, level));
  const fill = l >= 3 ? 1 : 0.08 + (l / 3) * 0.6;
  svg.style.setProperty('--ly', (286 - 172 * fill - 200).toFixed(1));
  const cells = svg.querySelectorAll('[data-cell]');
  const litCells = Math.round((l / 3) * cells.length);
  cells.forEach((c, i) => c.classList.toggle('on', i < litCells));
  const slots = svg.querySelectorAll('[data-slot]');
  const litSlots = Math.round((l / 3) * slots.length);
  slots.forEach((s, i) => s.classList.toggle('on', i < litSlots));
  const num = svg.querySelector('[data-num]');
  if (num) num.textContent = String(Math.round(l)).padStart(2, '0');
  const sub = svg.querySelector<SVGTextElement>('[data-sub]');
  if (sub) sub.textContent = (l >= 3 ? sub.dataset.done : sub.dataset.of) ?? '';
  svg.classList.toggle('is-full', l >= 3);
  svg.dataset.level = String(l);
  const charge = svg.closest('[data-reactor-stage]')?.querySelector('[data-charge]');
  if (charge) charge.textContent = `${Math.round((l / 3) * 100)}%`;
}

function charge(svg: SVGSVGElement, from: number, to: number, step = 520): void {
  if (reducedMotion()) {
    setLevel(svg, to);
    return;
  }
  let current = from;
  setLevel(svg, current);
  const tick = () => {
    current = Math.min(to, Math.round((current + 0.25) * 4) / 4);
    setLevel(svg, current);
    if (current < to) setTimeout(tick, step / 2);
  };
  setTimeout(tick, step);
}

function tilt(stage: HTMLElement, svg: SVGSVGElement): void {
  if (reducedMotion()) return;
  let target = -6;
  let value = -6;
  let visible = false;
  let raf = 0;
  const loop = () => {
    value += (target - value) * 0.08;
    svg.style.setProperty('--tilt', `${value.toFixed(2)}deg`);
    raf = visible && Math.abs(target - value) > 0.05 ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => {
    if (visible && !raf) raf = requestAnimationFrame(loop);
  };
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    addEventListener(
      'pointermove',
      (e) => {
        target = Math.max(-1, Math.min(1, (e.clientX / innerWidth - 0.5) * 2)) * -16;
        kick();
      },
      { passive: true },
    );
  } else {
    addEventListener('deviceorientation', (e) => {
      if (e.gamma == null) return;
      target = -Math.max(-28, Math.min(28, e.gamma));
      kick();
    });
  }
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    kick();
  }).observe(stage);
}

export function initReactors(): void {
  const hero = document.querySelector<SVGSVGElement>('[data-reactor="hero"]');
  if (hero) {
    charge(hero, 0, 1, 700);
    const stage = hero.closest<HTMLElement>('[data-reactor-stage]');
    if (stage) tilt(stage, hero);
  }

  const final = document.querySelector<SVGSVGElement>('[data-reactor="final"]');
  if (final) {
    setLevel(final, 2);
    const stage = final.closest<HTMLElement>('[data-reactor-stage]') ?? final.parentElement!;
    tilt(stage, final);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        charge(final, 2, 3, 380);
      },
      { threshold: 0.6 },
    );
    io.observe(final);
  }
}
