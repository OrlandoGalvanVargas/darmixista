import { LANG_STORAGE_KEY } from '../../lib/lang-redirect';
import type { ScreenText } from './screens';
import type { DeskHandle, ShotKey } from './scene';

interface DeskConfig {
  lang: string;
  hashes: Record<ShotKey, string>;
  screen: ScreenText;
}

const ORDER: ShotKey[] = ['home', 'projects', 'about', 'contact'];
const WHEEL_STEP = 40;
const WHEEL_LOCK = 1700;

function webgl() {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch {
    return false;
  }
}

export function initDesk(): void {
  const root = document.querySelector<HTMLElement>('[data-desk]');
  if (!root || root.dataset.init) return;
  root.dataset.init = 'true';
  const cfg = JSON.parse(root.querySelector('[data-desk-config]')!.textContent!) as DeskConfig;
  const host = root.querySelector<HTMLElement>('[data-desk-canvas]')!;
  const hero = root.querySelector<HTMLElement>('.desk-hero')!;
  const bar = root.querySelector<HTMLElement>('[data-desk-progress]')!;
  const status = root.querySelector<HTMLElement>('[data-desk-status]')!;
  const menu = root.querySelector<HTMLElement>('[data-mobile-menu]')!;
  const menuBtn = root.querySelector<HTMLButtonElement>('[data-menu-toggle]')!;
  const menuLabel = root.querySelector<HTMLElement>('[data-menu-label]')!;
  const zoomIn = root.querySelector<HTMLButtonElement>('[data-zoom="in"]')!;
  const zoomOut = root.querySelector<HTMLButtonElement>('[data-zoom="out"]')!;
  const labels = { open: menuLabel.textContent ?? '', close: menuBtn.dataset.closeLabel ?? '' };

  let desk: DeskHandle | null = null;
  const fromHash = (): ShotKey => {
    const h = decodeURIComponent(location.hash.slice(1));
    return (ORDER.find((k) => k !== 'home' && cfg.hashes[k] === h) as ShotKey) ?? 'home';
  };

  const mark = (key: ShotKey) => {
    root.dataset.shot = key;
    root.querySelectorAll<HTMLElement>('[data-shot-link]').forEach((el) => {
      if (el.classList.contains('desk-brand')) return;
      el.setAttribute('aria-current', el.dataset.shotLink === key ? 'true' : 'false');
    });
    const hash = cfg.hashes[key];
    const url = hash ? `#${hash}` : location.pathname + location.search;
    if (decodeURIComponent(location.hash.slice(1)) !== hash) history.replaceState(null, '', url);
  };

  const setMenu = (open: boolean) => {
    root.dataset.menu = open ? 'open' : 'closed';
    menu.inert = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuLabel.textContent = open ? labels.close : labels.open;
  };
  menuBtn.addEventListener('click', () => setMenu(root.dataset.menu !== 'open'));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.dataset.menu === 'open') setMenu(false);
  });

  root.querySelectorAll<HTMLAnchorElement>('[data-lang-link]').forEach((a) =>
    a.addEventListener('click', () => {
      try {
        localStorage.setItem(LANG_STORAGE_KEY, a.dataset.langLink ?? '');
      } catch {}
    }),
  );

  const go = (key: ShotKey) => {
    setMenu(false);
    if (desk) desk.go(key);
    else mark(key);
  };
  root.querySelectorAll<HTMLElement>('[data-shot-link]').forEach((el) =>
    el.addEventListener('click', (e) => {
      e.preventDefault();
      go(el.dataset.shotLink as ShotKey);
    }),
  );

  const step = (dir: 1 | -1) => {
    root.classList.add('has-scrolled');
    if (!desk || desk.busy()) return;
    const i = ORDER.indexOf(desk.current());
    const n = Math.max(0, Math.min(ORDER.length - 1, i + dir));
    if (n !== i) desk.go(ORDER[n]);
  };
  root.querySelector('[data-desk-next]')?.addEventListener('click', () => step(1));

  let acc = 0;
  let lockUntil = 0;
  root.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey) return;
      e.preventDefault();
      e.stopPropagation();
      const now = performance.now();
      if (now < lockUntil) return;
      acc += e.deltaY;
      if (Math.abs(acc) < WHEEL_STEP) return;
      const dir = acc > 0 ? 1 : -1;
      acc = 0;
      lockUntil = now + WHEEL_LOCK;
      step(dir);
    },
    { passive: false, capture: true },
  );
  window.addEventListener('keydown', (e) => {
    if (root.dataset.menu === 'open' || (e.target as HTMLElement)?.closest('input,textarea')) return;
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) step(1);
    else if (['ArrowUp', 'PageUp'].includes(e.key)) step(-1);
    else if (e.key === 'Home') desk?.go('home');
    else return;
    e.preventDefault();
  });

  zoomIn.addEventListener('click', () => desk?.zoom(1));
  zoomOut.addEventListener('click', () => desk?.zoom(-1));
  root.querySelector('[data-zoom="reset"]')?.addEventListener('click', () => desk?.reset());

  const topLimit = () => {
    const r = hero.getBoundingClientRect();
    const h = host.clientHeight || window.innerHeight;
    const bottom = r.bottom + Math.min(36, h * 0.04);
    return 1 - (2 * bottom) / h;
  };

  if (!webgl()) {
    root.classList.add('is-fallback');
    status.textContent = root.querySelector('template[data-desk-nowebgl]')?.innerHTML ?? '';
    return;
  }

  const start = fromHash();
  mark(start);
  let shown = 0;
  const progress = (p: number) => {
    shown = Math.max(shown, Math.min(1, p));
    bar.style.setProperty('--p', String(shown));
  };

  Promise.all([document.fonts.ready, import('./scene')])
    .then(([, m]) =>
      m.createDesk({
        host,
        base: '/desk/',
        screen: cfg.screen,
        topLimit,
        onProgress: progress,
        onShot: mark,
        onZoom: (canIn, canOut) => {
          zoomIn.disabled = !canIn;
          zoomOut.disabled = !canOut;
        },
      }),
    )
    .then((d) => {
      desk = d;
      if (start !== 'home') d.go(start, true);
      progress(1);
      requestAnimationFrame(() => {
        root.classList.add('is-ready');
        d.intro();
      });
      window.addEventListener('hashchange', () => {
        const k = fromHash();
        if (k !== d.current()) d.go(k);
      });
    })
    .catch(() => {
      root.classList.add('is-fallback');
      status.textContent = root.querySelector('template[data-desk-nowebgl]')?.innerHTML ?? '';
    });
}
