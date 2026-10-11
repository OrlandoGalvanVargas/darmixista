import type { Lang } from '../i18n/ui';

export type ServiceIconName = 'web' | 'backend' | 'mobile' | 'desktop' | 'automation' | 'consulting';

/**
 * Servicios. `description` se ve en escritorio; `short` (una línea) en teléfono.
 * Para agregar o quitar uno, edita esta lista. Con 6 la cuadrícula de escritorio queda en 3×2.
 */
export interface Service {
  id: string;
  icon: ServiceIconName;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  short: Record<Lang, string>;
}

export const SERVICES: Service[] = [
  {
    id: 'web',
    icon: 'web',
    title: { es: 'Aplicaciones web', en: 'Web applications' },
    description: {
      es: 'Plataformas y paneles a la medida, rápidos y escalables, con una experiencia cuidada en cada pantalla.',
      en: 'Custom platforms and dashboards, fast and scalable, with a polished experience on every screen.',
    },
    short: { es: 'Plataformas y paneles a la medida', en: 'Custom platforms and dashboards' },
  },
  {
    id: 'backend',
    icon: 'backend',
    title: { es: 'Backend y APIs', en: 'Backend & APIs' },
    description: {
      es: 'APIs seguras y bien documentadas, con arquitectura limpia, autenticación robusta e integraciones.',
      en: 'Secure, well-documented APIs with clean architecture, robust authentication and integrations.',
    },
    short: { es: 'APIs seguras con arquitectura limpia', en: 'Secure APIs, clean architecture' },
  },
  {
    id: 'mobile',
    icon: 'mobile',
    title: { es: 'Apps móviles', en: 'Mobile apps' },
    description: {
      es: 'Apps Android nativas en Kotlin: rendimiento, funciones del dispositivo y una experiencia fluida.',
      en: 'Native Android apps in Kotlin: performance, device features and a smooth experience.',
    },
    short: { es: 'Android nativo en Kotlin', en: 'Native Android in Kotlin' },
  },
  {
    id: 'desktop',
    icon: 'desktop',
    title: { es: 'Software de escritorio', en: 'Desktop software' },
    description: {
      es: 'Aplicaciones de escritorio para flujos de trabajo específicos de tu operación o tu equipo.',
      en: 'Desktop applications built around the specific workflows of your operation or team.',
    },
    short: { es: 'Herramientas para tu operación', en: 'Tools for your operation' },
  },
  {
    id: 'automation',
    icon: 'automation',
    title: { es: 'Automatización', en: 'Automation' },
    description: {
      es: 'Modernizo procesos manuales: integraciones, tareas programadas y flujos que ahorran horas.',
      en: 'I modernize manual processes: integrations, scheduled jobs and workflows that save hours.',
    },
    short: { es: 'Procesos manuales, ahora automáticos', en: 'Manual processes, now automatic' },
  },
  {
    id: 'consulting',
    icon: 'consulting',
    title: { es: 'Consultoría', en: 'Consulting' },
    description: {
      es: 'Arquitectura, elección de tecnologías y planeación técnica para que tu proyecto crezca sin rehacerse.',
      en: 'Architecture, technology choices and technical planning so your project grows without rewrites.',
    },
    short: { es: 'Arquitectura y planeación técnica', en: 'Architecture and technical planning' },
  },
];
