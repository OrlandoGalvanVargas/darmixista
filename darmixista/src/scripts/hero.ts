import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SITE_LOADED, STAGE_CHANGE, isSiteLoaded } from '../lib/stage-events';

gsap.registerPlugin(ScrambleTextPlugin);

const INTRO = {
  name: { rest: 0.75, load: 0.32, snap: 0.42, crack: 0.2, whip: 0.95, lag: 0.08, angle: 82, depth: 4.2, pull: 0.3, lift: 0.05, shineAt: 1.55, shine: 1.4 },
  hello: { at: 0.5, duration: 0.7, each: 0.055 },
  role: { at: 0.8, duration: 1.2 },
  ctas: { at: 0.95 },
  seal: { at: 1.1, duration: 1.3 },
  revisitSpeed: 1.5,
  revisitDelay: 0.2,
};

const HOVER = { radius: 0.95, lift: 0.085, scale: 0.05 };

const TOUCH = { hold: 900 };

export function initHero(): void {
  const section = document.getElementById('home');
  if (!section || section.dataset.heroReady) return;
  section.dataset.heroReady = 'true';

  const root = document.documentElement;
  const backdrop = document.querySelector<HTMLElement>('[data-hero-backdrop]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const outline = Array.from(section.querySelectorAll<HTMLElement>('[data-hero-name="outline"] .hc'));
  const fill = backdrop ? Array.from(backdrop.querySelectorAll<HTMLElement>('.hc')) : [];
  const chars = [...outline, ...fill];
  const hello = section.querySelector<HTMLElement>('[data-hero-hello]');
  const helloChars = hello ? Array.from(hello.querySelectorAll<HTMLElement>('.hhc')) : [];
  const role = section.querySelector<HTMLElement>('[data-hero-role]');
  const roleText = role?.textContent ?? '';
  const ctas = Array.from(section.querySelectorAll<HTMLElement>('[data-hero-cta]'));
  const seal = section.querySelector<HTMLElement>('[data-hero-seal]');
  const scrollCue = section.querySelector<HTMLElement>('[data-hero-scroll]');
  const nexts = [seal, scrollCue].filter(Boolean) as HTMLElement[];
  const sealRing = seal?.querySelector<SVGElement>('.hero-seal-ring') ?? null;

  if (backdrop) {
    const props = ['opacity', 'visibility', 'transform', 'clipPath'] as const;
    gsap.ticker.add(() => {
      const from = section.style;
      const to = backdrop.style;
      for (const p of props) if (to[p] !== from[p]) to[p] = from[p];
    });
  }

  const spin = sealRing && !reduce
    ? gsap.to(sealRing, { rotation: 360, duration: 28, ease: 'none', repeat: -1, transformOrigin: '50% 50%' })
    : null;
  const speedUp = () => spin && gsap.to(spin, { timeScale: 6, duration: 0.6, ease: 'power2.out' });
  const slowDown = () => spin && gsap.to(spin, { timeScale: 1, duration: 1.2, ease: 'power2.out' });
  if (seal && spin) {
    seal.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && speedUp());
    seal.addEventListener('pointerleave', (e) => e.pointerType === 'mouse' && slowDown());
  }

  const pressable = (el: HTMLElement, onPress?: () => void, onRelease?: () => void) => {
    let timer = 0;
    const release = () => {
      window.clearTimeout(timer);
      if (!el.classList.contains('is-pressed')) return;
      el.classList.remove('is-pressed');
      onRelease?.();
    };
    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      window.clearTimeout(timer);
      el.classList.add('is-pressed');
      onPress?.();
    });
    el.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'mouse') return;
      window.clearTimeout(timer);
      timer = window.setTimeout(release, TOUCH.hold);
    });
    el.addEventListener('pointercancel', release);
  };
  if (!reduce) {
    ctas.forEach((cta) => pressable(cta));
    if (seal) pressable(seal, speedUp, slowDown);
  }

  const ctaParts = (cta: HTMLElement) => ({
    dot: cta.querySelector<HTMLElement>('.hero-cta-dot'),
    text: Array.from(cta.querySelectorAll<HTMLElement>('.hero-cta-kicker, .hero-cta-label')),
    bar: cta.querySelector<HTMLElement>('.hero-cta-bar'),
  });

  let intro: gsap.core.Timeline | null = null;
  let sheen: gsap.core.Tween | null = null;

  const nameFill = fill[0]?.closest<HTMLElement>('.hero-name') ?? null;
  const shine = () => {
    if (!nameFill || !fill.length) return;
    sheen?.kill();
    gsap.set(fill, { clearProps: 'transform' });
    const box = nameFill.getBoundingClientRect();
    const rects = fill.map((c) => c.getBoundingClientRect());
    const start = Math.min(...rects.map((r) => r.left)) - box.left;
    const width = Math.max(...rects.map((r) => r.right)) - box.left - start;
    fill.forEach((c, i) => c.style.setProperty('--ox', `${rects[i].left - box.left - start}px`));
    nameFill.style.setProperty('--hw', `${width}px`);
    nameFill.classList.add('is-shine');
    sheen = gsap.fromTo(
      nameFill,
      { '--sx': `${-width * 0.8}px` },
      {
        '--sx': `${width * 0.8}px`,
        duration: INTRO.name.shine,
        ease: 'sine.inOut',
        onComplete: () => nameFill.classList.remove('is-shine'),
      },
    );
  };
  let measured = false;
  let active = false;
  let movers: { y: gsap.QuickToFunc; s: gsap.QuickToFunc }[] = [];

  const relax = () => {
    if (!active) return;
    active = false;
    movers.forEach((m) => {
      m.y(0);
      m.s(1);
    });
  };

  const hide = () => {
    intro?.kill();
    gsap.set(chars, { autoAlpha: 0, x: 0, y: 0, z: 0, rotationY: 0, scaleY: 1 });
    if (hello) gsap.set(hello, { autoAlpha: 1, y: 0 });
    sheen?.kill();
    nameFill?.classList.remove('is-shine');
    gsap.set(helloChars, { autoAlpha: 0, filter: 'blur(6px)', color: '#5af08f', textShadow: '0 0 18px rgba(90,240,143,0.9)' });
    if (role) gsap.set(role, { autoAlpha: 0 });
    ctas.forEach((cta) => {
      const { dot, text, bar } = ctaParts(cta);
      if (dot) gsap.set(dot, { scale: 0 });
      gsap.set(text, { autoAlpha: 0, y: 18 });
      if (bar) gsap.set(bar, { scaleX: 0, transformOrigin: getComputedStyle(cta).flexDirection === 'row-reverse' ? '100% 50%' : '0% 50%' });
    });
    if (seal) gsap.set(seal, { autoAlpha: 0, scale: 0.6, rotation: -90 });
    if (scrollCue) gsap.set(scrollCue, { autoAlpha: 0, y: 16 });
  };

  const play = (revisit: boolean) => {
    intro?.kill();
    const tl = gsap.timeline({ delay: revisit ? INTRO.revisitDelay : 0.05 });
    intro = tl;
    if (revisit) tl.timeScale(INTRO.revisitSpeed);

    if (outline.length) {
      const g = INTRO.name;
      gsap.set(chars, { x: 0, y: 0, z: 0, rotationY: 0, rotation: 0, scaleX: 1, scaleY: 1, transformOrigin: '50% 50%' });
      const nameBox = (outline[0].closest('.hero-name') ?? outline[0]).getBoundingClientRect();
      const offsets = outline.map((c) => {
        const r = c.getBoundingClientRect();
        return r.left + r.width / 2 - (nameBox.left + nameBox.width / 2);
      });
      const span = Math.max(...offsets.map(Math.abs)) || 1;
      const font = parseFloat(getComputedStyle(outline[0]).fontSize) || 100;
      const pairs = outline.map((c, i) => [c, fill[i]].filter(Boolean) as HTMLElement[]);
      pairs.forEach((pair, i) => {
        const dx = offsets[i];
        const far = Math.abs(dx) / span;
        const side = Math.sign(dx);
        const curl = Math.pow(far, 1.6);
        const bend = { v: g.rest };
        const draw = () => {
          const v = bend.v;
          gsap.set(pair, {
            rotationY: -side * v * curl * g.angle,
            z: -v * curl * font * g.depth,
            x: -dx * Math.abs(v) * curl * g.pull,
            y: -v * curl * font * g.lift,
          });
        };
        draw();
        tl.to(pair, { autoAlpha: 1, duration: 0.2, ease: 'power1.out' }, 0)
          .to(bend, { v: 1, duration: g.load, ease: 'power2.in', onUpdate: draw }, 0)
          .to(bend, { v: -g.snap, duration: g.crack, ease: 'power3.out', onUpdate: draw }, g.load + far * g.lag)
          .to(bend, { v: 0, duration: g.whip, ease: 'elastic.out(1.1, 0.35)', onUpdate: draw }, g.load + far * g.lag + g.crack);
      });
      tl.set(chars, { clearProps: 'transformOrigin' });
      tl.call(() => shine(), undefined, g.shineAt);
    }
    if (helloChars.length) {
      const h = INTRO.hello;
      tl.to(
        helloChars,
        {
          autoAlpha: 1,
          filter: 'blur(0px)',
          duration: h.duration,
          stagger: h.each,
          ease: 'power2.out',
        },
        h.at,
      )
        .to(
          helloChars,
          { color: '#c4c8c6', textShadow: '0 0 0px rgba(90,240,143,0)', duration: 0.9, stagger: h.each, ease: 'power2.out' },
          h.at + 0.35,
        )
        .set(helloChars, { clearProps: 'filter,textShadow,color' }, h.at + 0.35 + 0.9 + helloChars.length * h.each);
    }
    if (role) {
      tl.set(role, { autoAlpha: 1 }, INTRO.role.at).fromTo(
        role,
        { scrambleText: { text: ' ' } },
        {
          duration: INTRO.role.duration,
          ease: 'none',
          scrambleText: { text: roleText, chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', speed: 0.5, revealDelay: 0.15 },
        },
        INTRO.role.at,
      );
    }
    ctas.forEach((cta, n) => {
      const { dot, text, bar } = ctaParts(cta);
      const at = INTRO.ctas.at + n * 0.12;
      if (dot) tl.to(dot, { scale: 1, duration: 0.9, ease: 'back.out(1.8)' }, at);
      tl.to(text, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' }, at + 0.08);
      if (bar) tl.to(bar, { scaleX: 1, duration: 1.1, ease: 'power3.inOut' }, at + 0.15);
    });
    if (seal) tl.to(seal, { autoAlpha: 1, scale: 1, rotation: 0, duration: INTRO.seal.duration, ease: 'expo.out' }, INTRO.seal.at);
    if (scrollCue) tl.to(scrollCue, { autoAlpha: 1, y: 0, duration: INTRO.seal.duration, ease: 'expo.out' }, INTRO.seal.at);
    tl.call(() => {
      if (role) role.textContent = roleText;
      measured = false;
    });
  };

  const showAll = () => {
    intro?.kill();
    gsap.set(chars, { autoAlpha: 1, clearProps: 'transform' });
    gsap.set([hello, role, ...nexts].filter(Boolean), { autoAlpha: 1, y: 0, scale: 1, rotation: 0 });
    gsap.set(helloChars, { clearProps: 'all' });
    ctas.forEach((cta) => {
      const { dot, text, bar } = ctaParts(cta);
      gsap.set([dot, bar, ...text].filter(Boolean), { autoAlpha: 1, y: 0, scale: 1, scaleX: 1 });
    });
  };

  if (reduce) showAll();
  else {
    hide();
    if (isSiteLoaded()) play(false);
    else window.addEventListener(SITE_LOADED, () => {
      if (root.dataset.currentSection === 'home') play(false);
    }, { once: true });
  }

  window.addEventListener(STAGE_CHANGE, (e) => {
    const { id, previousId } = e.detail;
    if (reduce || !isSiteLoaded()) return;
    if (id === 'home' && previousId !== 'home') {
      hide();
      play(true);
    }
    if (id !== 'home') relax();
  });

  if (!fine || reduce || !outline.length) return;

  const pairs = outline.map((c, i) => [c, fill[i]].filter(Boolean) as HTMLElement[]);
  movers = pairs.map((pair) => ({
    y: gsap.quickTo(pair, 'y', { duration: 0.6, ease: 'power3.out' }),
    s: gsap.quickTo(pair, 'scale', { duration: 0.6, ease: 'power3.out' }),
  }));
  let centers: { x: number; y: number }[] = [];
  let fontPx = 0;

  const measure = () => {
    fontPx = parseFloat(getComputedStyle(outline[0]).fontSize) || 100;
    centers = outline.map((c) => {
      const r = c.getBoundingClientRect();
      const y = gsap.getProperty(c, 'y') as number;
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 - y };
    });
    measured = true;
  };

  window.addEventListener('resize', () => {
    measured = false;
  });
  document.fonts?.ready.then(() => {
    measured = false;
  });

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      if (root.dataset.currentSection !== 'home' || root.dataset.menu === 'open' || intro?.isActive()) {
        relax();
        return;
      }
      if (!measured) measure();
      const sigma = fontPx * HOVER.radius;
      const k = -1 / (2 * sigma * sigma);
      active = true;
      centers.forEach((c, i) => {
        const dx = c.x - e.clientX;
        const dy = (c.y - e.clientY) * 1.25;
        const inf = Math.exp((dx * dx + dy * dy) * k);
        movers[i].y(-inf * fontPx * HOVER.lift);
        movers[i].s(1 + inf * HOVER.scale);
      });
    },
    { passive: true },
  );
  root.addEventListener('pointerleave', relax);
}
