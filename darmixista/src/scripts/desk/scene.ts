import * as THREE from 'three';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createFan } from './fan';
import { createWhoosh } from './whoosh';
import { createBoard, type BoardTool } from './board';
import { createLaptopPhoto } from './laptop';
import { ledScreen, miniScreen, type ScreenText } from './screens';

export type ShotKey = 'home' | 'projects' | 'about' | 'contact' | 'board';
export const SHOTS: ShotKey[] = ['home', 'projects', 'about', 'contact'];

interface SceneData {
  wide: { pos: number[]; target: number[] };
  mob: { pos: number[]; target: number[] };
  anchors: Record<string, number[]>;
  screens: Record<string, { matrix: number[][]; dims: number[] }>;
}

interface Shot {
  target: THREE.Vector3;
  position: THREE.Vector3;
  offsetY: number;
  azimuth: [number, number];
  polar: [number, number];
  distance: [number, number];
}

export interface DeskOptions {
  host: HTMLElement;
  base: string;
  screen: ScreenText;
  topLimit: () => number;
  onProgress: (p: number) => void;
  onShot: (key: ShotKey) => void;
  onZoom: (canIn: boolean, canOut: boolean) => void;
  onBoard?: (s: { pan: boolean; left: number; width: number }) => void;
}

export interface DeskHandle {
  go: (key: ShotKey, instant?: boolean) => void;
  intro: () => void;
  zoom: (dir: 1 | -1) => void;
  reset: () => void;
  current: () => ShotKey;
  busy: () => boolean;
  board: { tool: (t: BoardTool) => void; color: (c: string) => void; mode: (m: 'draw' | 'move') => void };
}

const FOV = 40;
const fovFor = (aspect: number) => Math.min(60, Math.max(FOV, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(21)) / aspect))));
const TRAVEL = 1.6;
const b2t = (v: number[]) => new THREE.Vector3(v[0], v[2], -v[1]);
const BOARD = { x: -1.229, y: -0.8, z: 1.42, w: 1.2, h: 0.9 };
const ROOM = { x0: -1.25 + 0.14, x1: 1.1 - 0.14, y0: 0.12, y1: 2.8 - 0.14, z1: 3.9 - 0.14, z0: -0.47 + 0.14 };

function roomLimit(from: THREE.Vector3, dir: THREE.Vector3) {
  let t = Infinity;
  const axis = (p: number, d: number, lo: number, hi: number) => {
    if (d > 1e-6) t = Math.min(t, (hi - p) / d);
    else if (d < -1e-6) t = Math.min(t, (lo - p) / d);
  };
  axis(from.x, dir.x, ROOM.x0, ROOM.x1);
  axis(from.y, dir.y, ROOM.y0, ROOM.y1);
  axis(from.z, dir.z, ROOM.z0, ROOM.z1);
  return Math.max(0.05, t);
}

interface HeroFinish {
  rough: number;
  metal?: number;
  env?: number;
  color?: string;
}
const HERO_DEFAULT: HeroFinish = { rough: 0.6, env: 0.6 };
const HERO: Record<string, HeroFinish> = {
  hpcup: { rough: 0.2, env: 1.25 },
  hpchrome: { rough: 0.1, metal: 1, color: '#e4e7ea' },
  hpband: { rough: 0.42, env: 0.8 },
  hppad: { rough: 0.6, env: 0.45 },
  hpmesh: { rough: 0.95, env: 0.25 },
  hpfabric: { rough: 0.95, env: 0.2 },
  hpstitch: { rough: 0.9, env: 0.2 },
  btlbody: { rough: 0.48, env: 0.9 },
  btlring: { rough: 0.7, env: 0.5 },
  btlrib: { rough: 0.5, env: 0.7 },
  btllid: { rough: 0.38, env: 0.9 },
  btltop: { rough: 0.08, env: 1.2 },
  btlstrap: { rough: 0.9, env: 0.3 },
  btlclip: { rough: 0.22, metal: 1, color: '#c9cdd1' },
  snkleaf: { rough: 0.42, env: 0.55 },
  snkpot: { rough: 0.16, env: 1.1 },
  snksoil: { rough: 0.95, env: 0.1 },
  msebody: { rough: 0.42, env: 0.8 },
  msegloss: { rough: 0.1, env: 1.2 },
  mseside: { rough: 0.25, env: 1 },
  msewheel: { rough: 0.8, env: 0.3 },
  mseled: { rough: 0.4, env: 0.15 },
  mniglass: { rough: 0.05, env: 1.3 },
  mnibody: { rough: 0.55, env: 0.4 },
  mnipcb: { rough: 0.6, env: 0.3 },
  mnistand: { rough: 0.62, env: 0.35 },
};

const HOME_POINTS = [
  [-0.62, 0.29, 1.12],
  [-0.62, -0.31, 1.12],
  [-0.47, -0.04, 1.42],
  [-0.62, -0.36, 0.78],
  [0.47, 0.24, 1.44],
  [0.62, -0.31, 0.74],
  [0.62, 0.3, 0.74],
  [-0.62, -0.31, 0.52],
  [0.62, -0.31, 0.52],
].map(b2t);

export async function createDesk(o: DeskOptions): Promise<DeskHandle> {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', stencil: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 2 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor('#0b0b0c');
  o.host.appendChild(renderer.domElement);
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const maxTex = renderer.capabilities.maxTextureSize;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.02, 20);

  const manager = new THREE.LoadingManager();
  const parts = new Map<string, number>();
  const report = () => {
    let sum = 0;
    parts.forEach((v) => (sum += v));
    o.onProgress(sum / 11);
  };
  const track = (key: string) => (e: ProgressEvent) => {
    if (e.lengthComputable) parts.set(key, e.loaded / e.total);
    report();
  };
  const texLoader = new THREE.TextureLoader(manager);
  const loadTex = (name: string) =>
    new Promise<THREE.Texture>((resolve, reject) => {
      texLoader.load(
        `${o.base}${name}`,
        (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          t.flipY = false;
          t.anisotropy = maxAniso;
          parts.set(name, 1);
          report();
          resolve(t);
        },
        undefined,
        reject,
      );
    });
  const gltfLoader = new GLTFLoader(manager);
  gltfLoader.setMeshoptDecoder(MeshoptDecoder);
  const [data, gltf, heroGltf, room, furn, props, zoclo, heroTex, kbdTex, lptTex, lmpTex, nbpTex, wbdTex, crtTex, stkTex] = await Promise.all([
    fetch(`${o.base}scene.json`).then((r) => r.json() as Promise<SceneData>),
    new Promise<{ scene: THREE.Group }>((resolve, reject) => gltfLoader.load(`${o.base}desk.glb`, (g) => resolve(g), track('glb'), reject)),
    new Promise<{ scene: THREE.Group }>((resolve, reject) => gltfLoader.load(`${o.base}hero.glb`, (g) => resolve(g), track('hero'), reject)),
    loadTex('room.webp'),
    loadTex('furn.webp'),
    loadTex(Math.min(screen.width, screen.height) < 700 || maxTex < 4096 ? 'props-m.webp' : 'props.webp'),
    loadTex('base.webp'),
    loadTex('hero.webp'),
    loadTex(Math.min(screen.width, screen.height) < 700 || maxTex < 4096 ? 'kbd-m.webp' : 'kbd.webp'),
    loadTex(Math.min(screen.width, screen.height) < 700 || maxTex < 4096 ? 'lpt-m.webp' : 'lpt.webp'),
    loadTex(Math.min(screen.width, screen.height) < 700 || maxTex < 4096 ? 'lmp-m.webp' : 'lmp.webp'),
    loadTex(`nbp${document.documentElement.lang.startsWith('en') ? '-en' : ''}${Math.min(screen.width, screen.height) < 700 ? '-m' : ''}.webp`),
    loadTex(Math.min(screen.width, screen.height) < 700 ? 'wbd-m.webp' : 'wbd.webp'),
    loadTex(Math.min(screen.width, screen.height) < 700 || maxTex < 4096 ? 'crt-m.webp' : 'crt.webp'),
    loadTex(Math.min(screen.width, screen.height) < 700 ? 'stk-m.webp' : 'stk.webp'),
  ]);
  parts.set('glb', 1);
  parts.set('hero', 1);
  report();

  const mats: Record<string, THREE.Material> = {
    room: new THREE.MeshBasicMaterial({ map: room }),
    furn: new THREE.MeshBasicMaterial({ map: furn }),
    props: new THREE.MeshBasicMaterial({ map: props }),
    base: new THREE.MeshBasicMaterial({ map: zoclo }),
    kbd: new THREE.MeshBasicMaterial({ map: kbdTex }),
    lpt: new THREE.MeshBasicMaterial({ map: lptTex }),
    lmp: new THREE.MeshBasicMaterial({ map: lmpTex }),
    nbp: new THREE.MeshBasicMaterial({ map: nbpTex }),
    wbd: new THREE.MeshBasicMaterial({ map: wbdTex }),
    crt: new THREE.MeshBasicMaterial({ map: crtTex }),
    stk: new THREE.MeshBasicMaterial({ map: stkTex }),
  };
  const lapPhoto = createLaptopPhoto(o.base, maxAniso, Math.min(screen.width, screen.height) < 700 || maxTex < 4096, reduce, (t) => renderer.initTexture(t));
  const mini = miniScreen(o.screen, maxAniso);
  const led = ledScreen(maxAniso);
  mats.lapscreen = lapPhoto.material;
  mats.miniscreen = new THREE.MeshBasicMaterial({ map: mini.texture, color: new THREE.Color(0.95, 0.95, 0.95) });
  mats.lampled = new THREE.MeshBasicMaterial({ map: led.texture });
  let pageMesh: THREE.Mesh | null = null;
  let boardMesh: THREE.Mesh | null = null;
  let lmpMesh: THREE.Mesh | null = null;
  const pickables: THREE.Object3D[] = [];
  gltf.scene.traverse((n) => {
    const m = n as THREE.Mesh;
    if (!m.isMesh) return;
    const key = Object.keys(mats).find((k) => m.name.startsWith(k));
    m.material = key ? mats[key] : mats.props;
    if (m.name.startsWith('nbp')) pageMesh = m;
    if (m.name.startsWith('lmp')) lmpMesh = m;
    if (m.name.startsWith('wbd')) boardMesh = m;
    else if (!m.name.startsWith('room')) pickables.push(m);
    m.matrixAutoUpdate = false;
    m.updateMatrix();
  });
  scene.add(gltf.scene);
  scene.updateMatrixWorld(true);
  gltf.scene.traverse((n) => {
    if ((n as THREE.Mesh).isMesh && n.name.startsWith('lapscreen')) lapPhoto.attach(n as THREE.Mesh);
  });
  const fan = lmpMesh ? createFan(lmpMesh, b2t([0.505, 0.2542, 1.0177]), b2t([0.505, 0.2398, 0.846])) : null;
  if (fan) scene.add(fan.object);
  const whoosh = createWhoosh(() => fan?.audio() ?? null);

  const buildEnv = () => {
    const cubeTarget = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType });
    const cubeCam = new THREE.CubeCamera(0.02, 20, cubeTarget);
    cubeCam.position.copy(b2t([-0.15, -0.75, 1.05]));
    scene.add(cubeCam);
    cubeCam.update(renderer, scene);
    scene.remove(cubeCam);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromCubemap(cubeTarget.texture);
    pmrem.dispose();
    cubeTarget.dispose();
    return env;
  };
  const envTarget = buildEnv();
  const heroMats = new Map<string, THREE.MeshStandardMaterial>();
  const heroMat = (name: string) => {
    const key = name.replace(/^hero_/, '');
    let m = heroMats.get(key);
    if (m) return m;
    const f = HERO[key] ?? HERO_DEFAULT;
    m = new THREE.MeshStandardMaterial({
      color: new THREE.Color(f.color ?? '#000000'),
      metalness: f.metal ?? 0,
      roughness: f.rough,
      emissive: new THREE.Color(1, 1, 1),
      emissiveMap: heroTex,
      envMap: envTarget.texture,
      envMapIntensity: f.env ?? 1,
    });
    heroMats.set(key, m);
    return m;
  };
  heroGltf.scene.traverse((n) => {
    const m = n as THREE.Mesh;
    if (!m.isMesh) return;
    m.material = heroMat(m.name);
    pickables.push(m);
    m.matrixAutoUpdate = false;
    m.updateMatrix();
  });
  scene.add(heroGltf.scene);
  scene.updateMatrixWorld(true);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.rotateSpeed = coarse ? 0.55 : 0.45;
  controls.zoomSpeed = 0.7;
  controls.zoomToCursor = false;

  let W = 1;
  let H = 1;
  let current: ShotKey = 'home';
  let moving = false;
  let dirty = true;
  const shots = {} as Record<ShotKey, Shot>;
  const view = { offsetY: 0 };

  const screenFrame = (name: string) => {
    const s = data.screens[name];
    const m = new THREE.Matrix4().set(...(s.matrix.flat() as [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number]));
    const c = new THREE.Vector3().setFromMatrixPosition(m);
    const nrm = new THREE.Vector3(0, 0, 1).transformDirection(m);
    return { center: b2t([c.x, c.y, c.z]), normal: b2t([nrm.x, nrm.y, nrm.z]).normalize(), width: s.dims[0] };
  };

  const project = (pos: THREE.Vector3, target: THREE.Vector3, pts: THREE.Vector3[]) => {
    const cam = camera.clone();
    cam.clearViewOffset();
    cam.position.copy(pos);
    cam.lookAt(target);
    cam.updateMatrixWorld(true);
    cam.updateProjectionMatrix();
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;
    const v = new THREE.Vector3();
    for (const p of pts) {
      v.copy(p).project(cam);
      x0 = Math.min(x0, v.x);
      x1 = Math.max(x1, v.x);
      y0 = Math.min(y0, v.y);
      y1 = Math.max(y1, v.y);
    }
    return { x0, x1, y0, y1 };
  };

  const spherical = (pos: THREE.Vector3, target: THREE.Vector3) => new THREE.Spherical().setFromVector3(pos.clone().sub(target));

  const build = () => {
    const portrait = W / H < 1;
    const t = Math.max(0, Math.min(1, (1.3 - W / H) / 0.75));
    const dirW = b2t(data.wide.pos).sub(b2t(data.wide.target)).normalize();
    const dirM = b2t(data.mob.pos).sub(b2t(data.mob.target)).normalize();
    const dir = dirW.clone().lerp(dirM, t).normalize();
    const target = new THREE.Vector3();
    HOME_POINTS.forEach((p) => target.add(p));
    target.multiplyScalar(1 / HOME_POINTS.length);
    const top = Math.min(0.9, o.topLimit());
    const bottom = portrait ? -0.86 : -0.94;
    const side = portrait ? 0.96 : 0.9;
    let lo = 0.5;
    let hi = 12;
    for (let i = 0; i < 40; i++) {
      const d = (lo + hi) / 2;
      const r = project(target.clone().addScaledVector(dir, d), target, HOME_POINTS);
      if (r.x1 - r.x0 <= side * 2 && r.y1 - r.y0 <= top - bottom) hi = d;
      else lo = d;
    }
    const pos = target.clone().addScaledVector(dir, hi);
    const r = project(pos, target, HOME_POINTS);
    const wantCenter = (top + bottom) / 2;
    const offsetY = ((wantCenter - (r.y0 + r.y1) / 2) * H) / 2;
    const sp = spherical(pos, target);
    shots.home = {
      target,
      position: pos,
      offsetY,
      azimuth: [sp.theta - 1.5, sp.theta + 1.5],
      polar: [0.08, 1.52],
      distance: [0.2, hi],
    };

    const fitWidth = (w: number, fill: number) => {
      const vfov = THREE.MathUtils.degToRad(camera.fov);
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * (W / H));
      const dw = w / 2 / (Math.tan(hfov / 2) * fill);
      const dh = (w * 0.66) / 2 / (Math.tan(vfov / 2) * fill);
      return Math.max(dw, dh);
    };
    const section = (center: THREE.Vector3, normal: THREE.Vector3, width: number, fill: number, lift: number): Shot => {
      const d = fitWidth(width, fill);
      const n = normal.clone().add(new THREE.Vector3(0, lift, 0)).normalize();
      const p = center.clone().addScaledVector(n, d);
      const s = spherical(p, center);
      return {
        target: center.clone(),
        position: p,
        offsetY: 0,
        azimuth: [s.theta - 0.3, s.theta + 0.3],
        polar: [Math.max(0.2, s.phi - 0.18), Math.min(1.5, s.phi + 0.14)],
        distance: [d * 0.7, d * 1.12],
      };
    };
    const lapS = screenFrame('lapscreen');
    const miniS = screenFrame('miniscreen');
    shots.projects = section(lapS.center, lapS.normal, lapS.width * 1.08, portrait ? 0.92 : 0.62, 0.08);
    const wideNav = window.matchMedia('(min-width: 900px)').matches;
    const closer = (sh: Shot, k: number) => {
      sh.position.sub(sh.target).multiplyScalar(k).add(sh.target);
      return sh;
    };
    shots.about = section(miniS.center, miniS.normal, miniS.width * 1.1, portrait ? 0.9 : 0.5, 0.12);
    if (wideNav) {
      closer(shots.about, 0.7);
      shots.about.distance[0] *= 0.72 * 0.72;
    }
    else shots.about.distance[0] *= 0.5 / 0.7;
    const note = b2t(data.anchors.notebook);
    {
      const n0 = new THREE.Vector3(0.12, 1.25, 0.75);
      const phi = Math.atan2(Math.hypot(n0.x, n0.z), n0.y) - 0.18;
      const rot = THREE.MathUtils.degToRad(-2.5);
      const n = new THREE.Vector3(Math.sin(phi) * Math.sin(rot), Math.cos(phi), Math.sin(phi) * Math.cos(rot));
      shots.contact = closer(section(note, n, 0.3, portrait ? 0.88 : 0.55, 0), 0.7);
      const sp = spherical(shots.contact.position, shots.contact.target);
      shots.contact.polar = [sp.phi, Math.min(1.5, sp.phi + 0.32)];
      shots.contact.distance[0] *= 0.72 * 0.72;
    }
    {
      const vfov = THREE.MathUtils.degToRad(camera.fov);
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * (W / H));
      const fill = portrait ? 0.96 : 0.84;
      const c = b2t([BOARD.x, BOARD.y, BOARD.z]);
      let d = Math.max(BOARD.w / 2 / (Math.tan(hfov / 2) * fill), BOARD.h / 2 / (Math.tan(vfov / 2) * fill));
      if (portrait) d = Math.min(d, BOARD.h / 2 / (Math.tan(vfov / 2) * 0.66));
      d = Math.min(d, ROOM.x1 - BOARD.x - 0.02);
      const p = c.clone().add(new THREE.Vector3(d, 0, 0));
      const sp = spherical(p, c);
      shots.board = {
        target: c,
        position: p,
        offsetY: 0,
        azimuth: [sp.theta - 0.35, sp.theta + 0.35],
        polar: [sp.phi - 0.3, sp.phi + 0.25],
        distance: [d * 0.55, d],
      };
    }
  };

  const applyLimits = (s: Shot) => {
    controls.minAzimuthAngle = s.azimuth[0];
    controls.maxAzimuthAngle = s.azimuth[1];
    controls.minPolarAngle = s.polar[0];
    controls.maxPolarAngle = s.polar[1];
    controls.minDistance = s.distance[0];
    controls.maxDistance = s.distance[1];
    controls.zoomToCursor = current === 'home';
  };

  const setOffset = (y: number) => {
    view.offsetY = y;
    if (Math.abs(y) < 0.5) camera.clearViewOffset();
    else camera.setViewOffset(W, H, 0, y, W, H);
  };

  const zDir = new THREE.Vector3();
  let zIn: boolean | null = null;
  let zOut: boolean | null = null;
  const zoomState = () => {
    const d = camera.position.distanceTo(controls.target);
    zDir.copy(camera.position).sub(controls.target).normalize();
    const walled = d >= roomLimit(controls.target, zDir) - 0.03;
    const canIn = d > controls.minDistance * 1.02;
    const canOut = d < controls.maxDistance * 0.98 && !walled;
    if (canIn === zIn && canOut === zOut) return;
    zIn = canIn;
    zOut = canOut;
    o.onZoom(canIn, canOut);
  };

  let tween: gsap.core.Tween | gsap.core.Timeline | null = null;
  let syncRadius = () => {};
  const flySp = new THREE.Spherical(1, 0, 0);
  const fly = (to: Shot, dur: number, onDone?: () => void) => {
    const midway = moving && !!tween?.isActive();
    tween?.kill();
    moving = true;
    controls.enabled = false;
    controls.minDistance = 0;
    controls.maxDistance = Infinity;
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;
    const fromPos = camera.position.clone();
    const fromTgt = controls.target.clone();
    const fromOff = view.offsetY;
    const a = spherical(fromPos, fromTgt);
    const b = spherical(to.position, to.target);
    let dTheta = b.theta - a.theta;
    if (dTheta > Math.PI) dTheta -= Math.PI * 2;
    if (dTheta < -Math.PI) dTheta += Math.PI * 2;
    const st = { k: 0 };
    const tgt = new THREE.Vector3();
    const sp = new THREE.Spherical();
    const flyDir = new THREE.Vector3();
    const arc = Math.min(0.25, fromPos.distanceTo(to.position) * 0.12);
    tween = gsap.timeline({
      onComplete: () => {
        moving = false;
        controls.enabled = current !== 'board';
        applyLimits(to);
        if (current === 'board') clampPan();
        syncRadius();
        dirty = true;
        zoomState();
        onDone?.();
      },
    });
    tween.to(st, {
      k: 1,
      duration: reduce ? 0.01 : dur,
      ease: midway ? 'power2.out' : 'power2.inOut',
      onUpdate: () => {
        const k = st.k;
        tgt.lerpVectors(fromTgt, to.target, k);
        sp.radius = THREE.MathUtils.lerp(a.radius, b.radius, k) * (1 + Math.sin(k * Math.PI) * arc);
        sp.phi = THREE.MathUtils.lerp(a.phi, b.phi, k);
        sp.theta = a.theta + dTheta * k;
        sp.radius = Math.min(sp.radius, roomLimit(tgt, flyDir.setFromSpherical(flySp.set(1, sp.phi, sp.theta))));
        controls.target.copy(tgt);
        camera.position.setFromSpherical(sp).add(tgt);
        camera.lookAt(tgt);
        setOffset(THREE.MathUtils.lerp(fromOff, to.offsetY, k));
        dirty = true;
      },
    });
  };

  const resize = () => {
    const r = o.host.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.fov = fovFor(camera.aspect);
    camera.updateProjectionMatrix();
    build();
    if (!moving) {
      const s = shots[current];
      const keep = spherical(camera.position, controls.target);
      const base = spherical(s.position, s.target);
      const ratio = THREE.MathUtils.clamp(keep.radius / Math.max(base.radius, 1e-3), 0, 1);
      controls.target.copy(s.target);
      applyLimits(s);
      const sp = new THREE.Spherical(
        THREE.MathUtils.clamp(base.radius * (isFinite(ratio) && ratio > 0 ? ratio : 1), s.distance[0], s.distance[1]),
        THREE.MathUtils.clamp(keep.phi || base.phi, s.polar[0], s.polar[1]),
        THREE.MathUtils.clamp(keep.theta || base.theta, s.azimuth[0], s.azimuth[1]),
      );
      camera.position.setFromSpherical(sp).add(s.target);
      camera.lookAt(s.target);
      setOffset(s.offsetY);
      zoomState();
      if (current === 'board') clampPan();
    }
    dirty = true;
  };

  const ro = new ResizeObserver(() => resize());
  ro.observe(o.host);
  W = Math.max(1, o.host.clientWidth);
  H = Math.max(1, o.host.clientHeight);
  camera.aspect = W / H;
  camera.fov = fovFor(camera.aspect);
  camera.updateProjectionMatrix();
  renderer.setSize(W, H, false);
  build();
  const start = shots.home;
  camera.position.copy(start.position);
  controls.target.copy(start.target);
  camera.lookAt(start.target);
  setOffset(start.offsetY);
  applyLimits(start);

  controls.addEventListener('change', () => {
    dirty = true;
    zoomState();
  });

  const PAGE = { x: 0.418, y: -0.052, rot: (-2.5 * Math.PI) / 180, w: 0.1468, d: 0.2038 };
  const LINKS = [
    { url: 'mailto:orlando.gal.var.05@gmail.com', icon: 'mail', r: [0.1714, 0.3866, 0.3429, 0.5103] },
    { url: 'https://www.linkedin.com/in/orlandogalvan-dev', icon: 'linkedin', r: [0.3786, 0.3866, 0.5500, 0.5103] },
    { url: 'https://github.com/OrlandoGalvanVargas', icon: 'github', r: [0.5857, 0.3866, 0.7571, 0.5103] },
  ];
  const ICON = { x0: 240, x1: 1060, y0: 750, y1: 990, w: 1400, h: 1940, z: 0.76895, size: 210, cx: [360, 650, 940], cy: 870, ink: '#1d4fa8' };
  const iconCanvas = document.createElement('canvas');
  iconCanvas.width = 2048;
  iconCanvas.height = Math.round((2048 * (ICON.y1 - ICON.y0)) / (ICON.x1 - ICON.x0));
  const iconCtx = iconCanvas.getContext('2d')!;
  const iconTex = new THREE.CanvasTexture(iconCanvas);
  iconTex.colorSpace = THREE.SRGBColorSpace;
  iconTex.anisotropy = maxAniso;
  const k = iconCanvas.width / (ICON.x1 - ICON.x0);
  const slot = (i: number) => ({ x: (ICON.cx[i] - ICON.size / 2 - ICON.x0) * k, y: (ICON.cy - ICON.size / 2 - ICON.y0) * k, s: ICON.size * k });
  const frame = (i: number) => {
    const { x, y, s } = slot(i);
    iconCtx.save();
    iconCtx.strokeStyle = ICON.ink;
    iconCtx.lineWidth = s * 0.06;
    iconCtx.beginPath();
    iconCtx.roundRect(x + s * 0.05, y + s * 0.05, s * 0.9, s * 0.9, s * 0.18);
    iconCtx.stroke();
    iconCtx.restore();
  };
  const tint = (img: CanvasImageSource, s: number) => {
    const c = document.createElement('canvas');
    c.width = c.height = Math.ceil(s);
    const x = c.getContext('2d')!;
    x.drawImage(img, 0, 0, s, s);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = ICON.ink;
    x.fillRect(0, 0, s, s);
    return c;
  };
  const fallback = (i: number) => {
    const { x, y, s } = slot(i);
    iconCtx.save();
    iconCtx.fillStyle = ICON.ink;
    iconCtx.font = `700 ${Math.round(s * (i === 1 ? 0.46 : 0.32))}px system-ui, sans-serif`;
    iconCtx.textAlign = 'center';
    iconCtx.textBaseline = 'middle';
    iconCtx.fillText(i === 1 ? 'in' : '</>', x + s / 2, y + s * 0.53);
    iconCtx.restore();
    iconTex.needsUpdate = true;
  };
  const loadIcon = async (i: number) => {
    frame(i);
    try {
      const r = await fetch(`${o.base}icons/${LINKS[i].icon}.svg`);
      if (!r.ok) throw new Error();
      let svg = await r.text();
      if (!/<svg[^>]*\swidth=/.test(svg)) svg = svg.replace('<svg', '<svg width="512" height="512"');
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      const img = new Image();
      img.src = url;
      await img.decode();
      const { x, y, s } = slot(i);
      const g = s * 0.56;
      iconCtx.drawImage(tint(img, g), x + (s - g) / 2, y + (s - g) / 2, g, g);
      URL.revokeObjectURL(url);
      iconTex.needsUpdate = true;
    } catch {
      fallback(i);
    }
    dirty = true;
  };
  LINKS.forEach((_, i) => void loadIcon(i));
  {
    const cu = (ICON.x0 + ICON.x1) / 2 / ICON.w;
    const cv = (ICON.y0 + ICON.y1) / 2 / ICON.h;
    const lx = (cu - 0.5) * PAGE.w;
    const ly = (0.5 - cv) * PAGE.d;
    const bx = PAGE.x + lx * Math.cos(PAGE.rot) - ly * Math.sin(PAGE.rot);
    const by = PAGE.y + lx * Math.sin(PAGE.rot) + ly * Math.cos(PAGE.rot);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(((ICON.x1 - ICON.x0) / ICON.w) * PAGE.w, ((ICON.y1 - ICON.y0) / ICON.h) * PAGE.d),
      new THREE.MeshBasicMaterial({ map: iconTex, transparent: true, depthWrite: false }),
    );
    plane.rotation.set(-Math.PI / 2, PAGE.rot, 0, 'YXZ');
    plane.position.copy(b2t([bx, by, ICON.z]));
    plane.renderOrder = 1;
    scene.add(plane);
  }
  const BPLANE = { x: -1.2345, w: 1.148, h: 0.848 };
  const boardCenter = b2t([BPLANE.x, -0.8, 1.42]);
  const board = createBoard(renderer, { w: BPLANE.w, h: BPLANE.h }, boardCenter, maxAniso, Math.min(screen.width, screen.height) < 700);
  scene.add(board.mesh);
  let mode: 'draw' | 'move' = 'draw';
  const viewSize = () => {
    const dist = camera.position.distanceTo(controls.target);
    const vh = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    return { vw: (vh * W) / H, vh };
  };
  const reportBoard = () => {
    const { vw } = viewSize();
    const c = shots.board.target;
    const t = controls.target;
    o.onBoard?.({
      pan: vw < BOARD.w - 0.03,
      left: THREE.MathUtils.clamp((c.z + BOARD.w / 2 - (t.z + vw / 2)) / BOARD.w, 0, 1),
      width: Math.min(1, vw / BOARD.w),
    });
  };
  const clampPan = () => {
    const { vw, vh } = viewSize();
    const c = shots.board.target;
    const t = controls.target;
    const mx = Math.max(0, (BOARD.w - vw) / 2 + 0.03);
    const my = Math.max(0, (BOARD.h - vh) / 2 + 0.03);
    const dz = THREE.MathUtils.clamp(t.z, c.z - mx, c.z + mx) - t.z;
    const dy = THREE.MathUtils.clamp(t.y, c.y - my, c.y + my) - t.y;
    t.z += dz;
    t.y += dy;
    camera.position.z += dz;
    camera.position.y += dy;
    dirty = true;
    reportBoard();
  };
  const pan = (dx: number, dy: number) => {
    const k = viewSize().vh / H;
    controls.target.z += dx * k;
    camera.position.z += dx * k;
    controls.target.y += dy * k;
    camera.position.y += dy * k;
    clampPan();
  };
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const linkAt = (cx: number, cy: number) => {
    if (!pageMesh) return null;
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.set(((cx - rect.left) / rect.width) * 2 - 1, -((cy - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObject(pageMesh, false)[0];
    if (!hit) return null;
    const dx = hit.point.x - PAGE.x;
    const dy = -hit.point.z - PAGE.y;
    const c = Math.cos(-PAGE.rot);
    const sn = Math.sin(-PAGE.rot);
    const u = (dx * c - dy * sn) / PAGE.w + 0.5;
    const v = 0.5 - (dx * sn + dy * c) / PAGE.d;
    return LINKS.find((l) => u >= l.r[0] && u <= l.r[2] && v >= l.r[1] && v <= l.r[3]) ?? null;
  };
  let downX = 0;
  let downY = 0;
  let downT = 0;
  let inkId = -1;
  let panId = -1;
  let panX = 0;
  let panY = 0;
  let crect = renderer.domElement.getBoundingClientRect();
  const bpt = { u: 0, v: 0 };
  const bdir = new THREE.Vector3();
  const boardUV = (cx: number, cy: number, inside = true) => {
    bdir.set(((cx - crect.left) / crect.width) * 2 - 1, -((cy - crect.top) / crect.height) * 2 + 1, 0.5).unproject(camera).sub(camera.position);
    if (bdir.x >= -1e-6) return null;
    const t = (boardCenter.x - camera.position.x) / bdir.x;
    bpt.u = 0.5 + (boardCenter.z - (camera.position.z + bdir.z * t)) / BPLANE.w;
    bpt.v = 0.5 + (camera.position.y + bdir.y * t - boardCenter.y) / BPLANE.h;
    if (inside && (bpt.u < 0 || bpt.u > 1 || bpt.v < 0 || bpt.v > 1)) return null;
    return bpt;
  };
  const stopInk = () => {
    if (inkId !== -1) board.end();
    inkId = -1;
    panId = -1;
  };
  renderer.domElement.addEventListener('pointerdown', (e) => {
    downX = e.clientX;
    downY = e.clientY;
    downT = performance.now();
    if (current !== 'board' || moving || inkId !== -1 || panId !== -1) return;
    crect = renderer.domElement.getBoundingClientRect();
    if (mode === 'move' || e.button === 1 || e.button === 2) {
      panId = e.pointerId;
      panX = e.clientX;
      panY = e.clientY;
      if (e.pointerType === 'mouse') renderer.domElement.style.cursor = 'grabbing';
    } else if (e.button === 0) {
      const uv = boardUV(e.clientX, e.clientY);
      if (!uv) return;
      inkId = e.pointerId;
      board.begin(uv);
    } else return;
    renderer.domElement.setPointerCapture(e.pointerId);
  });
  renderer.domElement.addEventListener('contextmenu', (e) => {
    if (current === 'board') e.preventDefault();
  });
  const release = (e: PointerEvent) => {
    if (e.pointerId === inkId) {
      board.end();
      inkId = -1;
    }
    if (e.pointerId === panId) {
      panId = -1;
      if (e.pointerType === 'mouse') renderer.domElement.style.cursor = mode === 'move' ? 'grab' : '';
    }
  };
  renderer.domElement.addEventListener('pointercancel', release);
  const boardAt = (cx: number, cy: number) => {
    if (!boardMesh) return false;
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.set(((cx - rect.left) / rect.width) * 2 - 1, -((cy - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObject(boardMesh, false)[0];
    if (!hit) return false;
    ray.far = hit.distance - 0.005;
    const blocked = ray.intersectObjects(pickables, false).length > 0;
    ray.far = Infinity;
    return !blocked;
  };
  const fanButtonAt = (cx: number, cy: number) => {
    if (!fan || !lmpMesh) return false;
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.set(((cx - rect.left) / rect.width) * 2 - 1, -((cy - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (!fan.near(ray.ray)) return false;
    const hit = ray.intersectObjects(pickables, false)[0];
    return !!hit && hit.object === lmpMesh && hit.point.distanceTo(fan.button) < 0.013;
  };
  renderer.domElement.addEventListener('pointerup', (e) => {
    release(e);
    if (current === 'board') return;
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6 || performance.now() - downT > 500) return;
    if (!moving && fanButtonAt(e.clientX, e.clientY)) {
      fan!.toggle();
      return;
    }
    if (!moving && boardAt(e.clientX, e.clientY)) {
      go('board');
      return;
    }
    const l = linkAt(e.clientX, e.clientY);
    if (!l) return;
    if (l.url.startsWith('mailto:')) window.location.href = l.url;
    else window.open(l.url, '_blank', 'noopener');
  });
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (e.pointerId === inkId) {
      const list = e.getCoalescedEvents?.() ?? [];
      for (const ev of list.length ? list : [e]) {
        const uv = boardUV(ev.clientX, ev.clientY, false);
        if (uv) board.move(uv);
      }
      return;
    }
    if (e.pointerId === panId) {
      pan(e.clientX - panX, e.clientY - panY);
      panX = e.clientX;
      panY = e.clientY;
      return;
    }
    if (e.pointerType !== 'mouse' || e.buttons) return;
    if (current === 'board') {
      renderer.domElement.style.cursor = moving ? '' : mode === 'move' ? 'grab' : boardUV(e.clientX, e.clientY) ? board.cursor() : '';
      return;
    }
    renderer.domElement.style.cursor = linkAt(e.clientX, e.clientY) || (!moving && (fanButtonAt(e.clientX, e.clientY) || boardAt(e.clientX, e.clientY))) ? 'pointer' : '';
  });

  let lastSecond = -1;
  const off = new THREE.Vector3();
  let desired = camera.position.distanceTo(controls.target);
  let lastSet = desired;
  const keepInside = () => {
    off.copy(camera.position).sub(controls.target);
    const r = off.length();
    if (r < 1e-5) return false;
    if (Math.abs(r - lastSet) > 1e-4) desired = r;
    off.multiplyScalar(1 / r);
    const lim = roomLimit(controls.target, off);
    const want = Math.max(controls.minDistance, Math.min(desired, lim));
    const next = want < r ? want : r + (want - r) * 0.2;
    lastSet = next;
    if (Math.abs(next - r) < 1e-5) return false;
    camera.position.copy(controls.target).addScaledVector(off, next);
    return true;
  };
  syncRadius = () => {
    desired = camera.position.distanceTo(controls.target);
    lastSet = desired;
  };
  const ptrs = new Map<number, { x: number; y: number }>();
  let pinched = false;
  let lastGuard = 0;
  const fwd = new THREE.Vector3();
  const guard = (x: number, y: number) => {
    if (current !== 'home' || moving) return;
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.set(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(scene.children, true).find((h) => (h.object as THREE.Mesh).isMesh && h.object.visible);
    const r0 = camera.position.distanceTo(controls.target);
    controls.minDistance = hit ? Math.max(shots.home.distance[0], r0 - (hit.distance - 0.16)) : shots.home.distance[0];
  };
  renderer.domElement.addEventListener('pointerdown', (e) => {
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 2) {
      pinched = true;
      const [a, b] = [...ptrs.values()];
      guard((a.x + b.x) / 2, (a.y + b.y) / 2);
    }
  });
  const dropPtr = (e: PointerEvent) => ptrs.delete(e.pointerId);
  renderer.domElement.addEventListener('pointerup', dropPtr);
  renderer.domElement.addEventListener('pointercancel', dropPtr);
  renderer.domElement.addEventListener(
    'wheel',
    (e) => {
      pinched = true;
      const now = performance.now();
      if (now - lastGuard > 160) {
        lastGuard = now;
        guard(e.clientX, e.clientY);
      }
    },
    { passive: true },
  );
  controls.addEventListener('end', () => {
    if (!pinched || ptrs.size || current !== 'home' || moving) return;
    pinched = false;
    controls.minDistance = shots.home.distance[0];
    camera.getWorldDirection(fwd);
    ray.set(camera.position, fwd);
    const hit = ray.intersectObjects(scene.children, true).find((h) => (h.object as THREE.Mesh).isMesh && h.object.visible && h.distance > 0.05);
    if (!hit) return;
    controls.target.copy(hit.point);
    syncRadius();
    zoomState();
  });

  let lastT = performance.now();
  renderer.setAnimationLoop(() => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    const orbiting = controls.update();
    let changed = orbiting;
    if (fan && fan.update(dt, camera)) changed = true;
    if (lapPhoto.update(camera)) changed = true;
    if (!moving && keepInside()) changed = true;
    const s = Math.floor(Date.now() / 1000);
    if (s !== lastSecond && !moving && !orbiting) {
      lastSecond = s;
      mini.draw();
      if (s % 30 === 0) led.draw();
      dirty = true;
    }
    if (board.render()) dirty = true;
    if (changed && !moving) zoomState();
    if (dirty || changed || moving) {
      renderer.render(scene, camera);
      dirty = false;
    }
  });
  [room, furn, props, zoclo, heroTex, kbdTex, lptTex, lmpTex, nbpTex, wbdTex, crtTex, stkTex].forEach((t) => renderer.initTexture(t));
  renderer.compile(scene, camera);
  renderer.render(scene, camera);

  const gl = renderer.getContext();
  const LITE: Record<string, string> = { props: 'props-m.webp', kbd: 'kbd-m.webp', lpt: 'lpt-m.webp', lmp: 'lmp-m.webp', crt: 'crt-m.webp' };
  let lite = Math.min(screen.width, screen.height) < 700 || maxTex < 4096;
  const outOfMemory = () => {
    let oom = false;
    for (let i = 0; i < 8; i++) {
      const e = gl.getError();
      if (e === gl.NO_ERROR) break;
      if (e === gl.OUT_OF_MEMORY) oom = true;
    }
    return oom;
  };
  const goLite = () => {
    if (lite) return;
    lite = true;
    Object.entries(LITE).forEach(([key, file]) => {
      const mat = mats[key] as THREE.MeshBasicMaterial;
      const old = mat.map;
      loadTex(file).then((t) => {
        scene.traverse((n) => {
          const mm = (n as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined;
          if (mm && mm.map === old) {
            mm.map = t;
            mm.needsUpdate = true;
          }
        });
        old?.dispose();
        dirty = true;
      });
    });
  };
  if (outOfMemory()) goLite();
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    requestAnimationFrame(() => {
      heroGltf.scene.visible = false;
      const env = buildEnv();
      heroGltf.scene.visible = true;
      heroMats.forEach((m) => {
        m.envMap = env.texture;
        m.needsUpdate = true;
      });
      board.restore();
      dirty = true;
      renderer.render(scene, camera);
      if (outOfMemory()) goLite();
    });
  });

  const go = (key: ShotKey, instant = false) => {
    if (key === current && !instant) {
      fly(shots[key], 0.9);
      return;
    }
    stopInk();
    if (!instant) whoosh(key === 'home' ? 'out' : 'in', TRAVEL);
    current = key;
    o.onShot(key);
    if (instant) {
      const s = shots[key];
      controls.target.copy(s.target);
      camera.position.copy(s.position);
      camera.lookAt(s.target);
      setOffset(s.offsetY);
      applyLimits(s);
      dirty = true;
      zoomState();
      return;
    }
    fly(shots[key], TRAVEL);
  };

  const intro = () => {
    const s = shots[current];
    const sp = spherical(s.position, s.target);
    sp.phi = Math.max(0.3, sp.phi - 0.14);
    sp.theta -= 0.2;
    const dir = new THREE.Vector3().setFromSpherical(new THREE.Spherical(1, sp.phi, sp.theta));
    sp.radius = Math.min(sp.radius * (current === 'home' ? 1.25 : 1.2), roomLimit(s.target, dir));
    controls.target.copy(s.target);
    camera.position.setFromSpherical(sp).add(s.target);
    camera.lookAt(s.target);
    setOffset(s.offsetY);
    dirty = true;
    fly(s, reduce ? 0.01 : 2.4);
  };

  const homeZoom = (dir: 1 | -1) => {
    const s = shots.home;
    const fromPos = camera.position.clone();
    const fromTgt = controls.target.clone();
    const fromOff = view.offsetY;
    const toPos = new THREE.Vector3();
    const toTgt = new THREE.Vector3();
    let toOff = fromOff;
    if (dir > 0) {
      ndc.set(0, 0);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(scene.children, true).find((h) => (h.object as THREE.Mesh).isMesh && h.object.visible);
      const aim = hit ? hit.point : ray.ray.at(fromPos.distanceTo(fromTgt), new THREE.Vector3());
      const d = fromPos.distanceTo(aim);
      const nd = Math.max(s.distance[0], d * 0.62);
      toTgt.copy(aim);
      toPos.copy(aim).addScaledVector(ray.ray.direction, -nd);
      toOff = 0;
    } else {
      const off = fromPos.clone().sub(fromTgt);
      const d = off.length();
      toTgt.copy(fromTgt);
      toPos.copy(fromTgt).addScaledVector(off.normalize(), Math.min(s.distance[1], d * 1.6));
      if (toPos.distanceTo(toTgt) >= s.distance[1] * 0.98) {
        toTgt.copy(s.target);
        toPos.copy(s.position);
        toOff = s.offsetY;
      }
    }
    const st = { k: 0 };
    tween?.kill();
    moving = true;
    controls.enabled = false;
    tween = gsap.to(st, {
      k: 1,
      duration: reduce ? 0.01 : 0.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        controls.target.lerpVectors(fromTgt, toTgt, st.k);
        camera.position.lerpVectors(fromPos, toPos, st.k);
        camera.lookAt(controls.target);
        setOffset(THREE.MathUtils.lerp(fromOff, toOff, st.k));
        dirty = true;
      },
      onComplete: () => {
        moving = false;
        controls.enabled = true;
        syncRadius();
        dirty = true;
        zoomState();
      },
    });
  };

  const zoom = (dir: 1 | -1) => {
    if (moving) return;
    if (current === 'home') return homeZoom(dir);
    const s = shots[current];
    const sp = spherical(camera.position, controls.target);
    let next = THREE.MathUtils.clamp(sp.radius * (dir > 0 ? 0.72 : 1.38), s.distance[0], s.distance[1]);
    if (dir > 0 && next < s.distance[0] * 1.12) next = s.distance[0];
    if (dir < 0 && next > s.distance[1] * 0.9) next = s.distance[1];
    const state = { r: sp.radius };
    tween?.kill();
    tween = gsap.to(state, {
      r: next,
      duration: reduce ? 0.01 : 0.7,
      ease: 'power2.out',
      onUpdate: () => {
        sp.radius = state.r;
        camera.position.setFromSpherical(sp).add(controls.target);
        syncRadius();
        if (current === 'board') clampPan();
        dirty = true;
        zoomState();
      },
    });
  };

  const reset = () => fly(shots[current], 1.1);

  zoomState();
  const boardApi = {
    tool: (t: BoardTool) => board.setTool(t),
    color: (c: string) => board.setColor(c),
    mode: (m: 'draw' | 'move') => {
      stopInk();
      mode = m;
    },
  };
  return { go, intro, zoom, reset, current: () => current, busy: () => moving, board: boardApi };
}
