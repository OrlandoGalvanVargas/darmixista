import type { Dictionary } from '../i18n/ui';

/**
 * Elementos del menú, en el orden en que aparecen las secciones del sitio.
 * `id` debe coincidir con el id de la <section> correspondiente.
 * Si la sección aún no existe, el enlace se muestra pero no navega.
 */
export const NAV_ITEMS = [
  { id: 'home', key: 'home' },
  { id: 'about', key: 'about' },
  { id: 'projects', key: 'projects' },
  { id: 'services', key: 'services' },
  { id: 'contact', key: 'contact' },
] as const satisfies ReadonlyArray<{ id: string; key: keyof Dictionary['nav'] }>;
