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
  | 'stack'
  | 'route'
  | 'dumbbell'
  | 'calendar'
  | 'film'
  | 'refresh'
  | 'checklist'
  | 'alarm'
  | 'headphones'
  | 'check'
  | 'download';

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
  /** Texto sobre el acento (opcional; lo usa el estilo "athletic" en botones) */
  onAccent?: string;
}

/**
 * Apariencia general de la landing.
 * - sticker: contornos gruesos, sombras sólidas y esquinas redondas (DarmixPet)
 * - athletic: oscuro, líneas finas, títulos condensados en mayúsculas y acento neón (DarmixFit)
 */
export interface LandingLook {
  style: 'sticker' | 'athletic';
  /** Familias tipográficas (deben estar importadas en LandingLayout.astro) */
  fontDisplay: string;
  fontBody: string;
  /** Tema inicial cuando el visitante no ha elegido uno (por defecto, el del sistema) */
  defaultScheme?: 'light' | 'dark';
}

export interface LandingContent {
  metaTitle: string;
  metaDescription: string;
  ogAlt: string;
  /** Categoría para buscadores (schema.org) */
  category: string;
  nav: {
    how: string;
    features: string;
    gallery: string;
    companions?: string;
    programs?: string;
    install: string;
    faq: string;
  };
  hero: {
    eyebrow: string;
    /** Admite <em> para resaltar una palabra */
    title: string;
    lead: string;
    /** Burbuja junto al teléfono (opcional) */
    bubble?: string;
    bubbleBy?: string;
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
    /** Proporción de las pantallas (ancho / alto). Por defecto 400 / 867 */
    ratio?: string;
    /** video: ruta .mp4 en /public (opcional); poster: imagen de respaldo */
    items: Array<{ video?: string; poster: string; caption: string }>;
  };
  companions?: {
    title: string;
    lead: string;
    items: Array<{ name: string; element: string; quote: string; image: string; color: string; deep: string; spark: string }>;
  };
  /** Catálogo opcional (p. ej. programas de entrenamiento incluidos) */
  programs?: {
    title: string;
    lead: string;
    labels: { days: string; level: string; rest: string };
    items: Array<{ name: string; days: string; level: string; rest: string; focus: string; tone: LandingTone }>;
    tip?: string;
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
    items: Array<{
      icon: LandingIconName;
      title: string;
      why: string;
      steps: string[];
      note?: string;
      /** Etiqueta corta (p. ej. "Necesario") y su tono */
      badge?: { label: string; tone: LandingTone };
    }>;
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
  look: LandingLook;
  /** Categoría schema.org (por defecto LifestyleApplication) */
  schemaCategory?: string;
  assets: {
    icon: string;
    icon192: string;
    icon32: string;
    apple: string;
    og: Record<Lang, string>;
    /** Pantalla principal para el teléfono del encabezado */
    heroShot: string;
    /** Proporción de heroShot (ancho / alto) */
    heroRatio?: string;
    /** Segunda pantalla, detrás de la primera (opcional) */
    heroShot2?: string;
    /** Personaje que flota junto al teléfono (opcional) */
    heroCharacter?: string;
    /** Imagen de la franja final (por defecto: el personaje o el ícono) */
    ctaImage?: string;
    /** Fondo de la franja final (opcional) */
    banner?: string;
  };
  palette: { light: LandingPalette; dark: LandingPalette };
  content: Record<Lang, LandingContent>;
}
