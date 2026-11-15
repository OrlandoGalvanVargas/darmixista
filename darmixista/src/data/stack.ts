import type { Lang } from '../i18n/ui';

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
      { name: 'Laravel' },
      { name: 'PostgreSQL' },
    ],
  },
  {
    id: 'web',
    label: { es: 'Web', en: 'Web' },
    items: [
      { name: 'React', core: true },
      { name: 'TypeScript', core: true },
      { name: 'Tailwind CSS' },
      { name: 'TanStack Query' },
      { name: 'Astro' },
    ],
  },
  {
    id: 'mobile',
    label: { es: 'Android', en: 'Android' },
    items: [
      { name: 'Kotlin', core: true },
      { name: 'Jetpack Compose', core: true },
      { name: 'Room' },
      { name: 'Foreground Services' },
    ],
  },
  {
    id: 'architecture',
    label: { es: 'Arquitectura', en: 'Architecture' },
    items: [
      { name: 'Vertical Slice', core: true },
      { name: 'CQRS' },
      { name: 'REST / OpenAPI' },
      { name: 'Docker', core: true },
      { name: 'CI/CD' },
    ],
  },
];
