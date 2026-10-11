import { gsap } from 'gsap';
import { SCENE_READY, SITE_LOADED } from '../lib/stage-events';

const CONFIG = {
  /** Tiempo mínimo visible (ms): evita un parpadeo en recargas rápidas */
  minVisible: 700,
  /** Si algo tarda demasiado (red lenta, sin WebGL), se continúa igual (ms) */
  maxWait: 9000,
};

/**
 * Muestra el progreso real de la carga y resuelve la promesa cuando la pantalla
 * de carga terminó de salir. El resto del sitio espera esa promesa para animar su entrada.
 */
export function runPreloader(): Promise<void> {
  const root = document.documentElement;
  const el = document.querySelector<HTMLElement>('[data-preloader]');
  const done = () => {
    root.dataset.loaded = 'true';
    window.dispatchEvent(new Event(SITE_LOADED));
  };
  if (!el) {
    done();
    return Promise.resolve();
  }

  const bar = el.querySelector<HTMLElement>('[data-preloader-bar]');
  const count = el.querySelector<HTMLElement>('[data-preloader-count]');
  const inner = el.querySelector<HTMLElement>('[data-preloader-inner]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const startedAt = performance.now();

  // Indicador que avanza suave hacia el porcentaje real
  const shown = { value: 0 };
  const render = () => {
    if (count) count.textContent = String(Math.round(shown.value));
    if (bar) bar.style.transform = `scaleX(${shown.value / 100})`;
  };
  const advanceTo = (value: number, duration = 0.6) =>
    gsap.to(shown, { value, duration, ease: 'power2.out', onUpdate: render, overwrite: true });

  // Hitos reales de carga, cada uno con su peso
  const milestones: Array<[Promise<unknown>, number]> = [
    [document.fonts?.ready ?? Promise.resolve(), 25],
    [
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((r) => window.addEventListener('load', r, { once: true })),
      25,
    ],
    [
      root.dataset.scene === 'ready'
        ? Promise.resolve()
        : new Promise((r) => window.addEventListener(SCENE_READY, r, { once: true })),
      50,
    ],
  ];
  let progress = 0;
  advanceTo(8, 0.4);
  milestones.forEach(([p, weight]) =>
    p.then(() => {
      progress += weight;
      advanceTo(Math.min(progress, 99));
    }),
  );

  const allReady = Promise.all(milestones.map(([p]) => p));
  const timeout = new Promise((r) => setTimeout(r, CONFIG.maxWait));
  const minTime = new Promise((r) => setTimeout(r, CONFIG.minVisible));

  return Promise.race([allReady, timeout])
    .then(() => minTime)
    .then(
      () =>
        new Promise<void>((resolve) => {
          const tl = gsap.timeline({
            onComplete: () => el.remove(),
          });
          tl.to(shown, { value: 100, duration: 0.35, ease: 'power2.out', onUpdate: render, overwrite: true });
          if (reduce) {
            tl.to(el, { autoAlpha: 0, duration: 0.3 });
          } else {
            tl.to(inner, { scale: 0.92, autoAlpha: 0, duration: 0.55, ease: 'power2.in' }, '+=0.1').to(
              el,
              { autoAlpha: 0, duration: 0.6, ease: 'power2.inOut' },
              '-=0.25',
            );
          }
          // El sitio empieza a aparecer mientras el velo se desvanece
          tl.call(
            () => {
              done();
              resolve();
            },
            undefined,
            reduce ? 0.35 : '-=0.45',
          );
        }),
    );
}
