import type { Lang } from '../i18n/ui';

export interface TimelineEntry {
  period: Record<Lang, string>;
  title: Record<Lang, string>;
  org: string;
  description?: Record<Lang, string>;
  current?: boolean;
}

export const EXPERIENCE: TimelineEntry[] = [
  {
    period: { es: '2026 — Actual', en: '2026 — Present' },
    title: { es: 'Desarrollador Full Stack y Android', en: 'Full Stack and Android Developer' },
    org: 'Darmixista',
    description: {
      es: 'Diseño, construcción y mantenimiento de apps Android publicadas y sistemas web de código abierto.',
      en: 'Design, development and maintenance of published Android apps and open-source web systems.',
    },
    current: true,
  },
  {
    period: { es: 'Oct 2025 — Abr 2026', en: 'Oct 2025 — Apr 2026' },
    title: { es: 'Desarrollador Full Stack (prácticas)', en: 'Full Stack Developer (internship)' },
    org: 'LiveFree',
    description: {
      es: 'Módulo de extremo a extremo de un sistema de emergencias: React, ASP.NET Core, SQL Server y modo offline.',
      en: 'End-to-end module for an emergency response system: React, ASP.NET Core, SQL Server and offline mode.',
    },
  },
  {
    period: { es: 'May 2022 — Ago 2022', en: 'May 2022 — Aug 2022' },
    title: { es: 'Desarrollador Mobile (prácticas)', en: 'Mobile Developer (internship)' },
    org: 'SITelecom',
    description: {
      es: 'App Android en Kotlin para cuadrillas en campo (GPS, viáticos, incidencias) y panel web en React.',
      en: 'Kotlin Android app for field crews (GPS, expenses, incidents) and a React web panel.',
    },
  },
];

export const EDUCATION: TimelineEntry[] = [
  {
    period: { es: 'Sep 2024 — May 2026', en: 'Sep 2024 — May 2026' },
    title: { es: 'Ingeniería en Desarrollo y Gestión de Software', en: 'B.Eng. in Software Development and Management' },
    org: 'UT Tula-Tepeji',
  },
  {
    period: { es: '2022 — 2024', en: '2022 — 2024' },
    title: { es: 'TSU en Desarrollo de Software Multiplataforma', en: 'Associate Degree in Multiplatform Software Development' },
    org: 'UT Tula-Tepeji',
  },
];
