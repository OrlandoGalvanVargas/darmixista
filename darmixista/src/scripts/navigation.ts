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

export function initNavigation(): void {
  const root = document.documentElement;
  if (root.dataset.navReady) return;
  root.dataset.navReady = 'true';
  initRoll();
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rim = menu?.querySelector<HTMLElement>('[data-menu-rim]') ?? null;
  const seal = menu?.querySelector<HTMLElement>('.menu-seal') ?? null;
  const fades = menu ? Array.from(menu.querySelectorAll<HTMLElement>('[data-menu-fade]')) : [];
  const rows = menu ? Array.from(menu.querySelectorAll<HTMLElement>('.menu-row')) : [];
  const hints = rows.map((r) => r.querySelector<HTMLElement>('.menu-hint')).filter(Boolean) as HTMLElement[];
  const lines = rows.map((r) => r.querySelector<HTMLElement>('.menu-line')).filter(Boolean) as HTMLElement[];
  const chars = rows.map((r) => Array.from(r.querySelectorAll<HTMLElement>('.mc')));
  let tl: gsap.core.Timeline | null = null;
  let isOpen = false;

  const origin = () => {
    if (!menu || !toggle) return 0;
    const r = toggle.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 40;
    menu.style.setProperty('--mx', `${x}px`);
    menu.style.setProperty('--my', `${y}px`);
    menu.style.setProperty('--mr', `${radius}px`);
    return radius;
  };

  const animateOpen = () => {
    if (!menu) return;
    const radius = origin();
    tl?.kill();
    menu.querySelectorAll('.is-chosen').forEach((el) => el.classList.remove('is-chosen'));
    if (reduce) {
      gsap.set(menu, { visibility: 'visible', clipPath: 'none', autoAlpha: 0 });
      tl = gsap.timeline().to(menu, { autoAlpha: 1, duration: 0.3 });
      return;
    }
    const at = (v: string) => `circle(${v} at var(--mx) var(--my))`;
    tl = gsap.timeline();
    tl.timeScale(MENU_SPEED);
    tl.set(menu, { visibility: 'visible', autoAlpha: 1 })
      .fromTo(menu, { clipPath: at('0px') }, { clipPath: at(`${radius}px`), duration: 0.9, ease: 'expo.inOut' }, 0)
      .fromTo(rim, { scale: 0.02, opacity: 1 }, { scale: 1, duration: 0.9, ease: 'expo.inOut' }, 0)
      .to(rim, { opacity: 0, duration: 0.35, ease: 'power2.out' }, 0.7)
      .fromTo(fades[0] ?? [], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.35)
      .fromTo(lines, { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.06, ease: 'power3.inOut' }, 0.38);
    chars.forEach((set, n) => {
      tl!.fromTo(
        set,
        { yPercent: 115 },
        { yPercent: 0, duration: 0.8, stagger: 0.022, ease: 'expo.out' },
        0.42 + n * 0.065,
      );
    });
    tl.fromTo(hints, { autoAlpha: 0, x: 14 }, { autoAlpha: 1, x: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out' }, 0.62)
      .fromTo(fades.slice(1), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.75);
    if (seal) tl.fromTo(seal, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 0.14, scale: 1, duration: 1.4, ease: 'expo.out' }, 0.5);
  };

  const animateClose = () => {
    if (!menu) return;
    tl?.kill();
    if (reduce) {
      tl = gsap.timeline().to(menu, { autoAlpha: 0, duration: 0.25 }).set(menu, { visibility: 'hidden' });
      return;
    }
    origin();
    tl = gsap.timeline();
    tl.timeScale(MENU_SPEED);
    tl.to([...fades, ...hints], { autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, 0)
      .to(chars.flat(), { yPercent: -115, duration: 0.35, stagger: 0.004, ease: 'power3.in' }, 0)
      .to(menu, { clipPath: 'circle(0px at var(--mx) var(--my))', duration: 0.6, ease: 'expo.inOut' }, 0.12)
      .set(menu, { visibility: 'hidden' });
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
  window.addEventListener('resize', () => {
    if (isOpen) gsap.set(menu, { clipPath: `circle(${origin()}px at var(--mx) var(--my))` });
  });
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
