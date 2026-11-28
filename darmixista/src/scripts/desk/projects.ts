import * as THREE from 'three';
import { gsap } from 'gsap';
import type { ScreenUniforms } from './laptop';
import { DESK_PROJECTS, type DeskProject } from './work';

export type Lang = 'es' | 'en';

const TEXT = {
  es: { site: 'Visitar', code: 'Código', year: 'Año', plat: 'Plataforma', area: 'Área', status: 'Estado', what: 'Qué resuelve', how: 'Cómo está hecho', web: 'Web', android: 'Android', live: 'En línea', apk: 'APK disponible' },
  en: { site: 'Visit', code: 'Code', year: 'Year', plat: 'Platform', area: 'Area', status: 'Status', what: 'What it solves', how: 'How it’s built', web: 'Web', android: 'Android', live: 'Live', apk: 'APK available' },
};

const IW = 2048;
const IH = 1280;
const SANS = '"Geist Variable", "Geist", ui-sans-serif, system-ui, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';

interface Hit {
  x: number;
  y: number;
  w: number;
  h: number;
  url: string;
}

export interface ProjectsOptions {
  screen: ScreenUniforms;
  black: THREE.Texture;
  lang: Lang;
  small: boolean;
  maxAniso: number;
  onChange: (i: number) => void;
}

const clamp = (a: number, v: number, b: number) => Math.min(b, Math.max(a, v));

const wrap = (ctx: CanvasRenderingContext2D, text: string, max: number, lines: number) => {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width <= max || !cur) {
      cur = next;
      continue;
    }
    out.push(cur);
    cur = w;
    if (out.length === lines) {
      let last = out[lines - 1];
      while (last.length && ctx.measureText(`${last}…`).width > max) last = last.slice(0, -1);
      out[lines - 1] = `${last.replace(/[\s,.;:]+$/, '')}…`;
      return out;
    }
  }
  if (cur) out.push(cur);
  return out;
};

export function createProjects(o: ProjectsOptions) {
  const t = TEXT[o.lang];
  const list = DESK_PROJECTS;
  const n = list.length;
  const s = o.screen;

  const makeVideo = () => {
    const v = document.createElement('video');
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.preload = 'none';
    v.disablePictureInPicture = true;
    v.setAttribute('aria-hidden', 'true');
    v.style.display = 'none';
    document.body.appendChild(v);
    const tex = new THREE.VideoTexture(v);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return { v, tex, idx: -1 };
  };
  const slots = [makeVideo(), makeVideo()];
  let front = 0;
  const url = (i: number) => `/desk/projects/${list[i].slug}${o.small ? '-m' : ''}.mp4`;
  const uni = (slot: number) => (slot === 0 ? s.vidA : s.vidB);
  s.vidA.value = o.black;
  s.vidB.value = o.black;

  const ic = document.createElement('canvas');
  ic.width = IW;
  ic.height = IH;
  const ictx = ic.getContext('2d')!;
  const infoTex = new THREE.CanvasTexture(ic);
  infoTex.colorSpace = THREE.SRGBColorSpace;
  infoTex.flipY = false;
  infoTex.anisotropy = o.maxAniso;
  infoTex.minFilter = THREE.LinearMipmapLinearFilter;
  s.info.value = infoTex;
  let sw = 900;
  let hits: Hit[] = [];
  let hover = -1;
  let drawn = '';

  const linkFor = (p: DeskProject) => {
    const l = p.data.links;
    const site = l.demo ?? (l.page ? `${o.lang === 'en' ? '/en' : ''}/${l.page}` : '');
    return { site, code: l.code ?? '' };
  };

  const COND = '"DeskCond", "Archivo", "Arial Narrow", sans-serif';

  const pill = (x: number, y: number, h: number, label: string, primary: boolean, on: boolean, fs: number, draw: boolean) => {
    ictx.font = `600 ${fs}px ${SANS}`;
    const w = ictx.measureText(label).width + h * 1.05;
    if (!draw) return w;
    const k = IW / sw;
    ictx.beginPath();
    ictx.roundRect(x, y, w, h, h / 2);
    if (primary) {
      ictx.fillStyle = on ? '#ffffff' : '#f2f2f3';
      ictx.fill();
    } else {
      if (on) {
        ictx.fillStyle = 'rgba(255,255,255,0.12)';
        ictx.fill();
      }
      ictx.strokeStyle = 'rgba(242,242,243,0.9)';
      ictx.lineWidth = 1.5 * k;
      ictx.beginPath();
      ictx.roundRect(x + 0.75 * k, y + 0.75 * k, w - 1.5 * k, h - 1.5 * k, h / 2);
      ictx.stroke();
    }
    ictx.fillStyle = primary ? '#0b0b0c' : '#f2f2f3';
    ictx.textAlign = 'center';
    ictx.textBaseline = 'middle';
    ictx.fillText(label, x + w / 2, y + h / 2 + fs * 0.04);
    ictx.textAlign = 'left';
    return w;
  };

  type Meta = 4 | 3 | 2 | 22;
  type Body = 'two' | 'stack' | 'what';
  interface Plan {
    meta: Meta;
    body: Body;
  }

  const metaItems = (p: DeskProject) => {
    const web = p.kind === 'web';
    return [
      [t.year, p.data.year],
      [t.plat, web ? t.web : t.android],
      [t.area, p.data.category[o.lang]],
      [t.status, web ? t.live : t.apk],
    ] as [string, string][];
  };

  const compose = (p: DeskProject, plan: Plan, draw: boolean, force = false) => {
    const k = IW / sw;
    const L = o.lang;
    const padX = clamp(18, sw * 0.06, 64) * k;
    const padT = clamp(13, sw * 0.052, 56) * k;
    const padB = clamp(12, sw * 0.048, 52) * k;
    const maxW = IW - padX * 2;
    const titleF = clamp(20, sw * 0.056, 56) * k;
    const valF = clamp(11.5, sw * 0.0175, 17.5) * k;
    const labF = clamp(8.5, sw * 0.012, 12) * k;
    const btnF = clamp(11, sw * 0.016, 16) * k;
    const btnH = btnF * 2.45;
    const gapC = clamp(14, sw * 0.04, 40) * k;
    const label = (txt: string, x: number, y: number) => {
      ictx.font = `400 ${labF}px ${MONO}`;
      ictx.letterSpacing = `${labF * 0.1}px`;
      ictx.fillStyle = '#7c7c82';
      ictx.textBaseline = 'alphabetic';
      ictx.fillText(txt.toUpperCase(), x, y + labF);
      ictx.letterSpacing = '0px';
    };

    const headH = titleF * 0.92 + titleF * 0.38;
    const items = metaItems(p);
    const metaList = plan.meta === 3 ? items.slice(0, 3) : plan.meta === 2 ? items.slice(0, 2) : items;
    const metaCols = plan.meta === 22 ? 2 : metaList.length;
    const metaGap = gapC * 0.75;
    const metaW = (maxW - metaGap * (metaCols - 1)) / metaCols;
    if (metaW / k < 74) return null;
    ictx.font = `500 ${valF}px ${SANS}`;
    const metaLines = metaList.map(([, v]) => wrap(ictx, v, metaW, 2));
    const metaRows: number[] = [];
    for (let r = 0; r * metaCols < metaList.length; r++) {
      const row = metaLines.slice(r * metaCols, (r + 1) * metaCols);
      metaRows.push(labF * 1.75 + Math.max(...row.map((l) => l.length)) * valF * 1.3);
    }
    const metaH = metaRows.reduce((a, b) => a + b, 0) + (metaRows.length - 1) * valF * 1.1;

    const sh = p.data.sheet;
    const what = sh?.what[L] ?? (p.data.summaryShort ?? p.data.summary)[L];
    const how = sh?.how[L] ?? '';
    const blocks: { title: string; text: string }[] = plan.body === 'what' || !how ? [{ title: t.what, text: what }] : [{ title: t.what, text: what }, { title: t.how, text: how }];
    const side = plan.body === 'two' && blocks.length === 2;
    const bw = side ? (maxW - gapC) / 2 : maxW;
    ictx.font = `400 ${valF}px ${SANS}`;
    const bl = blocks.map((b) => wrap(ictx, b.text, bw, sw < 420 ? 4 : 6));
    const lh = valF * (sw < 420 ? 1.45 : 1.55);
    const bh = bl.map((l) => labF * 1.75 + l.length * lh);
    const sepGap = valF * (sw < 420 ? 0.95 : 1.2);
    const bodyH = sepGap + (side ? Math.max(...bh) : bh.reduce((a, b) => a + b, 0) + (bh.length - 1) * valF * 1.2);

    const total = headH + metaH + bodyH + btnH;
    const free = IH - padT - padB - total;
    const minGap = clamp(7, sw * 0.026, 30) * k;
    if (free < minGap * 3 && !force) return null;
    if (!draw) return true;
    const gap = Math.max(0, Math.min(free / 3, clamp(18, sw * 0.07, 80) * k));
    const extra = Math.max(0, free - gap * 3);
    let y = padT + extra * 0.45;

    ictx.textAlign = 'left';
    ictx.textBaseline = 'alphabetic';
    ictx.font = `750 ${titleF}px ${COND}`;
    ictx.letterSpacing = `${titleF * 0.005}px`;
    ictx.fillStyle = '#f2f2f3';
    const title = p.data.title.toUpperCase();
    const tw = ictx.measureText(title).width;
    if (tw > maxW) ictx.font = `750 ${(titleF * maxW) / tw}px ${COND}`;
    ictx.fillText(title, padX, y + titleF * 0.86);
    ictx.letterSpacing = '0px';
    y += headH;
    ictx.fillStyle = 'rgba(242,242,243,0.85)';
    ictx.fillRect(padX, y - 1.5 * k, maxW, 1.5 * k);
    y += gap;

    let ry = y;
    metaRows.forEach((rh, r) => {
      for (let c = 0; c < metaCols; c++) {
        const idx = r * metaCols + c;
        if (idx >= metaList.length) break;
        const x = padX + c * (metaW + metaGap);
        label(metaList[idx][0], x, ry);
        ictx.font = `500 ${valF}px ${SANS}`;
        ictx.fillStyle = '#ececee';
        metaLines[idx].forEach((ln, j) => ictx.fillText(ln, x, ry + labF * 1.75 + valF * 0.95 + j * valF * 1.3));
      }
      ry += rh + valF * 1.1;
    });
    y += metaH + gap;

    ictx.fillStyle = 'rgba(255,255,255,0.1)';
    ictx.fillRect(padX, y, maxW, Math.max(1, 1 * k));
    y += sepGap;
    let by = y;
    blocks.forEach((b, i) => {
      const x = side ? padX + i * (bw + gapC) : padX;
      const yy = side ? y : by;
      label(b.title, x, yy);
      ictx.font = `400 ${valF}px ${SANS}`;
      ictx.fillStyle = '#cfcfd4';
      bl[i].forEach((ln, j) => ictx.fillText(ln, x, yy + labF * 1.75 + valF * 1.05 + j * lh));
      by += bh[i] + valF * 1.2;
    });
    y += bodyH - sepGap + gap;

    const lk = linkFor(p);
    const out: Hit[] = [];
    let bx = padX;
    if (lk.site) {
      const w = pill(bx, y, btnH, t.site, true, hover === 0, btnF, true);
      out.push({ x: bx, y, w, h: btnH, url: lk.site });
      bx += w + btnH * 0.28;
    }
    if (lk.code) {
      const w = pill(bx, y, btnH, t.code, false, hover === out.length, btnF, true);
      out.push({ x: bx, y, w, h: btnH, url: lk.code });
    }
    hits = out;
    return true;
  };

  const drawInfo = (i: number) => {
    const key = `${i}|${Math.round(sw)}|${hover}`;
    if (key === drawn) return;
    drawn = key;
    const p = list[i];
    const plans: Plan[] = [
      { meta: 4, body: 'two' },
      { meta: 4, body: 'stack' },
      { meta: 22, body: 'stack' },
      { meta: 4, body: 'what' },
      { meta: 3, body: 'what' },
      { meta: 22, body: 'what' },
      { meta: 2, body: 'what' },
    ];
    ictx.clearRect(0, 0, IW, IH);
    ictx.fillStyle = '#0b0b0c';
    ictx.fillRect(0, 0, IW, IH);
    const plan = plans.find((pl) => (pl.body !== 'two' || sw >= 520) && compose(p, pl, false));
    if (plan) compose(p, plan, true);
    else compose(p, plans[plans.length - 1], true, true);
    infoTex.needsUpdate = true;
  };

  let index = 0;
  let active = false;
  let arrived = false;
  let open = false;
  let info = false;
  let off = false;
  let token = 0;
  let busyUntil = 0;
  let fontsOk = false;
  const cond = new FontFace('DeskCond', 'url(/desk/fonts/archivo-cond.woff2)', { weight: '750' });
  const fonts = Promise.all([
    cond.load().then((f) => document.fonts.add(f)),
    document.fonts.load(`500 32px ${SANS}`),
    document.fonts.load(`400 32px ${SANS}`),
    document.fonts.load(`600 32px ${SANS}`),
    document.fonts.load(`400 32px ${MONO}`),
  ])
    .catch(() => {})
    .then(() => {
      fontsOk = true;
    });
  const kick = (sec: number) => {
    busyUntil = Math.max(busyUntil, performance.now() + sec * 1000 + 80);
  };
  const tween = (u: { value: number }, value: number, duration: number, ease: string, onComplete?: () => void) => {
    gsap.killTweensOf(u);
    kick(duration);
    gsap.to(u, { value, duration, ease, onComplete });
  };
  const paintInfo = () => {
    if (fontsOk) drawInfo(index);
    else void fonts.then(() => drawInfo(index));
  };

  const load = (slot: number, i: number) => {
    const sl = slots[slot];
    if (sl.idx === i && sl.v.src) return;
    sl.idx = i;
    uni(slot).value = o.black;
    sl.v.preload = 'auto';
    sl.v.src = url(i);
    sl.v.load();
  };
  const whenReady = (slot: number) =>
    new Promise<void>((res) => {
      const v = slots[slot].v;
      const ok = () => {
        uni(slot).value = slots[slot].tex;
        res();
      };
      if (v.readyState >= 3) return ok();
      const done = () => {
        v.removeEventListener('canplay', done);
        ok();
      };
      v.addEventListener('canplay', done);
    });
  const play = (v: HTMLVideoElement) => {
    const p = v.play();
    if (p) p.catch(() => {});
  };
  const firstFrame = (v: HTMLVideoElement) =>
    new Promise<void>((res) => {
      if (typeof v.requestVideoFrameCallback === 'function') v.requestVideoFrameCallback(() => res());
      else v.addEventListener('playing', () => res(), { once: true });
      window.setTimeout(res, 900);
    });
  const showFront = () => {
    gsap.killTweensOf(s.mix);
    s.mix.value = front;
    kick(0);
  };
  const preloadNext = () => {
    const back = 1 - front;
    const next = (index + 1) % n;
    if (slots[back].idx !== next) load(back, next);
  };

  const openScreen = async () => {
    const my = token;
    await whenReady(front);
    if (my !== token || !active || !arrived || off) return;
    const v = slots[front].v;
    if (v.ended) v.currentTime = 0;
    play(v);
    await firstFrame(v);
    if (my !== token || !active || off) return;
    open = true;
    tween(s.win, 1, 1.1, 'power2.out');
    preloadNext();
  };

  const enter = () => {
    token++;
    active = true;
    arrived = false;
    info = false;
    off = false;
    s.show.value = 0;
    index = 0;
    o.onChange(0);
    if (slots[front].idx !== 0) {
      if (slots[1 - front].idx === 0) front = 1 - front;
      else load(front, 0);
    }
    showFront();
  };

  const arrive = () => {
    if (!active || arrived) return;
    arrived = true;
    void openScreen();
  };

  const leave = () => {
    if (!active) return;
    token++;
    active = false;
    arrived = false;
    open = false;
    info = false;
    off = false;
    hover = -1;
    tween(s.show, 0, 0.35, 'power2.out');
    tween(s.win, 0, 0.7, 'power2.inOut', () => {
      if (active) return;
      slots.forEach((sl) => sl.v.pause());
      const v = slots[front].v;
      if (v.readyState >= 1) v.currentTime = 0;
    });
  };

  const wake = () => {
    off = false;
    if (!open) {
      void openScreen();
      return;
    }
    tween(s.win, 1, 0.8, 'power2.out');
    if (info) tween(s.show, 1, 0.5, 'power2.out');
    else play(slots[front].v);
  };

  const select = (i: number) => {
    i = ((i % n) + n) % n;
    if (!active || i === index) return;
    index = i;
    o.onChange(i);
    const my = ++token;
    const wasOff = off;
    off = false;
    if (info) {
      info = false;
      hover = -1;
      tween(s.show, 0, 0.35, 'power2.out');
    }
    if (!arrived) {
      const back = 1 - front;
      if (slots[back].idx === i) front = back;
      else load(front, i);
      showFront();
      return;
    }
    const back = 1 - front;
    load(back, i);
    const old = slots[front].v;
    void (async () => {
      await whenReady(back);
      if (my !== token || !active) return;
      const v = slots[back].v;
      v.currentTime = 0;
      play(v);
      await firstFrame(v);
      if (my !== token || !active) return;
      front = back;
      if (!open || wasOff || s.win.value < 0.5) {
        old.pause();
        showFront();
        open = true;
        tween(s.win, 1, 0.9, 'power2.out');
        preloadNext();
        return;
      }
      tween(s.mix, front, 0.55, 'power2.inOut', () => {
        if (my !== token) return;
        old.pause();
        preloadNext();
      });
    })();
  };

  slots.forEach((sl, k) =>
    sl.v.addEventListener('ended', () => {
      if (k !== front || !active || info || off) return;
      select(index + 1);
    }),
  );

  const toggle = () => {
    if (!active || !open) return false;
    info = !info;
    hover = -1;
    if (info) {
      paintInfo();
      slots[front].v.pause();
      tween(s.show, 1, 0.5, 'power2.out');
    } else {
      tween(s.show, 0, 0.45, 'power2.inOut');
      play(slots[front].v);
    }
    return true;
  };

  const power = (): 'on' | 'off' | null => {
    if (!active || !arrived) return null;
    if (off) {
      wake();
      return 'on';
    }
    off = true;
    hover = -1;
    slots.forEach((sl) => sl.v.pause());
    tween(s.show, 0, 0.45, 'power2.inOut');
    tween(s.win, 0, 0.75, 'power2.inOut');
    return 'off';
  };

  const hitAt = (u: number, v: number) => {
    const x = u * IW;
    const y = v * IH;
    return hits.findIndex((h) => x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h);
  };

  const click = (u: number, v: number) => {
    if (!active || !arrived) return false;
    if (off) {
      wake();
      return true;
    }
    if (!open) return false;
    if (info && s.show.value > 0.6) {
      const k = hitAt(u, v);
      if (k >= 0) {
        const href = hits[k].url;
        if (href.startsWith('/')) window.location.href = href;
        else window.open(href, '_blank', 'noopener');
        return true;
      }
    }
    return toggle();
  };

  const point = (u: number | null, v = 0) => {
    if (!active || !arrived) return false;
    const k = info && !off && u !== null ? hitAt(u, v) : -1;
    if (k !== hover) {
      hover = k;
      if (info) drawInfo(index);
    }
    return u !== null && (open || off);
  };

  const setSize = (px: number) => {
    const next = Math.round(clamp(260, px, 1600));
    if (Math.abs(next - sw) < 2) return;
    sw = next;
    if (info) drawInfo(index);
  };

  const playing = () => active && open && !off && !info && !slots[front].v.paused;
  const update = () => performance.now() < busyUntil || playing();

  const progress = () => {
    const v = slots[front].v;
    if (!active || !v.duration || slots[front].idx !== index) return 0;
    return Math.min(1, v.currentTime / v.duration);
  };

  const preload = () => {
    if (slots[front].idx === -1) load(front, 0);
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) slots.forEach((sl) => sl.v.pause());
    else if (playing() || (active && open && !off && !info)) play(slots[front].v);
  });
  window.addEventListener(
    'pointerdown',
    () => {
      if (active && open && !off && !info && slots[front].v.paused) play(slots[front].v);
    },
    { passive: true },
  );

  const restore = () => {
    drawn = '';
    if (info) drawInfo(index);
  };

  return {
    count: n,
    index: () => index,
    enter,
    arrive,
    leave,
    select,
    step: (d: number) => select(index + d),
    click,
    point,
    power,
    setSize,
    update,
    progress,
    preload,
    restore,
  };
}
