import type { Lang } from '../i18n/ui';

/**
 * Experiencia y formación.
 * ⚠️ TODO: los datos marcados con "20XX" o entre corchetes son DE EJEMPLO — reemplázalos por los tuyos.
 * Máximo recomendado: 3 de experiencia + 2 de formación (para que quepa en una pantalla).
 * `current: true` marca el punto en cian (lo que haces actualmente).
 */
export interface TimelineEntry {
  period: Record<Lang, string>;
  title: Record<Lang, string>;
  org: string;
  description?: Record<Lang, string>;
  current?: boolean;
}

export const EXPERIENCE: TimelineEntry[] = [
  {
    period: { es: '20XX — Actual', en: '20XX — Present' },
    title: { es: 'Desarrollador Full Stack', en: 'Full Stack Developer' },
    org: 'Freelance',
    description: {
      es: 'Modernizo y automatizo procesos con soluciones web, backend y móviles.',
      en: 'I modernize and automate processes with web, backend and mobile solutions.',
    },
    current: true,
  },
  {
    period: { es: '20XX — 20XX', en: '20XX — 20XX' },
    title: { es: '[Tu puesto]', en: '[Your role]' },
    org: '[Empresa]',
    description: {
      es: '[Una línea sobre tu rol y logros principales.]',
      en: '[One line about your role and key achievements.]',
    },
  },
];

export const EDUCATION: TimelineEntry[] = [
  {
    period: { es: '20XX — 20XX', en: '20XX — 20XX' },
    title: { es: '[Ingeniería en …]', en: '[… Engineering]' },
    org: '[Universidad]',
  },
  {
    period: { es: '20XX', en: '20XX' },
    title: { es: '[Certificación o curso]', en: '[Certification or course]' },
    org: '[Institución]',
  },
];
