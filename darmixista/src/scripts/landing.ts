/**
 * Comportamiento de las landings de apps móviles:
 * - Botón de descarga con la última release de GitHub (con respaldo si no responde)
 * - Tema claro / oscuro / sistema
 * - Menú móvil, selector de idioma, aviso tras descargar
 * - Videos que solo se reproducen cuando están a la vista, apariciones al desplazar
 */
import { LANG_STORAGE_KEY } from '../lib/lang-redirect';

const CACHE_MINUTES = 30;

interface ReleaseInfo {
  version: string;
  url: string;
  size: number;
}

function safeGet(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    /* almacenamiento no disponible */
  }
}

/** Compara versiones tipo 1.2.10 vs 1.2.9 */
function isNewer(a: string, b: string): boolean {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d > 0;
  }
  return false;
}

async function fetchLatest(repo: string): Promise<ReleaseInfo | null> {
  const key = `darmixista:release:${repo}`;
  const cached = safeGet(sessionStorage, key);
  if (cached) {
    try {
      const { t, info } = JSON.parse(cached) as { t: number; info: ReleaseInfo };
      if (Date.now() - t < CACHE_MINUTES * 60_000) return info;
    } catch {
      /* caché dañada: se vuelve a pedir */
    }
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      tag_name?: string;
      draft?: boolean;
      prerelease?: boolean;
      assets?: Array<{ name: string; size: number; browser_download_url: string }>;
    };
    if (data.draft || data.prerelease) return null;
    const apk = data.assets?.find((a) => a.name.toLowerCase().endsWith('.apk'));
    if (!apk || !data.tag_name) return null;
    const info: ReleaseInfo = {
      version: data.tag_name.replace(/^v/i, ''),
      url: apk.browser_download_url,
      size: apk.size,
    };
    safeSet(sessionStorage, key, JSON.stringify({ t: Date.now(), info }));
    return info;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function initDownload(repo: string, knownVersion: string): Promise<void> {
  const info = await fetchLatest(repo);
  if (!info || !isNewer(info.version, knownVersion)) return;
  const lang = document.documentElement.lang.startsWith('es') ? 'es-MX' : 'en-US';
  const mb = (info.size / 1_000_000).toLocaleString(lang, { maximumFractionDigits: 1 });
  document.querySelectorAll<HTMLAnchorElement>('[data-apk-link]').forEach((a) => (a.href = info.url));
  document.querySelectorAll('[data-apk-version]').forEach((el) => (el.textContent = info.version));
  document.querySelectorAll('[data-apk-size]').forEach((el) => (el.textContent = `${mb} MB`));
}

function initTheme(): void {
  const root = document.documentElement;
  const key = root.dataset.themeKey ?? 'darmixista:theme';
  const media = matchMedia('(prefers-color-scheme: dark)');
  const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
  const colors = [...metas].map((m) => m.content); // [claro, oscuro]

  const syncMeta = () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : media.matches;
    metas.forEach((m) => {
      m.media = '';
      m.content = dark ? colors[1] : colors[0];
    });
  };

  document.querySelector('[data-lp-theme]')?.addEventListener('click', () => {
    const current = root.dataset.theme ?? (media.matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    safeSet(localStorage, key, next);
    syncMeta();
  });
  if (root.dataset.theme) syncMeta();
}

function initMenu(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-lp-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-lp-menu]');
  if (!toggle || !menu) return;
  const set = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('hidden', !open);
  };
  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && set(false));
}

function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-lp-header]');
  if (!header) return;
  const update = () => header.toggleAttribute('data-scrolled', scrollY > 8);
  update();
  addEventListener('scroll', update, { passive: true });
}

function initLangLinks(): void {
  document.querySelectorAll<HTMLAnchorElement>('[data-lp-lang]').forEach((a) =>
    a.addEventListener('click', () => safeSet(localStorage, LANG_STORAGE_KEY, a.dataset.lpLang ?? '')),
  );
}

function initToast(): void {
  const toast = document.querySelector<HTMLElement>('[data-lp-toast]');
  if (!toast) return;
  let timer = 0;
  const hide = () => {
    toast.removeAttribute('data-show');
    toast.inert = true;
  };
  document.querySelectorAll('[data-apk-link]').forEach((a) =>
    a.addEventListener('click', () => {
      window.clearTimeout(timer);
      // Pequeña espera: que el navegador arranque la descarga antes de mostrar el aviso
      window.setTimeout(() => {
        toast.setAttribute('data-show', '');
        toast.inert = false;
      }, 400);
      timer = window.setTimeout(hide, 12000);
    }),
  );
  toast.querySelectorAll('[data-lp-toast-close]').forEach((b) => b.addEventListener('click', hide));
}

function initVideos(): void {
  const videos = document.querySelectorAll<HTMLVideoElement>('[data-lp-video]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!videos.length || reduce) return; // con "reducir movimiento" se queda la imagen fija
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) {
          v.preload = 'auto';
          v.play().catch(() => {});
        } else v.pause();
      }),
    { threshold: 0.35 },
  );
  videos.forEach((v) => io.observe(v));
}

function initReveal(): void {
  const items = document.querySelectorAll<HTMLElement>('[data-lp-reveal]');
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  items.forEach((el) => io.observe(el));
}

export function initLanding(): void {
  const root = document.documentElement;
  if (root.dataset.lpReady) return;
  root.dataset.lpReady = 'true';

  initTheme();
  initMenu();
  initHeader();
  initLangLinks();
  initToast();
  initVideos();
  initReveal();

  const link = document.querySelector<HTMLElement>('[data-apk-repo]');
  if (link) void initDownload(link.dataset.apkRepo!, link.dataset.apkKnown ?? '0');
}
