import type { Lang } from '../i18n/ui';

/**
 * Tecnologías por categoría.
 * `core: true` = las que usas a diario (llevan un punto cian).
 * En teléfonos de pantalla baja solo se muestran las `core` para que todo quepa.
 */
export interface StackItem {
  name: string;
  core?: boolean;
}

export interface StackCategory {
  id: string;
  label: Record<Lang, string>;
  items: StackItem[];
}

export const STACK: StackCategory[] = [
  {
    id: 'backend',
    label: { es: 'Backend', en: 'Backend' },
    items: [
      { name: 'C# / .NET', core: true },
      { name: 'ASP.NET Core', core: true },
      { name: 'Java / Spring Boot', core: true },
      { name: 'PostgreSQL' },
      { name: 'Entity Framework' },
      { name: 'JWT / OAuth' },
    ],
  },
  {
    id: 'web',
    label: { es: 'Web', en: 'Web' },
    items: [
      { name: 'React', core: true },
      { name: 'TypeScript', core: true },
      { name: 'Vite' },
      { name: 'Tailwind CSS' },
      { name: 'TanStack Query' },
      { name: 'Astro' },
    ],
  },
  {
    id: 'mobile',
    label: { es: 'Móvil', en: 'Mobile' },
    items: [
      { name: 'Kotlin', core: true },
      { name: 'Android', core: true },
      { name: 'Room' },
      { name: 'WorkManager' },
      { name: 'Foreground Services' },
    ],
  },
  {
    id: 'architecture',
    label: { es: 'Arquitectura', en: 'Architecture' },
    items: [
      { name: 'Vertical Slice', core: true },
      { name: 'CQRS / MediatR' },
      { name: 'DDD' },
      { name: 'REST / OpenAPI' },
      { name: 'Docker', core: true },
      { name: 'AWS' },
      { name: 'CI/CD' },
    ],
  },
];
