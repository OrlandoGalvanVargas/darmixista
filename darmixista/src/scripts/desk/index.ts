import { heroName } from './hero';
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
const WHEEL_GAP = 220;

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
  const heroEl = root.querySelector<HTMLElement>('.desk-hero')!;
  const hero = heroName(root);
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
    return ([...ORDER, 'board'] as ShotKey[]).find((k) => k !== 'home' && cfg.hashes[k] === h) ?? 'home';
  };

  const projEl = root.querySelector<HTMLElement>('[data-proj]')!;
  const projTrack = projEl.querySelector<HTMLElement>('[data-proj-track]')!;
  const projRow = projEl.querySelector<HTMLElement>('[data-proj-row]')!;
  const projItems = [...projEl.querySelectorAll<HTMLButtonElement>('[data-proj-i]')];
  const projTags = projEl.querySelector<HTMLElement>('[data-proj-tags]')!;
  const projMeta = JSON.parse(projEl.querySelector('[data-proj-meta]')?.textContent ?? '[]') as string[][];
  let projIdx = 0;
  let projBar = projItems[0]?.querySelector<HTMLElement>('.desk-proj-bar i') ?? null;
  let tagTimer = 0;
  const centerProj = (instant = false) => {
    const it = projItems[projIdx];
    if (!it) return;
    const x = projTrack.clientWidth / 2 - (it.offsetLeft + it.offsetWidth / 2);
    if (instant) projRow.style.transition = 'none';
    projRow.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    if (instant) {
      void projRow.offsetWidth;
      projRow.style.transition = '';
    }
  };
  const showProject = (i: number) => {
    if (!projItems[i]) return;
    if (i !== projIdx) {
      projItems[projIdx].setAttribute('aria-current', 'false');
      if (projBar) projBar.style.transform = 'scaleX(0)';
      projIdx = i;
      projItems[i].setAttribute('aria-current', 'true');
      projBar = projItems[i].querySelector<HTMLElement>('.desk-proj-bar i');
      if (projBar) projBar.style.transform = 'scaleX(0)';
      window.clearTimeout(tagTimer);
      projTags.classList.add('is-swap');
      tagTimer = window.setTimeout(() => {
        projTags.replaceChildren(
          ...(projMeta[i] ?? []).map((tag) => {
            const li = document.createElement('li');
            li.textContent = tag;
            return li;
          }),
        );
        projTags.classList.remove('is-swap');
      }, 180);
    }
    centerProj();
  };
  let ticking = false;
  const tick = () => {
    if (!desk || root.dataset.shot !== 'projects') {
      ticking = false;
      return;
    }
    if (projBar) projBar.style.transform = `scaleX(${desk.projects.progress().toFixed(4)})`;
    requestAnimationFrame(tick);
  };
  const startTick = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(tick);
  };
  projItems.forEach((b, i) =>
    b.addEventListener('click', () => {
      if (swiped) return;
      desk?.projects.select(i);
    }),
  );
  projEl.querySelectorAll<HTMLButtonElement>('[data-proj-step]').forEach((b) => b.addEventListener('click', () => desk?.projects.step(Number(b.dataset.projStep))));
  let swipeX = 0;
  let swipeId = -1;
  let swiped = false;
  projTrack.addEventListener('pointerdown', (e) => {
    swipeId = e.pointerId;
    swipeX = e.clientX;
    swiped = false;
  });
  projTrack.addEventListener('pointerup', (e) => {
    if (e.pointerId !== swipeId) return;
    swipeId = -1;
    const dx = e.clientX - swipeX;
    if (Math.abs(dx) < 32) return;
    swiped = true;
    window.setTimeout(() => (swiped = false), 60);
    desk?.projects.step(dx < 0 ? 1 : -1);
  });
  projTrack.addEventListener('pointercancel', () => (swipeId = -1));
  window.addEventListener('resize', () => centerProj(true));
  centerProj(true);

  const dock = root.querySelector<HTMLElement>('[data-dock]');
  const mark = (key: ShotKey) => {
    root.dataset.shot = key;
    if (key === 'projects') startTick();
    const di = ORDER.indexOf(key);
    if (dock && di >= 0) dock.style.setProperty('--i', String(di));
    root.querySelectorAll<HTMLElement>('[data-shot-link]').forEach((el) => {
      if (el.classList.contains('desk-brand')) return;
      el.setAttribute('aria-current', el.dataset.shotLink === key ? 'true' : 'false');
    });
    const hash = cfg.hashes[key];
    const url = hash ? `#${hash}` : location.pathname + location.search;
    if (decodeURIComponent(location.hash.slice(1)) !== hash) history.replaceState(null, '', url);
  };

  const brandEl = root.querySelector<HTMLElement>('.desk-brand');
  let pulseTimer = 0;
  brandEl?.addEventListener('click', () => {
    window.clearTimeout(pulseTimer);
    brandEl.classList.remove('is-pulse');
    void brandEl.offsetWidth;
    brandEl.classList.add('is-pulse');
    pulseTimer = window.setTimeout(() => brandEl.classList.remove('is-pulse'), 1100);
  });

  const setMenu = (open: boolean) => {
    root.dataset.menu = open ? 'open' : 'closed';
    menu.inert = !open;
    if (dock) dock.inert = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuLabel.textContent = open ? labels.close : labels.open;
  };
  menuBtn.addEventListener('click', () => setMenu(root.dataset.menu !== 'open'));
  const outside = (e: Event) => {
    if (root.dataset.menu !== 'open') return;
    const t = e.target as Node;
    if (menu.contains(t) || menuBtn.contains(t) || dock?.contains(t)) return;
    setMenu(false);
  };
  document.addEventListener('pointerdown', outside, true);
  document.addEventListener('wheel', outside, { capture: true, passive: true });
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

  const target = (dir: 1 | -1): ShotKey | null => {
    if (!desk) return null;
    const cur = desk.current();
    if (cur === 'board') return 'home';
    const i = ORDER.indexOf(cur);
    const n = Math.max(0, Math.min(ORDER.length - 1, i + dir));
    return n !== i ? ORDER[n] : null;
  };
  const step = (dir: 1 | -1) => {
    root.classList.add('has-scrolled');
    if (!desk || desk.busy()) return false;
    const t = target(dir);
    if (!t) return false;
    desk.go(t);
    return true;
  };
  root.querySelector('[data-desk-next]')?.addEventListener('click', () => step(1));

  let acc = 0;
  let last = 0;
  let used = false;
  root.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey) return;
      e.preventDefault();
      e.stopPropagation();
      const now = performance.now();
      if (now - last > WHEEL_GAP) {
        acc = 0;
        used = false;
      }
      last = now;
      if (used || root.dataset.menu === 'open') return;
      if (!desk || desk.busy()) {
        used = true;
        return;
      }
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
      if (acc !== 0 && Math.sign(dy) !== Math.sign(acc)) acc = 0;
      acc += dy;
      if (Math.abs(acc) < WHEEL_STEP) return;
      const dir = acc > 0 ? 1 : -1;
      acc = 0;
      if (step(dir)) used = true;
    },
    { passive: false, capture: true },
  );
  window.addEventListener('keydown', (e) => {
    if (root.dataset.menu === 'open' || (e.target as HTMLElement)?.closest('input,textarea')) return;
    if (desk?.current() === 'projects' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      desk.projects.step(e.key === 'ArrowRight' ? 1 : -1);
      return;
    }
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) step(1);
    else if (['ArrowUp', 'PageUp'].includes(e.key)) step(-1);
    else if (e.key === 'Home') desk?.go('home');
    else if (e.key === 'Escape' && desk?.current() === 'board') desk.go('home');
    else return;
    e.preventDefault();
  });

  zoomIn.addEventListener('click', () => desk?.zoom(1));
  zoomOut.addEventListener('click', () => desk?.zoom(-1));
  root.querySelector('[data-zoom="reset"]')?.addEventListener('click', () => desk?.reset());

  const wb = root.querySelector<HTMLElement>('[data-wb]')!;
  const wbTrack = wb.querySelector<HTMLElement>('[data-wb-track]')!;
  const marker = wb.querySelector<HTMLElement>('[data-wb-tool="marker"]')!;
  const press = (sel: string, on: Element) => wb.querySelectorAll(sel).forEach((b) => b.setAttribute('aria-pressed', String(b === on)));
  const setMode = (m: 'draw' | 'move') => {
    press('[data-wb-mode]', wb.querySelector(`[data-wb-mode="${m}"]`)!);
    desk?.board.mode(m);
  };
  wb.querySelectorAll<HTMLButtonElement>('[data-wb-tool]').forEach((b) =>
    b.addEventListener('click', () => {
      press('[data-wb-tool]', b);
      desk?.board.tool(b.dataset.wbTool as 'marker' | 'eraser');
      setMode('draw');
    }),
  );
  wb.querySelectorAll<HTMLButtonElement>('[data-wb-color]').forEach((b) =>
    b.addEventListener('click', () => {
      press('[data-wb-color]', b);
      press('[data-wb-tool]', marker);
      marker.style.setProperty('--ink', b.dataset.wbColor!);
      desk?.board.color(b.dataset.wbColor!);
      setMode('draw');
    }),
  );
  wb.querySelectorAll<HTMLButtonElement>('[data-wb-mode]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.wbMode as 'draw' | 'move')));
  const onBoard = (s: { pan: boolean; left: number; width: number }) => {
    wb.dataset.pan = s.pan ? '1' : '0';
    if (!s.pan && wb.querySelector('[data-wb-mode="move"]')!.getAttribute('aria-pressed') === 'true') setMode('draw');
    wbTrack.style.width = `${s.width * 100}%`;
    wbTrack.style.left = `${s.left * 100}%`;
  };

  const topLimit = () => {
    const r = heroEl.getBoundingClientRect();
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
        onBoard,
        onProject: showProject,
        reserve: () => {
          const hb = host.getBoundingClientRect();
          const nav = root.querySelector<HTMLElement>('.desk-nav');
          const top = nav ? nav.getBoundingClientRect().bottom - hb.top : 0;
          const bottom = hb.height - projEl.offsetTop + 10;
          return { top, bottom };
        },
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
        window.setTimeout(() => hero.wave(), 500);
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
