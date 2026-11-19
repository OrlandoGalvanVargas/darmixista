import { gsap } from 'gsap';
import { SCENE_READY, SITE_LOADED } from '../lib/stage-events';

const CONFIG = {
  minVisible: 1600,
  maxWait: 9000,
  word: 'DARMIXISTA',
  greenShare: 0.16,
  morph: 1.15,
  hold: 0.3,
  dissolve: 1,
};

const TAU = Math.PI * 2;
const LEVELS = 8;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const inOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);

interface Dot {
  u: number;
  v: number;
  a0: number;
  spin: number;
  phase: number;
  green: boolean;
  size: number;
  x: number;
  y: number;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  delay: number;
  curve: number;
  vx: number;
  vy: number;
}

function gaussian(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
}

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

  const bg = el.querySelector<HTMLElement>('[data-preloader-bg]');
  const canvas = el.querySelector<HTMLCanvasElement>('[data-preloader-canvas]');
  const ctx = canvas?.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0;
  let H = 0;
  let wordW = 0;
  let fontPx = 0;
  let tracking = 0;
  const resize = () => {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fontPx = Math.min(W * 0.085, 104);
    tracking = fontPx * 0.18;
    wordW = wordWidth(ctx);
  };

  const count = Math.round(Math.min(7000, Math.max(3000, window.innerWidth * 4.6)));
  const dots: Dot[] = Array.from({ length: count }, () => {
    const edge = Math.random() < 0.12;
    return {
      u: edge ? (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * 0.12) : Math.random() * 2 - 1,
      v: Math.max(-1.6, Math.min(1.6, gaussian() * 0.42)),
      a0: Math.random() * TAU,
      spin: (0.6 + Math.random() * 0.9) * (Math.random() < 0.5 ? 1 : -1),
      phase: Math.random() * TAU,
      green: Math.random() < CONFIG.greenShare,
      size: Math.random() < 0.85 ? 1 : 1.6,
      x: 0,
      y: 0,
      sx: 0,
      sy: 0,
      tx: 0,
      ty: 0,
      delay: 0,
      curve: 0,
      vx: 0,
      vy: 0,
    };
  });

  const fontFamily = getComputedStyle(document.body).fontFamily;
  const font = () => `600 ${fontPx}px ${fontFamily}`;
  const wordWidth = (g: CanvasRenderingContext2D) => {
    g.font = font();
    const letters = [...CONFIG.word];
    return letters.reduce((w, ch) => w + g.measureText(ch).width, 0) + tracking * (letters.length - 1);
  };
  const paintWord = (g: CanvasRenderingContext2D, x0: number, cy: number) => {
    g.font = font();
    g.textBaseline = 'middle';
    let x = x0;
    for (const ch of CONFIG.word) {
      g.fillText(ch, x, cy);
      x += g.measureText(ch).width + tracking;
    }
  };

  resize();
  window.addEventListener('resize', resize);
  document.fonts?.ready.then(resize);

  const assignTargets = () => {
    const off = document.createElement('canvas');
    off.width = Math.ceil(W);
    off.height = Math.ceil(H);
    const g = off.getContext('2d', { willReadFrequently: true });
    if (!g) return;
    const width = wordWidth(g);
    g.fillStyle = '#fff';
    paintWord(g, (W - width) / 2, H / 2);
    const data = g.getImageData(0, 0, off.width, off.height).data;
    const pts: number[] = [];
    for (let y = 0; y < off.height; y += 1) {
      for (let x = 0; x < off.width; x += 1) {
        if (data[(y * off.width + x) * 4 + 3] > 140) pts.push(x, y);
      }
    }
    const n = pts.length / 2;
    if (!n) return;
    const left = (W - width) / 2;
    dots.forEach((d) => {
      const k = Math.floor(Math.random() * n) * 2;
      d.tx = pts[k] + Math.random() - 0.5;
      d.ty = pts[k + 1] + Math.random() - 0.5;
      d.sx = d.x;
      d.sy = d.y;
      d.delay = clamp01((d.tx - left) / width) * 0.38 + Math.random() * 0.12;
      d.curve = (Math.random() - 0.5) * fontPx * 0.9;
    });
  };

  const state = { progress: 0, morph: 0, solid: 0, dissolve: 0 };
  let phase: 'cloud' | 'morph' | 'out' = 'cloud';
  let time = 0;
  const buckets: number[][][] = [
    Array.from({ length: LEVELS }, () => []),
    Array.from({ length: LEVELS }, () => []),
  ];

  const draw = () => {
    if (!ctx) return;
    const dt = Math.min(0.05, gsap.ticker.deltaRatio(60) / 60);
    time += dt;
    const cx = W / 2;
    const cy = H / 2;
    const p = state.progress;
    const halfW = wordW * 0.5;
    const halfH = fontPx * (0.62 - 0.18 * p);

    buckets.forEach((b) => b.forEach((l) => (l.length = 0)));

    for (const d of dots) {
      let alpha: number;
      if (phase === 'cloud') {
        const a = d.a0 + time * d.spin;
        const flow = Math.sin(a) * 0.1 + Math.sin(time * 0.7 + d.phase) * 0.05;
        const lift = Math.cos(a * 1.3 + d.phase) * 0.45;
        d.x = cx + halfW * (d.u + flow) + Math.sin(time * 2.3 + d.phase * 3) * 3;
        d.y = cy + halfH * (d.v + lift) + Math.cos(time * 2.1 + d.phase * 2) * 3;
        alpha = (0.6 + 0.35 * p) * (0.65 + 0.35 * Math.sin(time * 3 + d.phase));
      } else if (phase === 'morph') {
        const m = inOut(clamp01((state.morph - d.delay) / 0.5));
        const arc = Math.sin(Math.PI * m) * d.curve;
        d.x = d.sx + (d.tx - d.sx) * m + arc * 0.4;
        d.y = d.sy + (d.ty - d.sy) * m - arc;
        alpha = (0.55 + 0.4 * m) * (1 - state.solid * 0.55) * (0.75 + 0.25 * Math.sin(time * 4 + d.phase));
      } else {
        const k = clamp01((state.dissolve - d.delay * 0.7) / 0.55);
        d.x += d.vx * k * dt;
        d.y += d.vy * k * dt;
        alpha = 0.5 * (1 - k) * (1 - k);
      }
      if (alpha <= 0.02) continue;
      const level = Math.min(LEVELS - 1, Math.floor(alpha * LEVELS));
      buckets[d.green ? 1 : 0][level].push(d.x, d.y, d.size);
    }

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    buckets.forEach((levels, colorIndex) => {
      ctx.fillStyle = colorIndex ? '#5af08f' : '#e4e4e7';
      levels.forEach((list, level) => {
        if (!list.length) return;
        ctx.globalAlpha = (level + 0.5) / LEVELS;
        for (let i = 0; i < list.length; i += 3) ctx.fillRect(list[i], list[i + 1], list[i + 2], list[i + 2]);
      });
    });
    ctx.globalCompositeOperation = 'source-over';

    if (state.solid > 0) {
      const width = wordWidth(ctx);
      const fade = phase === 'out' ? Math.max(0, 1 - state.dissolve * 2.2) : 1;
      ctx.globalAlpha = state.solid * fade;
      const grad = ctx.createLinearGradient(0, cy - fontPx / 2, 0, cy + fontPx / 2);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#b9bcc1');
      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(90, 240, 143, 0.35)';
      ctx.shadowBlur = 24 * state.solid;
      paintWord(ctx, (W - width) / 2, cy);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  };

  if (ctx && !reduce) gsap.ticker.add(draw);

  const advanceTo = (value: number, duration = 0.9) =>
    gsap.to(state, { progress: value, duration, ease: 'power2.out', overwrite: 'auto' });

  const milestones: Array<[Promise<unknown>, number]> = [
    [document.fonts?.ready ?? Promise.resolve(), 0.25],
    [
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((r) => window.addEventListener('load', r, { once: true })),
      0.25,
    ],
    [
      root.dataset.scene === 'ready'
        ? Promise.resolve()
        : new Promise((r) => window.addEventListener(SCENE_READY, r, { once: true })),
      0.5,
    ],
  ];
  let progress = 0;
  advanceTo(0.1, 0.8);
  milestones.forEach(([p, weight]) =>
    p.then(() => {
      progress += weight;
      advanceTo(Math.min(progress, 0.97));
    }),
  );

  const allReady = Promise.all(milestones.map(([p]) => p));
  const timeout = new Promise((r) => setTimeout(r, CONFIG.maxWait));
  const minTime = new Promise((r) => setTimeout(r, CONFIG.minVisible));

  const cleanup = () => {
    gsap.ticker.remove(draw);
    window.removeEventListener('resize', resize);
    el.remove();
  };

  return Promise.all([Promise.race([allReady, timeout]), minTime]).then(
    () =>
      new Promise<void>((resolve) => {
        const finish = () => {
          el.style.pointerEvents = 'none';
          done();
          resolve();
        };
        if (reduce || !ctx) {
          gsap.timeline({ onComplete: cleanup }).to(el, { autoAlpha: 0, duration: 0.4 }).call(finish, undefined, 0);
          return;
        }
        gsap
          .timeline({ onComplete: cleanup })
          .to(state, { progress: 1, duration: 0.35, ease: 'power2.out', overwrite: 'auto' })
          .call(() => {
            assignTargets();
            phase = 'morph';
          })
          .to(state, { morph: 1, duration: CONFIG.morph, ease: 'none' })
          .to(state, { solid: 1, duration: 0.45, ease: 'power2.out' }, '-=0.3')
          .to({}, { duration: CONFIG.hold })
          .call(() => {
            dots.forEach((d) => {
              d.x = d.tx;
              d.y = d.ty;
              d.vx = (Math.random() - 0.3) * 160;
              d.vy = -40 - Math.random() * 160;
            });
            phase = 'out';
            finish();
          })
          .to(bg, { opacity: 0, duration: 0.7, ease: 'power2.out' }, '<')
          .to(state, { dissolve: 1, duration: CONFIG.dissolve, ease: 'none' }, '<');
      }),
  );
}
