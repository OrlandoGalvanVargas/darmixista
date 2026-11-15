import type { Lang } from '../i18n/ui';

export const SITE = {
  brand: 'Darmixista',
  person: {
    firstName: 'Orlando',
    lastName: 'Galvan Vargas',
    photo: '/about/orlando.webp',
  },
  socials: [
    { id: 'github', label: 'GitHub', handle: 'OrlandoGalvanVargas', href: 'https://github.com/OrlandoGalvanVargas' },
    { id: 'linkedin', label: 'LinkedIn', handle: 'in/orlandogalvan-dev', href: 'https://www.linkedin.com/in/orlandogalvan-dev' },
  ],
  contact: {
    email: 'orlando.gal.var.05@gmail.com',
    available: true,
    timeZone: 'America/Mexico_City',
    city: { es: 'México', en: 'Mexico' } satisfies Record<Lang, string>,
  },
  cv: {
    es: '/cv/orlando-galvan-cv-es.pdf',
    en: '/cv/orlando-galvan-cv-en.pdf',
  } satisfies Record<Lang, string>,
} as const;

export const WEB3FORMS_KEY: string = import.meta.env.PUBLIC_WEB3FORMS_KEY ?? '';
