import { gsap } from 'gsap';
import { STAGE_CHANGE } from '../lib/stage-events';

import { LANG_STORAGE_KEY } from '../lib/lang-redirect';

export { LANG_STORAGE_KEY };

const ROLL = { duration: 0.5, stagger: 0.028, ease: 'power3.out' };
const MENU_SPEED = 1.22;

function initRoll(): void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll<HTMLElement>('[data-roll]').forEach((roll) => {
    const text = roll.textContent?.trim() ?? '';
    const host = roll.closest<HTMLElement>('a, button') ?? roll;
    roll.textContent = '';
    const fronts: HTMLElement[] = [];
    const backs: HTMLElement[] = [];
    for (const ch of text) {
      const cell = document.createElement('span');
      cell.className = ch === ' ' ? 'rc rc-space' : 'rc';
      const a = document.createElement('span');
      a.className = 'rc-a';
      a.textContent = ch === ' ' ? '\u00a0' : ch;
      const b = document.createElement('span');
      b.className = 'rc-b';
      b.setAttribute('aria-hidden', 'true');
      b.textContent = a.textContent;
      cell.append(a, b);
      roll.append(cell);
      fronts.push(a);
      backs.push(b);
    }
    if (!host.hasAttribute('aria-label')) host.setAttribute('aria-label', text);
    roll.setAttribute('aria-hidden', 'true');
    if (reduce) {
      backs.forEach((b) => b.remove());
      return;
    }
    gsap.set(backs, { yPercent: 100 });

    let shown = fronts;
    let hidden = backs;
    const swap = () => {
      gsap.killTweensOf([...fronts, ...backs]);
      const enter = hidden;
      const leave = shown;
      enter.forEach((el) => {
        if ((gsap.getProperty(el, 'yPercent') as number) <= -99) gsap.set(el, { yPercent: 100 });
      });
      gsap.to(leave, { yPercent: -100, duration: ROLL.duration, stagger: ROLL.stagger, ease: ROLL.ease });
      gsap.to(enter, { yPercent: 0, duration: ROLL.duration, stagger: ROLL.stagger, ease: ROLL.ease });
      shown = enter;
      hidden = leave;
    };
    host.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse' && shown === fronts) swap();
    });
    host.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse' && shown === backs) swap();
    });
  });
}

const PULSE = { step: 0.075, rise: 0.12, hold: 0.02, fall: 0.3 };

function initBrandPulse(): void {
  const brand = document.querySelector<HTMLElement>('.nav-brand');
  const letters = brand ? Array.from(brand.querySelectorAll<HTMLElement>('.wm')) : [];
  if (!brand || !letters.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const center = (letters.length - 1) / 2;
  let tl: gsap.core.Timeline | null = null;
  brand.addEventListener('click', () => {
    if (reduce) return;
    tl?.kill();
    brand.classList.add('is-pulsing');
    tl = gsap.timeline({
      onComplete: () => {
        gsap.set(letters, { clearProps: 'color,textShadow,y' });
        brand.classList.remove('is-pulsing');
      },
    });
    letters.forEach((el, i) => {
      const at = Math.floor(Math.abs(i - center)) * PULSE.step;
      tl!
        .to(el, { color: '#5af08f', textShadow: '0 0 12px rgba(90,240,143,0.8)', y: -2, duration: PULSE.rise, ease: 'power2.out' }, at)
        .to(el, { color: '#f4f4f5', textShadow: '0 0 0px rgba(90,240,143,0)', y: 0, duration: PULSE.fall, ease: 'power2.inOut' }, at + PULSE.rise + PULSE.hold);
    });
  });
}

export function initNavigation(): void {
  const root = document.documentElement;
  if (root.dataset.navReady) return;
  root.dataset.navReady = 'true';
  initRoll();
  initBrandPulse();
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slats = menu ? Array.from(menu.querySelectorAll<HTMLElement>('.menu-slats i')) : [];
  const glow = menu?.querySelector<HTMLElement>('.menu-glow') ?? null;
  const seal = menu?.querySelector<HTMLElement>('.menu-seal') ?? null;
  const fades = menu ? Array.from(menu.querySelectorAll<HTMLElement>('[data-menu-fade]')) : [];
  const rows = menu ? Array.from(menu.querySelectorAll<HTMLElement>('.menu-row')) : [];
  const hints = rows.map((r) => r.querySelector<HTMLElement>('.menu-hint')).filter(Boolean) as HTMLElement[];
  const lines = rows.map((r) => r.querySelector<HTMLElement>('.menu-line')).filter(Boolean) as HTMLElement[];
  const chars = rows.map((r) => Array.from(r.querySelectorAll<HTMLElement>('.mc')));
  let tl: gsap.core.Timeline | null = null;
  let isOpen = false;

  const animateOpen = () => {
    if (!menu) return;
    tl?.kill();
    menu.querySelectorAll('.is-chosen').forEach((el) => el.classList.remove('is-chosen'));
    if (reduce) {
      gsap.set(slats, { scaleY: 1 });
      gsap.set(menu, { visibility: 'visible', autoAlpha: 0 });
      tl = gsap.timeline().to(menu, { autoAlpha: 1, duration: 0.3 });
      return;
    }
    tl = gsap.timeline();
    tl.timeScale(MENU_SPEED);
    menu.classList.add('is-moving');
    tl.set(menu, { visibility: 'visible', autoAlpha: 1 })
      .call(() => menu.classList.remove('is-moving'), undefined, 0.85)
      .fromTo(slats, { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 0.7, stagger: 0.06, ease: 'expo.inOut' }, 0)
      .fromTo(glow, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: 'power2.out' }, 0.45)
      .fromTo(fades[0] ?? [], { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.4)
      .fromTo(lines, { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.06, ease: 'power3.inOut' }, 0.45);
    chars.forEach((set, n) => {
      tl!.fromTo(
        set,
        { yPercent: -120, rotationX: 70, transformOrigin: '50% 0%' },
        { yPercent: 0, rotationX: 0, duration: 0.85, stagger: 0.02, ease: 'expo.out' },
        0.42 + n * 0.07,
      );
    });
    tl.fromTo(hints, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out' }, 0.65)
      .fromTo(fades.slice(1), { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.75);
    if (seal) tl.fromTo(seal, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 0.14, scale: 1, duration: 1.4, ease: 'expo.out' }, 0.55);
  };

  const animateClose = () => {
    if (!menu) return;
    tl?.kill();
    if (reduce) {
      tl = gsap.timeline().to(menu, { autoAlpha: 0, duration: 0.25 }).set(menu, { visibility: 'hidden' });
      return;
    }
    tl = gsap.timeline();
    tl.timeScale(MENU_SPEED);
    tl.to([...fades, ...hints, glow, seal].filter(Boolean), { autoAlpha: 0, y: -10, duration: 0.25, ease: 'power2.in' }, 0)
      .to(lines, { scaleX: 0, transformOrigin: '100% 50%', duration: 0.35, ease: 'power2.in' }, 0);
    [...chars].reverse().forEach((set, n) => {
      tl!.to(set, { yPercent: -120, rotationX: 70, duration: 0.4, stagger: 0.012, ease: 'power3.in' }, n * 0.04);
    });
    tl.call(() => menu.classList.add('is-moving'), undefined, 0.2)
      .to([...slats].reverse(), { scaleY: 0, transformOrigin: '50% 0%', duration: 0.55, stagger: 0.05, ease: 'expo.inOut' }, 0.22)
      .set(menu, { visibility: 'hidden' })
      .call(() => menu.classList.remove('is-moving'))
      .set(lines, { clearProps: 'transformOrigin' });
  };

  const setOpen = (open: boolean) => {
    if (open === isOpen) return;
    isOpen = open;
    root.dataset.menu = open ? 'open' : 'closed';
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', (open ? toggle.dataset.labelClose : toggle.dataset.labelOpen) ?? '');
    }
    if (menu) {
      menu.inert = !open;
      if (open) {
        animateOpen();
        menu.querySelector<HTMLElement>('.menu-item')?.focus({ preventScroll: true });
      } else animateClose();
    }
  };

  if (menu) menu.inert = true;
  toggle?.addEventListener('click', () => setOpen(!isOpen));
  menu?.addEventListener('click', (e) => {
    const link = (e.target as Element).closest('a');
    if (!link) return;
    link.closest('.menu-item')?.classList.add('is-chosen');
    if (link.hasAttribute('data-goto') || link.hasAttribute('data-lang-link')) setOpen(false);
  });
  window.addEventListener(STAGE_CHANGE, () => setOpen(false));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.dataset.menu === 'open') {
      setOpen(false);
      toggle?.focus();
    }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (mq) => {
    if (mq.matches) setOpen(false);
  });

  document.querySelectorAll<HTMLAnchorElement>('[data-lang-link]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      try {
        localStorage.setItem(LANG_STORAGE_KEY, link.dataset.langLink ?? '');
      } catch {
      }
      location.href = link.pathname + location.hash;
    });
  });
}
