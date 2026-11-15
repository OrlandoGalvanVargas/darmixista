import * as THREE from 'three';

export function createBandGeometry(
  radius: number,
  width: number,
  thickness: number,
  segments = 192,
): THREE.LatheGeometry {
  const hw = width / 2;
  const ht = thickness / 2;
  const r = Math.min(ht, hw) * 0.9;
  const steps = 10;

  const corners = [
    { cx: radius + ht - r, cy: -hw + r, start: -Math.PI / 2 },
    { cx: radius + ht - r, cy: hw - r, start: 0 },
    { cx: radius - ht + r, cy: hw - r, start: Math.PI / 2 },
    { cx: radius - ht + r, cy: -hw + r, start: Math.PI },
  ];

  const points: THREE.Vector2[] = [];
  for (const c of corners) {
    for (let i = 0; i <= steps; i++) {
      const a = c.start + (i / steps) * (Math.PI / 2);
      points.push(new THREE.Vector2(c.cx + Math.cos(a) * r, c.cy + Math.sin(a) * r));
    }
  }
  points.push(points[0].clone());

  return new THREE.LatheGeometry(points, segments);
}

export function createBrushedTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas no disponible');

  ctx.fillStyle = 'rgb(225,225,225)';
  ctx.fillRect(0, 0, w, h);

  for (let y = 0; y < h; y++) {
    const v = Math.round(175 + Math.random() * 80);
    ctx.fillStyle = `rgba(${v},${v},${v},0.6)`;
    ctx.fillRect(0, y, w, 1);
  }

  for (let i = 0; i < 900; i++) {
    const y = Math.random() * h;
    const x = Math.random() * w;
    const len = w * (0.15 + Math.random() * 0.85);
    const v = Math.random() > 0.5 ? 255 : 150;
    ctx.fillStyle = `rgba(${v},${v},${v},0.22)`;
    ctx.fillRect(x, y, len, 0.7);
    ctx.fillRect(x - w, y, len, 0.7);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}
