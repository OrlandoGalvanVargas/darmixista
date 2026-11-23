import * as THREE from 'three';

export interface ScreenText {
  status: string;
  synced: string;
  tabs: string[];
  locale: string;
}

const SANS = '"Geist Variable", "Geist", system-ui, sans-serif';
const MONO = '"Geist Mono Variable", "Geist Mono", ui-monospace, monospace';
const D_PATH = 'M10 6H30A26 26 0 0 1 30 58H10ZM22 17.5H30A14.5 14.5 0 0 1 30 46.5H22Z';
const X_PATH = 'M41.75 39L58.25 61M58.25 39L41.75 61';
const ZONE = 'America/Mexico_City';

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!];
}

function texture(c: HTMLCanvasElement, max: number) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.flipY = false;
  t.anisotropy = max;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

export function laptopScreen(max: number): THREE.CanvasTexture {
  const W = 1920;
  const H = 1200;
  const [c, ctx] = canvas(W, H);
  const bg = ctx.createRadialGradient(W / 2, H * 0.44, 40, W / 2, H * 0.46, W * 0.62);
  bg.addColorStop(0, '#16201b');
  bg.addColorStop(0.5, '#0e1110');
  bg.addColorStop(1, '#0a0b0b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,255,255,.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(W, y + 0.5);
    ctx.stroke();
  }
  const glow = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, 320);
  glow.addColorStop(0, 'rgba(34,197,94,.2)');
  glow.addColorStop(1, 'rgba(34,197,94,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  const s = 5.2;
  ctx.translate(W / 2 - 40 * s, H * 0.42 - 32 * s);
  ctx.scale(s, s);
  const g = ctx.createLinearGradient(0, 6, 0, 58);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(1, '#d6d9d8');
  ctx.fillStyle = g;
  ctx.fill(new Path2D(D_PATH), 'evenodd');
  ctx.save();
  ctx.beginPath();
  ctx.rect(30, 40, 40, 21);
  ctx.clip();
  ctx.strokeStyle = '#0e1110';
  ctx.lineWidth = 12;
  ctx.stroke(new Path2D(X_PATH));
  ctx.restore();
  ctx.beginPath();
  ctx.rect(30, 42, 40, 16);
  ctx.clip();
  const gx = ctx.createLinearGradient(42, 58, 58, 42);
  gx.addColorStop(0, '#16a34a');
  gx.addColorStop(1, '#4ade80');
  ctx.strokeStyle = gx;
  ctx.lineWidth = 5.6;
  ctx.stroke(new Path2D(X_PATH));
  ctx.restore();
  ctx.fillStyle = '#f4f4f5';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `500 44px ${SANS}`;
  ctx.letterSpacing = '18px';
  ctx.fillText('DARMIXISTA', W / 2 + 9, H * 0.69);
  ctx.letterSpacing = '0px';
  ctx.font = `400 30px ${MONO}`;
  const pre = '~/portafolio ';
  const mid = '$ ';
  const cmd = 'npm run dev';
  const tw = ctx.measureText(pre + mid + cmd).width;
  let x = W / 2 - tw / 2;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#8b8f8d';
  ctx.fillText(pre, x, H * 0.77);
  x += ctx.measureText(pre).width;
  ctx.fillStyle = '#22c55e';
  ctx.fillText(mid, x, H * 0.77);
  x += ctx.measureText(mid).width;
  ctx.fillStyle = '#c9ccca';
  ctx.fillText(cmd, x, H * 0.77);
  ctx.fillStyle = 'rgba(20,22,22,.94)';
  ctx.fillRect(0, H - 60, W, 60);
  ctx.fillStyle = 'rgba(255,255,255,.07)';
  ctx.fillRect(0, H - 60, W, 1);
  ctx.font = `400 22px ${MONO}`;
  ctx.fillStyle = '#9a9e9c';
  ctx.textAlign = 'left';
  ctx.fillText('orlando@loq', 30, H - 30);
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i === 1 ? 'rgba(34,197,94,.9)' : '#2a2d2c';
    ctx.beginPath();
    ctx.roundRect(W / 2 - 100 + i * 42, H - 46, 32, 32, 8);
    ctx.fill();
  }
  return texture(c, max);
}

function circuit(ctx: CanvasRenderingContext2D, x0: number, flip: boolean) {
  ctx.save();
  ctx.translate(x0, 0);
  if (flip) ctx.scale(-1, 1);
  ctx.strokeStyle = '#dbe9f2';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 90);
  ctx.lineTo(70, 90);
  ctx.lineTo(70, 122);
  ctx.lineTo(136, 122);
  ctx.moveTo(0, 180);
  ctx.lineTo(48, 180);
  ctx.lineTo(48, 212);
  ctx.lineTo(104, 212);
  ctx.lineTo(104, 180);
  ctx.lineTo(168, 180);
  ctx.moveTo(0, 270);
  ctx.lineTo(40, 270);
  ctx.lineTo(40, 246);
  ctx.lineTo(112, 246);
  ctx.moveTo(0, 304);
  ctx.lineTo(72, 304);
  ctx.lineTo(72, 328);
  ctx.lineTo(160, 328);
  ctx.stroke();
  ctx.strokeRect(16, 244, 46, 34);
  ctx.strokeRect(106, 238, 14, 11);
  ctx.fillStyle = '#dbe9f2';
  for (const [x, y, r] of [
    [70, 90, 5],
    [104, 212, 5],
    [160, 328, 5],
  ])
    ctx.beginPath(), ctx.arc(x, y, r, 0, Math.PI * 2), ctx.fill();
  ctx.fillStyle = '#6cc4ff';
  for (const [x, y] of [
    [136, 122],
    [168, 180],
  ])
    ctx.beginPath(), ctx.arc(x, y, 7, 0, Math.PI * 2), ctx.fill();
  ctx.restore();
}

export function miniScreen(text: ScreenText, max: number) {
  const W = 1280;
  const H = 768;
  const [c, ctx] = canvas(W, H);
  const tex = texture(c, max);
  const time = new Intl.DateTimeFormat(text.locale, { timeZone: ZONE, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const day = new Intl.DateTimeFormat(text.locale, { timeZone: ZONE, weekday: 'long' });
  const date = new Intl.DateTimeFormat(text.locale, { timeZone: ZONE, day: 'numeric', month: 'long' });
  const year = new Intl.DateTimeFormat(text.locale, { timeZone: ZONE, year: 'numeric' });
  const cap = (s: string) =>
    s
      .split(' ')
      .map((w, i) => (i > 0 && (w === 'de' || w === 'del') ? w : w.charAt(0).toLocaleUpperCase(text.locale) + w.slice(1)))
      .join(' ');
  const icon = (kind: number, x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = ctx.fillStyle as string;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    if (kind === 0) {
      ctx.moveTo(-10, 0);
      ctx.lineTo(0, -9);
      ctx.lineTo(10, 0);
      ctx.moveTo(-7, -2);
      ctx.lineTo(-7, 9);
      ctx.lineTo(7, 9);
      ctx.lineTo(7, -2);
    } else if (kind === 1) {
      for (const yy of [-6, 0, 6]) {
        ctx.moveTo(-9, yy);
        ctx.lineTo(9, yy);
      }
    } else if (kind === 2) {
      ctx.moveTo(-8, 0);
      ctx.lineTo(-3, 6);
      ctx.lineTo(9, -7);
    } else if (kind === 3) {
      ctx.moveTo(-9, -4);
      ctx.lineTo(7, -4);
      ctx.moveTo(3, -8);
      ctx.lineTo(7, -4);
      ctx.lineTo(3, 0);
      ctx.moveTo(9, 4);
      ctx.lineTo(-7, 4);
      ctx.moveTo(-3, 0);
      ctx.lineTo(-7, 4);
      ctx.lineTo(-3, 8);
    } else {
      ctx.moveTo(-7, 5);
      ctx.lineTo(-7, -1);
      ctx.arc(0, -1, 7, Math.PI, 0);
      ctx.lineTo(7, 5);
      ctx.lineTo(-9, 5);
      ctx.lineTo(9, 5);
      ctx.moveTo(-2, 9);
      ctx.lineTo(2, 9);
    }
    ctx.stroke();
    ctx.restore();
  };
  const draw = () => {
    const now = new Date();
    const bg = ctx.createRadialGradient(W / 2, H * 0.36, 30, W / 2, H * 0.42, W * 0.6);
    bg.addColorStop(0, '#2c4d67');
    bg.addColorStop(1, '#16283a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(220,235,245,.8)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(18, 24);
    ctx.lineTo(18, 606);
    ctx.moveTo(W - 18, 24);
    ctx.lineTo(W - 18, 606);
    ctx.stroke();
    ctx.setLineDash([7, 6]);
    ctx.strokeStyle = 'rgba(200,225,240,.32)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let y = 110; y < 600; y += 88) {
      ctx.moveTo(18, y);
      ctx.lineTo(280, y);
      ctx.moveTo(W - 280, y);
      ctx.lineTo(W - 18, y);
    }
    ctx.moveTo(416, 24);
    ctx.lineTo(416, 606);
    ctx.moveTo(W - 416, 24);
    ctx.lineTo(W - 416, 606);
    ctx.stroke();
    ctx.setLineDash([]);
    circuit(ctx, 30, false);
    circuit(ctx, W - 30, true);
    ctx.fillStyle = '#f2f8fb';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `600 96px ${SANS}`;
    ctx.fillText(time.format(now), W / 2, 162);
    const lg = ctx.createLinearGradient(W / 2 - 250, 0, W / 2 + 250, 0);
    lg.addColorStop(0, 'rgba(120,200,255,.15)');
    lg.addColorStop(0.5, '#a5dcff');
    lg.addColorStop(1, 'rgba(120,200,255,.15)');
    ctx.fillStyle = lg;
    ctx.shadowColor = 'rgba(120,200,255,.8)';
    ctx.shadowBlur = 12;
    ctx.fillRect(W / 2 - 250, 200, 500, 4);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f2f8fb';
    ctx.font = `600 54px ${SANS}`;
    ctx.fillText(cap(day.format(now)), W / 2, 288);
    ctx.fillText(cap(date.format(now)), W / 2, 352);
    ctx.fillText(year.format(now), W / 2, 416);
    const sb = ctx.createLinearGradient(24, 0, W - 24, 0);
    sb.addColorStop(0, 'rgba(60,140,200,.38)');
    sb.addColorStop(1, 'rgba(60,140,200,.12)');
    ctx.fillStyle = sb;
    ctx.fillRect(24, 610, W - 48, 50);
    ctx.fillStyle = 'rgba(140,200,240,.6)';
    ctx.fillRect(24, 610, W - 48, 2);
    ctx.textAlign = 'left';
    ctx.font = `600 25px ${SANS}`;
    ctx.fillStyle = '#5ef07f';
    ctx.fillText(`◉ ${text.status}`, 44, 645);
    const sw = ctx.measureText(`◉ ${text.status}`).width;
    ctx.fillText(`✓ ${text.synced}`, 44 + sw + 30, 645);
    ctx.fillStyle = 'rgba(40,110,160,.62)';
    ctx.fillRect(24, 662, W - 48, 76);
    const cw = (W - 48) / text.tabs.length;
    text.tabs.forEach((label, i) => {
      const cx = 24 + cw * i;
      if (i === 0) {
        ctx.fillStyle = 'rgba(120,190,235,.26)';
        ctx.fillRect(cx + 14, 662, cw - 28, 76);
        ctx.fillStyle = '#7cc9f2';
        ctx.fillRect(cx + 14, 662, cw - 28, 4);
      }
      ctx.font = `600 26px ${SANS}`;
      ctx.fillStyle = i === 0 ? '#ffffff' : '#a8dcf5';
      const lw = ctx.measureText(label).width;
      const x = cx + cw / 2 - (lw + 32) / 2;
      icon(i, x + 10, 699);
      ctx.fillText(label, x + 32, 709);
    });
    tex.needsUpdate = true;
  };
  draw();
  return { texture: tex, draw };
}
