import type { Lang } from '../../i18n/ui';

type I18n<T = string> = Record<Lang, T>;

/**
 * Un proyecto = un archivo en src/data/projects/web/ o src/data/projects/mobile/.
 * Para agregar uno nuevo, copia un archivo existente, cambia `order` y sus datos. Aparece solo.
 */
export interface Project {
  /** Posición en el carrusel (menor = primero) */
  order: number;
  /** Identificador único (se usa en el panel de detalles) */
  slug: string;
  title: string;
  year: string;
  category: I18n;
  /** Texto corto de la tarjeta: 1–2 frases (en móvil se corta a 3 líneas) */
  summary: I18n;
  /** Texto largo para el panel "Detalles" */
  description: I18n;
  /** 3–4 puntos destacados para el panel "Detalles" */
  highlights?: I18n<string[]>;
  /** Tecnologías; en la tarjeta se muestran las primeras 4, en "Detalles" todas */
  tags: string[];
  links: {
    demo?: string;
    code?: string;
    /**
     * Solo apps móviles: ruta de su landing dentro del sitio, sin idioma ni barras
     * (p. ej. 'darmixpet' → /darmixpet/ y /en/darmixpet/). Ahí está el botón de descarga del APK.
     */
    page?: string;
  };
  /**
   * Captura (opcional) en /public. Web: idealmente 1600×1000 o una captura larga
   * (al pasar el cursor se desplaza hacia abajo). Móvil: 1080×2340 aprox.
   * Sin imagen se dibuja una interfaz de ejemplo.
   */
  image?: string;
  /** Dominio que se muestra en la barra del navegador (solo web) */
  domain?: string;
  /** Proyecto en desarrollo: se marca y los enlaces faltantes dicen "Próximamente" */
  inProgress?: boolean;
}
