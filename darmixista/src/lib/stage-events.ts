/**
 * Contrato entre el controlador de secciones (vanilla TS), la pantalla de carga
 * y la escena 3D (React). Se comunican solo con estos eventos y atributos en <html>.
 */
export const STAGE_CHANGE = 'darmixista:stage-change';
/** La escena 3D pintó su primer frame (o no hay WebGL y se omite) */
export const SCENE_READY = 'darmixista:scene-ready';
/** La pantalla de carga terminó de salir: arrancan las animaciones de entrada */
export const SITE_LOADED = 'darmixista:loaded';

/** Cómo se colocan los anillos en cada sección (se declara con data-rings en la <section>) */
export type RingPose = 'hero' | 'background';

export interface StageChangeDetail {
  index: number;
  id: string;
  previousId: string;
  direction: -1 | 0 | 1;
  pose: RingPose;
}

export function readCurrentPose(): RingPose {
  if (typeof document === 'undefined') return 'hero';
  return document.documentElement.dataset.rings === 'background' ? 'background' : 'hero';
}

export function isSiteLoaded(): boolean {
  return typeof document !== 'undefined' && document.documentElement.dataset.loaded === 'true';
}

declare global {
  interface WindowEventMap {
    'darmixista:stage-change': CustomEvent<StageChangeDetail>;
    'darmixista:scene-ready': Event;
    'darmixista:loaded': Event;
  }
}
