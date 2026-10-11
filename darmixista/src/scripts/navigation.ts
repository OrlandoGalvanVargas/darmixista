import { STAGE_CHANGE } from '../lib/stage-events';

import { LANG_STORAGE_KEY } from '../lib/lang-redirect';

export { LANG_STORAGE_KEY };

/** Menú móvil + selector de idioma */
export function initNavigation(): void {
  const root = document.documentElement;
  if (root.dataset.navReady) return; // evita registrar eventos dos veces (recarga en caliente)
  root.dataset.navReady = 'true';
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');

  const setOpen = (open: boolean) => {
    root.dataset.menu = open ? 'open' : 'closed';
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', (open ? toggle.dataset.labelClose : toggle.dataset.labelOpen) ?? '');
    }
    if (menu) {
      menu.inert = !open;
      if (open) menu.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
    }
  };

  if (menu) menu.inert = true;
  toggle?.addEventListener('click', () => setOpen(root.dataset.menu !== 'open'));
  menu?.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) setOpen(false);
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

  // Cambio de idioma: recuerda la preferencia y conserva la sección actual
  document.querySelectorAll<HTMLAnchorElement>('[data-lang-link]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      try {
        localStorage.setItem(LANG_STORAGE_KEY, link.dataset.langLink ?? '');
      } catch {
        /* almacenamiento no disponible: no pasa nada */
      }
      location.href = link.pathname + location.hash;
    });
  });
}
