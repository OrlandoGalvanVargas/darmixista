export const STAGE_CHANGE = 'darmixista:stage-change';
export const SCENE_READY = 'darmixista:scene-ready';
export const SITE_LOADED = 'darmixista:loaded';

export type RingPose = 'hero' | 'background';
export interface StageFx {
  portal: number;
  cx: number;
  cy: number;
  r: number;
}

export const PORTAL_HOLE = 0.53;

export function getStageFx(): StageFx {
  const w = window as Window & { __darmixistaFx?: StageFx };
  w.__darmixistaFx ??= { portal: 0, cx: 0, cy: 0, r: 0 };
  return w.__darmixistaFx;
}

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
