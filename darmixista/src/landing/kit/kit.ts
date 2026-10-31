import { LANG_STORAGE_KEY } from '../../lib/lang-redirect';

interface Release {
  version: string;
  url: string;
  size: number;
}

const root = document.documentElement;

export function storeGet(key: string, session = false): string | null {
  try {
    return (session ? sessionStorage : localStorage).getItem(key);
  } catch {
    return null;
  }
}

export function storeSet(key: string, value: string, session = false): void {
  try {
    (session ? sessionStorage : localStorage).setItem(key, value);
  } catch {
    return;
  }
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function revealFrom(x: number, y: number, change: () => void): void {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!doc.startViewTransition || reducedMotion()) {
    change();
    return;
  }
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.style.setProperty('--k-vt-x', `${x}px`);
  root.style.setProperty('--k-vt-y', `${y}px`);
  root.style.setProperty('--k-vt-r', `${r}px`);
  doc.startViewTransition(change);
}

export function isDark(): boolean {
  return root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
}

export function syncThemeColor(): void {
  const color = isDark() ? root.dataset.bgDark : root.dataset.bgLight;
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
    m.media = '';
    if (color) m.content = color;
  });
}

export function toggleTheme(x = innerWidth / 2, y = 0): boolean {
  const next = isDark() ? 'light' : 'dark';
  revealFrom(x, y, () => {
    root.dataset.theme = next;
    syncThemeColor();
  });
  storeSet(root.dataset.themeKey ?? 'darmixista:theme', next);
  document.dispatchEvent(new CustomEvent('k:theme', { detail: next }));
  return next === 'dark';
}

function initTheme(): void {
  document.querySelectorAll<HTMLElement>('[data-k-theme]').forEach((b) =>
    b.addEventListener('click', () => {
      const r = b.getBoundingClientRect();
      toggleTheme(r.left + r.width / 2, r.top + r.height / 2);
    }),
  );
  if (root.dataset.theme) syncThemeColor();
}

function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-k-header]');
  if (!header) return;
  const update = () => header.toggleAttribute('data-scrolled', scrollY > 8);
  update();
  addEventListener('scroll', update, { passive: true });
}

function initLang(): void {
  document.querySelectorAll<HTMLAnchorElement>('[data-k-lang]').forEach((a) =>
    a.addEventListener('click', () => storeSet(LANG_STORAGE_KEY, a.dataset.kLang ?? '')),
  );
}

function initReveal(): void {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  document.querySelectorAll('[data-k-reveal]').forEach((el) => io.observe(el));
}

function initVideos(): void {
  if (reducedMotion()) return;
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting && v.offsetParent !== null) {
          v.preload = 'auto';
          v.play().catch(() => undefined);
        } else v.pause();
      }),
    { threshold: 0.3 },
  );
  document.querySelectorAll<HTMLVideoElement>('[data-k-video]').forEach((v) => io.observe(v));
}

function isNewer(a: string, b: string): boolean {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d > 0;
  }
  return false;
}

let releasePromise: Promise<Release | null> | null = null;

export function latestRelease(repo: string): Promise<Release | null> {
  if (releasePromise) return releasePromise;
  const key = `darmixista:release3:${repo}`;
  const cached = storeGet(key, true);
  if (cached) {
    try {
      const { t, info } = JSON.parse(cached) as { t: number; info: Release };
      if (Date.now() - t < 30 * 60_000) return (releasePromise = Promise.resolve(info));
    } catch {
      storeSet(key, '', true);
    }
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  releasePromise = fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
    headers: { Accept: 'application/vnd.github+json' },
    signal: ctrl.signal,
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!d || d.draft || d.prerelease || !d.tag_name) return null;
      const apk = (d.assets ?? []).find((a: { name: string }) => a.name.toLowerCase().endsWith('.apk'));
      if (!apk) return null;
      const info: Release = {
        version: String(d.tag_name).replace(/^v/i, ''),
        url: apk.browser_download_url,
        size: apk.size,
      };
      storeSet(key, JSON.stringify({ t: Date.now(), info }), true);
      return info;
    })
    .catch(() => null)
    .finally(() => clearTimeout(timer));
  return releasePromise;
}

async function initApk(repo: string, known: string): Promise<void> {
  const info = await latestRelease(repo);
  const fallback = document.querySelector('[data-k-apk][data-k-apk-fallback]') !== null;
  if (!info || (!fallback && !isNewer(info.version, known))) return;
  const locale = root.lang.startsWith('es') ? 'es-MX' : 'en-US';
  const mb = (info.size / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 1 });
  document.querySelectorAll<HTMLAnchorElement>('[data-k-apk]').forEach((a) => (a.href = info.url));
  document.querySelectorAll('[data-k-apk-version]').forEach((el) => (el.textContent = info.version));
  document.querySelectorAll('[data-k-apk-size]').forEach((el) => (el.textContent = `${mb} MB`));
  document.querySelectorAll<HTMLElement>('[data-k-apk-size-wrap]').forEach((el) => (el.hidden = false));
}

let sheet: HTMLDialogElement | null = null;

export function selectTab(id: string): void {
  if (!sheet) return;
  sheet.querySelectorAll<HTMLButtonElement>('[data-k-tab]').forEach((t) => {
    const on = t.dataset.kTab === id;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
  });
  sheet.querySelectorAll<HTMLElement>('[data-k-panel]').forEach((p) => (p.hidden = p.dataset.kPanel !== id));
}

export function openSheet(tab = 'install'): void {
  if (!sheet) return;
  selectTab(tab);
  if (!sheet.open) {
    root.style.setProperty('--k-sbw', `${innerWidth - root.clientWidth}px`);
    root.classList.add('k-lock');
    sheet.showModal();
  }
  sheet.querySelector<HTMLElement>(`[data-k-tab="${tab}"]`)?.focus();
}

function initSheet(): void {
  sheet = document.querySelector<HTMLDialogElement>('[data-k-sheet]');
  if (!sheet) return;
  const s = sheet;
  document.querySelectorAll<HTMLElement>('[data-k-sheet-open]').forEach((b) =>
    b.addEventListener('click', (e) => {
      e.preventDefault();
      openSheet(b.dataset.kSheetOpen || 'install');
    }),
  );
  s.querySelector('[data-k-sheet-close]')?.addEventListener('click', () => s.close());
  s.addEventListener('close', () => root.classList.remove('k-lock'));
  s.addEventListener('click', (e) => {
    if (e.target === s) s.close();
  });
  const tabs = [...s.querySelectorAll<HTMLButtonElement>('[data-k-tab]')];
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t.dataset.kTab!));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const next = tabs[(i + d + tabs.length) % tabs.length];
      selectTab(next.dataset.kTab!);
      next.focus();
    });
  });
}

export function initKit(options: { repo: string; version: string }): void {
  if (root.dataset.kReady) return;
  root.dataset.kReady = 'true';
  initTheme();
  initHeader();
  initLang();
  initReveal();
  initVideos();
  initSheet();
  void initApk(options.repo, options.version);
}
