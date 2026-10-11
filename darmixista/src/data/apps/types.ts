import type { Lang } from '../../i18n/ui';

/**
 * Landing de una app móvil (darmixista.dev/<slug>/ y /en/<slug>/).
 * Para crear otra: copia src/data/apps/darmixpet.ts, cambia los datos y crea sus dos páginas
 * en src/pages/<slug>/index.astro y src/pages/en/<slug>/index.astro (copia las de darmixpet).
 */

/** Íconos disponibles para tarjetas y pasos (se dibujan en LandingIcon.astro) */
export type LandingIconName =
  | 'eye'
  | 'wand'
  | 'bolt'
  | 'battery'
  | 'sticker'
  | 'theme'
  | 'lock'
  | 'layers'
  | 'hourglass'
  | 'bell'
  | 'accessibility'
  | 'sun'
  | 'shield'
  | 'hand'
  | 'sparkle'
  | 'timer'
  | 'snow'
  | 'stack';

/** Tonos de la paleta de la app (fondo de contenedor + texto) */
export type LandingTone = 'primary' | 'secondary' | 'tertiary' | 'error' | 'gold';

/** Tokens de color: se convierten en variables CSS (--lp-<nombre>) */
export interface LandingPalette {
  bg: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  muted: string;
  outline: string;
  ink: string;
  shadow: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  errorContainer: string;
  onErrorContainer: string;
  gold: string;
  goldContainer: string;
  onGoldContainer: string;
  /** Color de acento del personaje o la marca (brillos, detalles) */
  accent: string;
}

export interface LandingContent {
  metaTitle: string;
  metaDescription: string;
  ogAlt: string;
  /** Categoría para buscadores (schema.org) */
  category: string;
  nav: { how: string; features: string; gallery: string; companions?: string; install: string; faq: string };
  hero: {
    eyebrow: string;
    /** Admite <em> para resaltar una palabra */
    title: string;
    lead: string;
    /** Burbuja de diálogo del personaje */
    bubble: string;
    bubbleBy: string;
  };
  how: {
    title: string;
    lead: string;
    steps: Array<{ icon: LandingIconName; title: string; body: string }>;
    chips?: Array<{ icon: LandingIconName; label: string; tone: LandingTone }>;
  };
  features: {
    title: string;
    lead: string;
    items: Array<{ icon: LandingIconName; title: string; body: string; tone: LandingTone }>;
  };
  gallery: {
    title: string;
    lead: string;
    /** video: ruta .mp4 en /public (opcional); poster: imagen de respaldo */
    items: Array<{ video?: string; poster: string; caption: string }>;
  };
  companions?: {
    title: string;
    lead: string;
    items: Array<{ name: string; element: string; quote: string; image: string; color: string; deep: string; spark: string }>;
  };
  install: {
    title: string;
    lead: string;
    steps: Array<{ title: string; body: string }>;
    requirementsTitle: string;
    requirements: Array<{ label: string; value: string }>;
    noteTitle: string;
    note: string;
  };
  permissions: {
    title: string;
    lead: string;
    items: Array<{ icon: LandingIconName; title: string; why: string; steps: string[]; note?: string }>;
  };
  privacy: { title: string; lead: string; no: string[]; yes: string[] };
  faq: { title: string; items: Array<{ q: string; a: string }> };
  cta: { title: string; lead: string };
}

export interface AppLanding {
  slug: string;
  name: string;
  /** Repositorio de GitHub donde se publican las releases con el APK */
  repo: { owner: string; name: string };
  /**
   * Última versión conocida (respaldo). La página consulta GitHub al cargar y, si hay una
   * versión más reciente, actualiza solo el botón, la versión y el tamaño. No hace falta
   * tocar esto en cada release, pero conviene actualizarlo de vez en cuando.
   */
  release: { version: string; apk: string; sizeMb: number; date: string };
  minAndroid: string;
  year: string;
  assets: {
    icon: string;
    icon192: string;
    icon32: string;
    apple: string;
    og: Record<Lang, string>;
    /** Pantalla principal para el teléfono del encabezado */
    heroShot: string;
    /** Personaje que flota junto al teléfono */
    heroCharacter: string;
    /** Fondo de la franja final (opcional) */
    banner?: string;
  };
  palette: { light: LandingPalette; dark: LandingPalette };
  content: Record<Lang, LandingContent>;
}
