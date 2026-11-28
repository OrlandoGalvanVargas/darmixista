import { WEB_PROJECTS, MOBILE_PROJECTS, type Project } from '../../data/projects';

export interface DeskProject {
  slug: string;
  title: string;
  kind: 'web' | 'mobile';
  data: Project;
}

export const DESK_PROJECTS: DeskProject[] = [
  ...WEB_PROJECTS.map((p) => ({ slug: p.slug, title: p.title, kind: 'web' as const, data: p })),
  ...MOBILE_PROJECTS.map((p) => ({ slug: p.slug, title: p.title, kind: 'mobile' as const, data: p })),
];
