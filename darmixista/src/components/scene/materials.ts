import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface BandProfile {
  radius: number;
  width: number;
  thickness: number;
  bevel: number;
  channel?: { width: number; depth: number; groove?: number };
}

const SEGMENTS = 256;

type V = THREE.Vector2;
const v = (x: number, y: number) => new THREE.Vector2(x, y);

function lathe(strips: V[][]): THREE.BufferGeometry {
  const pieces = strips.map((pts) => new THREE.LatheGeometry(pts, SEGMENTS));
  const merged = mergeGeometries(pieces, false);
  pieces.forEach((g) => g.dispose());
  if (!merged) throw new Error('no se pudo unir la geometría del anillo');
  return merged;
}

function arc(cx: number, cy: number, r: number, from: number, to: number, steps: number): THREE.Vector2[] {
  const out: THREE.Vector2[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = from + ((to - from) * i) / steps;
    out.push(new THREE.Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * r));
  }
  return out;
}

export function createBandGeometry(p: BandProfile): THREE.BufferGeometry {
  const hw = p.width / 2;
  const ht = p.thickness / 2;
  const ro = p.radius + ht;
  const ri = p.radius - ht;
  const b = p.bevel;
  const fillet = ht * 0.45;

  const outer: V[][] = [];
  if (p.channel) {
    const cw = p.channel.width / 2;
    const cd = p.channel.depth;
    outer.push([v(ro, -(hw - b)), v(ro, -cw)]);
    outer.push([v(ro, -cw), v(ro - cd, -cw)]);
    outer.push([v(ro - cd, -cw), v(ro - cd, cw)]);
    outer.push([v(ro - cd, cw), v(ro, cw)]);
    outer.push([v(ro, cw), v(ro, hw - b)]);
  } else {
    outer.push([v(ro, -(hw - b)), v(ro, hw - b)]);
  }

  const bevelTop = [v(ro, hw - b), v(ro - b, hw)];
  const bevelBottom = [v(ro - b, -hw), v(ro, -(hw - b))];
  const inner = [
    v(ro - b, hw),
    v(ri + fillet, hw),
    ...arc(ri + fillet, hw - fillet, fillet, Math.PI / 2, Math.PI, 6).slice(1),
    v(ri, -(hw - fillet)),
    ...arc(ri + fillet, -(hw - fillet), fillet, Math.PI, Math.PI * 1.5, 6).slice(1),
    v(ro - b, -hw),
  ];

  return lathe([...outer, bevelTop, inner, bevelBottom]);
}

function inlayStrips(ro: number, floor: number, lip: number, from: number, to: number): V[][] {
  return [
    [v(floor, from), v(ro - lip, from)],
    [v(ro - lip, from), v(ro, from + lip)],
    [v(ro, from + lip), v(ro, to - lip)],
    [v(ro, to - lip), v(ro - lip, to)],
    [v(ro - lip, to), v(floor, to)],
  ];
}

export function createInlayGeometry(p: BandProfile): THREE.BufferGeometry {
  if (!p.channel) throw new Error('inlay requires a channel');
  const ht = p.thickness / 2;
  const ro = p.radius + ht;
  const cw = p.channel.width / 2 - 0.002;
  const cd = p.channel.depth;
  const lip = cd * 0.35;
  const floor = ro - cd + 0.001;
  const groove = p.channel.groove ?? 0;
  if (groove > 0) {
    const g = groove / 2;
    return lathe([...inlayStrips(ro, floor, lip, -cw, -g), ...inlayStrips(ro, floor, lip, g, cw)]);
  }
  return lathe(inlayStrips(ro, floor, lip, -cw, cw));
}

export function createBrushedTexture(): THREE.CanvasTexture {
  const w = 8;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas no disponible');

  ctx.fillStyle = 'rgb(190,190,190)';
  ctx.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y++) {
    const v = Math.round(120 + Math.random() * 135);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(0, y, w, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

export function createGlowTexture(inner: string, outer: string): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas no disponible');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.35, outer);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createGlowMaterial(texture: THREE.Texture, opacity: number): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
  });
}

export type Finish = 'polished' | 'brushed' | 'gunmetal' | 'black-gloss' | 'black-matte';

export function createFinish(finish: Finish, brushed: THREE.Texture): THREE.MeshPhysicalMaterial {
  switch (finish) {
    case 'polished':
      return new THREE.MeshPhysicalMaterial({
        color: '#eef0f3',
        metalness: 1,
        roughness: 0.2,
        envMapIntensity: 1.4,
      });
    case 'brushed':
      return new THREE.MeshPhysicalMaterial({
        color: '#c9ccd1',
        metalness: 1,
        roughness: 0.4,
        roughnessMap: brushed,
        envMapIntensity: 1.15,
      });
    case 'gunmetal':
      return new THREE.MeshPhysicalMaterial({
        color: '#6f7378',
        metalness: 1,
        roughness: 0.48,
        roughnessMap: brushed,
        envMapIntensity: 1,
      });
    case 'black-gloss':
      return new THREE.MeshPhysicalMaterial({
        color: '#0d0e10',
        metalness: 0.85,
        roughness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        envMapIntensity: 1.2,
      });
    case 'black-matte':
      return new THREE.MeshPhysicalMaterial({
        color: '#17181b',
        metalness: 0.95,
        roughness: 0.52,
        roughnessMap: brushed,
        clearcoat: 0.35,
        clearcoatRoughness: 0.3,
        envMapIntensity: 1.1,
      });
  }
}
