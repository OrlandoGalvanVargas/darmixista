import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SITE_LOADED, STAGE_CHANGE, isSiteLoaded } from '../lib/stage-events';

gsap.registerPlugin(ScrambleTextPlugin);

const INTRO = {
  name: { duration: 1.4, each: 0.05 },
  hello: { at: 0.3, duration: 0.9, each: 0.055, wave: 0.045 },
  role: { at: 0.6, duration: 1.2 },
  ctas: { at: 0.8 },
  seal: { at: 1, duration: 1.3 },
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
    gsap.set(chars, { yPercent: 110, autoAlpha: 0 });
    if (hello) gsap.set(hello, { autoAlpha: 1, y: 0 });
    gsap.set(helloChars, { autoAlpha: 0, rotationX: -100, yPercent: 40, filter: 'blur(8px)', color: '#5af08f', textShadow: '0 0 18px rgba(90,240,143,0.9)' });
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

    [outline, fill].forEach((set) => {
      if (!set.length) return;
      tl.to(
        set,
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: INTRO.name.duration,
          ease: 'expo.out',
          stagger: { each: INTRO.name.each, from: 'center' },
        },
        0,
      );
    });
    if (helloChars.length) {
      const h = INTRO.hello;
      tl.to(
        helloChars,
        {
          autoAlpha: 1,
          rotationX: 0,
          yPercent: 0,
          filter: 'blur(0px)',
          duration: h.duration,
          stagger: h.each,
          ease: 'back.out(2.2)',
        },
        h.at,
      )
        .to(
          helloChars,
          { color: '#c4c8c6', textShadow: '0 0 0px rgba(90,240,143,0)', duration: 0.9, stagger: h.each, ease: 'power2.out' },
          h.at + 0.35,
        )
        .to(
          helloChars,
          { yPercent: -22, duration: 0.28, stagger: h.wave, ease: 'sine.out', yoyo: true, repeat: 1 },
          h.at + h.duration + helloChars.length * h.each,
        )
        .set(helloChars, { clearProps: 'filter,textShadow,color' });
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
    gsap.set(chars, { yPercent: 0, autoAlpha: 1 });
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
