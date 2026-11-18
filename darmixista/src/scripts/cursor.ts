import { gsap } from 'gsap';
import { STAGE_CHANGE } from '../lib/stage-events';

const LENS_SCALE = 1.14;
const TOUCH_HOLD_MS = 180;
const TOUCH_SLOP = 10;
const TOUCH_LIFT = 78;
const TEXT_TAGS = 'p, li, dd, span, small';
const INTERACTIVE = 'a, button, [role="button"], [role="tab"], summary, label';
const NATIVE = 'input, textarea, select, [contenteditable="true"]';

const HAND_OPEN =
  '<path d="M18 11V6a2 2 0 0 0-4 0v1"/><path d="M14 10V4a2 2 0 0 0-4 0v2"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>';
const HAND_CLOSED =
  '<path d="M18 11.5V9a2 2 0 0 0-4 0v1.4"/><path d="M14 10V8a2 2 0 0 0-4 0v2"/><path d="M10 9.9V9a2 2 0 0 0-4 0v5"/><path d="M6 14a2 2 0 0 0-4 0"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8 2 2 0 1 1 4 0"/>';

const parseRgb = (value: string) => value.match(/\d+(\.\d+)?/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];

export function initCursor(): void {
  const root = document.documentElement;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (!fine && !coarse) return;

  const probe = document.createElement('span');
  probe.style.color = 'var(--color-muted)';
  document.body.appendChild(probe);
  const muted = parseRgb(getComputedStyle(probe).color);
  probe.remove();
  const isMuted = (el: Element) => {
    const [r, g, b] = parseRgb(getComputedStyle(el).color);
    return Math.abs(r - muted[0]) + Math.abs(g - muted[1]) + Math.abs(b - muted[2]) < 40;
  };
  const mutedTextAt = (el: Element | null) => {
    if (!el || el.closest(NATIVE) || el.closest(INTERACTIVE) || el.closest('[data-mobile-menu]')) return null;
    const text = el.closest<HTMLElement>(TEXT_TAGS);
    return text && text.textContent?.trim() && isMuted(text) ? text : null;
  };

  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = `<span class="cursor-lens"><span class="cursor-lens-content"></span></span><span class="cursor-ring"></span><span class="cursor-orbit"><i></i></span><span class="cursor-grab"><svg class="cursor-arrows" viewBox="0 0 56 56" fill="none"><circle cx="28" cy="28" r="25" stroke-dasharray="50 28.5" /><path d="M49 23.5 53 28.5 57 23.5" transform="rotate(114.6 28 28) translate(-4 0)" /><path d="M49 23.5 53 28.5 57 23.5" transform="rotate(294.6 28 28) translate(-4 0)" /></svg><svg class="cursor-hand cursor-hand-open" viewBox="0 0 24 24" fill="none">${HAND_OPEN}</svg><svg class="cursor-hand cursor-hand-closed" viewBox="0 0 24 24" fill="none">${HAND_CLOSED}</svg></span>`;
  document.body.appendChild(cursor);
  if (fine) root.classList.add('has-cursor');
  else cursor.classList.add('is-touch');

  const lens = cursor.querySelector<HTMLElement>('.cursor-lens-content')!;
  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.28, ease: 'power3.out' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.28, ease: 'power3.out' });

  let target: HTMLElement | null = null;
  let clone: HTMLElement | null = null;
  let px = -100;
  let py = -100;
  let sx = -100;
  let sy = -100;
  let shown = false;
  let touchLens = false;

  const setState = (state: string) => {
    if (cursor.dataset.state !== state) cursor.dataset.state = state;
  };

  const clearLens = () => {
    target = null;
    clone?.remove();
    clone = null;
  };

  const startLens = (el: HTMLElement) => {
    clearLens();
    target = el;
    const cs = getComputedStyle(el);
    clone = el.cloneNode(true) as HTMLElement;
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    Object.assign(clone.style, {
      position: 'absolute',
      margin: '0',
      width: `${el.getBoundingClientRect().width}px`,
      font: cs.font,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      wordSpacing: cs.wordSpacing,
      textAlign: cs.textAlign,
      textTransform: cs.textTransform,
      whiteSpace: cs.whiteSpace,
      color: '#050606',
      opacity: '1',
      visibility: 'visible',
      transform: 'none',
      maxWidth: 'none',
    });
    lens.appendChild(clone);
  };

  gsap.ticker.add(() => {
    if (!clone || !target) return;
    const r = target.getBoundingClientRect();
    const ax = touchLens ? sx : (gsap.getProperty(cursor, 'x') as number);
    const ay = touchLens ? sy : (gsap.getProperty(cursor, 'y') as number);
    clone.style.left = `${r.left - ax}px`;
    clone.style.top = `${r.top - ay}px`;
    clone.style.transformOrigin = `${ax - r.left}px ${ay - r.top}px`;
    clone.style.transform = `scale(${LENS_SCALE})`;
  });

  const resolve = (el: Element | null) => {
    if (root.dataset.ringsDrag) {
      clearLens();
      setState('grabbing');
      return;
    }
    if (root.dataset.ringsHover) {
      clearLens();
      setState('grab');
      return;
    }
    if (!el) {
      clearLens();
      setState('');
      return;
    }
    if (el.closest(NATIVE)) {
      clearLens();
      setState('native');
      return;
    }
    if (el.closest(INTERACTIVE)) {
      clearLens();
      setState('link');
      return;
    }
    const text = mutedTextAt(el);
    if (text) {
      if (text !== target) startLens(text);
      setState('lens');
      return;
    }
    clearLens();
    setState('');
  };
  const refresh = () => requestAnimationFrame(() => resolve(document.elementFromPoint(px, py)));

  if (fine) {
    window.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerType !== 'mouse') return;
        px = e.clientX;
        py = e.clientY;
        if (!shown) {
          shown = true;
          gsap.set(cursor, { x: px, y: py });
          cursor.classList.add('is-visible');
        }
        xTo(px);
        yTo(py);
      },
      { passive: true },
    );
    document.addEventListener('pointerover', (e) => {
      if (e.pointerType === 'mouse') resolve(e.target as Element);
    });
    document.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') cursor.classList.add('is-down');
    });
    document.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
    root.addEventListener('pointerleave', () => {
      shown = false;
      cursor.classList.remove('is-visible');
      clearLens();
    });
    new MutationObserver(refresh).observe(root, { attributes: true, attributeFilter: ['data-rings-hover', 'data-rings-drag'] });
    window.addEventListener('wheel', refresh, { passive: true });
    window.addEventListener('keydown', refresh);
    window.addEventListener(STAGE_CHANGE, () => setTimeout(refresh, 700));
    return;
  }

  let holdTimer = 0;
  let startX = 0;
  let startY = 0;

  const placeTouch = (x: number, y: number) => {
    sx = x;
    sy = y;
    gsap.set(cursor, { x, y: Math.max(48, y - TOUCH_LIFT) });
  };
  const endTouch = () => {
    clearTimeout(holdTimer);
    if (!touchLens) return;
    touchLens = false;
    cursor.classList.remove('is-visible');
    setState('');
    clearLens();
    delete root.dataset.lens;
  };

  window.addEventListener(
    'touchstart',
    (e) => {
      clearTimeout(holdTimer);
      if (e.touches.length !== 1 || root.dataset.menu === 'open') return;
      const t = e.touches[0];
      const text = mutedTextAt(document.elementFromPoint(t.clientX, t.clientY));
      if (!text) return;
      startX = t.clientX;
      startY = t.clientY;
      holdTimer = window.setTimeout(() => {
        touchLens = true;
        root.dataset.lens = 'on';
        startLens(text);
        placeTouch(startX, startY);
        setState('lens');
        cursor.classList.add('is-visible');
      }, TOUCH_HOLD_MS);
    },
    { passive: true },
  );
  window.addEventListener(
    'touchmove',
    (e) => {
      const t = e.touches[0];
      if (!touchLens) {
        if (Math.hypot(t.clientX - startX, t.clientY - startY) > TOUCH_SLOP) clearTimeout(holdTimer);
        return;
      }
      e.preventDefault();
      placeTouch(t.clientX, t.clientY);
      const text = mutedTextAt(document.elementFromPoint(t.clientX, t.clientY));
      if (text && text !== target) startLens(text);
    },
    { passive: false },
  );
  window.addEventListener('touchend', endTouch);
  window.addEventListener('touchcancel', endTouch);
  window.addEventListener('contextmenu', (e) => {
    if (touchLens) e.preventDefault();
  });
  window.addEventListener(STAGE_CHANGE, endTouch);
}
