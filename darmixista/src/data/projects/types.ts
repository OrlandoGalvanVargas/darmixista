import type { Lang } from '../../i18n/ui';

type I18n<T = string> = Record<Lang, T>;

export interface Project {
  order: number;
  slug: string;
  title: string;
  year: string;
  accent?: string;
  category: I18n;
  summary: I18n;
  summaryShort?: I18n;
  description: I18n;
  highlights?: I18n<string[]>;
  sheet?: {
    what: I18n;
    how: I18n;
  };
  tags: string[];
  links: {
    demo?: string;
    code?: string;
    page?: string;
  };
  image?: string;
  domain?: string;
  inProgress?: boolean;
  audience?: 'personal' | 'business';
}
