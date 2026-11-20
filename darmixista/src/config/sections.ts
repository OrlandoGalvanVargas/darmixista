import type { Dictionary } from '../i18n/ui';

export const NAV_ITEMS = [
  { id: 'home', key: 'home' },
  { id: 'projects', key: 'projects' },
  { id: 'about', key: 'about' },
  { id: 'services', key: 'services' },
  { id: 'contact', key: 'contact' },
] as const satisfies ReadonlyArray<{ id: string; key: keyof Dictionary['nav'] }>;
