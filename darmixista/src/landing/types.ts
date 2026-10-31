import type { Lang } from '../i18n/ui';
import type { IconName } from './kit/icons';

export type { IconName };

export type CorePalette = {
  bg: string;
  surface: string;
  surfaceVariant: string;
  ink: string;
  shadow: string;
  text: string;
  muted: string;
  outline: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  accent: string;
  onAccent: string;
  accentContainer: string;
  onAccentContainer: string;
};

export type Palette = CorePalette & Record<string, string>;

export interface Skin<P extends Palette = Palette> {
  id: string;
  light: P;
  dark: P;
  image: string;
  imageSmall: string;
  glow: string;
}

export interface ReleaseInfo {
  version: string;
  apk?: string;
  sizeMb?: number;
  date: string;
}

export interface AppMeta {
  slug: string;
  name: string;
  repo: { owner: string; name: string };
  release: ReleaseInfo;
  minAndroid: string;
  icon: string;
  icon192: string;
  icon32: string;
  apple: string;
  og: Record<Lang, string>;
  schemaCategory: string;
}

export interface InstallContent {
  steps: Array<{ title: string; body: string }>;
  permissionsIntro?: string;
  permissions?: Array<{ icon: IconName; title: string; why: string; badge?: string }>;
  permissionsGuide?: { label: string; href: string };
  faq: Array<{ q: string; a: string }>;
}

export interface PageMeta {
  title: string;
  description: string;
  ogAlt: string;
  category: string;
}
