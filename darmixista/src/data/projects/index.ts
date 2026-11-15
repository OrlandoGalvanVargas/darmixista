import type { Project } from './types';

const byOrder = (a: Project, b: Project) => a.order - b.order;

const load = (modules: Record<string, { default: Project }>) =>
  Object.values(modules)
    .map((m) => m.default)
    .sort(byOrder);

export const WEB_PROJECTS: Project[] = load(import.meta.glob<{ default: Project }>('./web/*.ts', { eager: true }));

const MOBILE: Project[] = load(import.meta.glob<{ default: Project }>('./mobile/*.ts', { eager: true }));

export const PERSONAL_APPS: Project[] = MOBILE.filter((p) => p.audience !== 'business');
export const BUSINESS_APPS: Project[] = MOBILE.filter((p) => p.audience === 'business');
export const MOBILE_PROJECTS: Project[] = MOBILE;

export type { Project };
