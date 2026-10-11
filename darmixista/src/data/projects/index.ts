import type { Project } from './types';

/**
 * Carga automática: cada archivo .ts dentro de web/ o mobile/ es un proyecto.
 * No hace falta registrarlos en ningún lado.
 */
const byOrder = (a: Project, b: Project) => a.order - b.order;

const load = (modules: Record<string, { default: Project }>) =>
  Object.values(modules)
    .map((m) => m.default)
    .sort(byOrder);

export const WEB_PROJECTS: Project[] = load(
  import.meta.glob<{ default: Project }>('./web/*.ts', { eager: true }),
);

export const MOBILE_PROJECTS: Project[] = load(
  import.meta.glob<{ default: Project }>('./mobile/*.ts', { eager: true }),
);

export type { Project };
