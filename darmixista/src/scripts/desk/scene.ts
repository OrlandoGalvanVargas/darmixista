import * as THREE from 'three';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { laptopScreen, ledScreen, miniScreen, type ScreenText } from './screens';

export type ShotKey = 'home' | 'projects' | 'about' | 'contact';
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
}

export interface DeskHandle {
  go: (key: ShotKey, instant?: boolean) => void;
  intro: () => void;
  zoom: (dir: 1 | -1) => void;
  reset: () => void;
  current: () => ShotKey;
  busy: () => boolean;
}

const FOV = 40;
const fovFor = (aspect: number) => Math.min(60, Math.max(FOV, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(21)) / aspect))));
const TRAVEL = 1.6;
const b2t = (v: number[]) => new THREE.Vector3(v[0], v[2], -v[1]);
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
  const [data, gltf, heroGltf, room, furn, props, zoclo, heroTex, kbdTex, lptTex, lmpTex] = await Promise.all([
    fetch(`${o.base}scene.json`).then((r) => r.json() as Promise<SceneData>),
    new Promise<{ scene: THREE.Group }>((resolve, reject) => gltfLoader.load(`${o.base}desk.glb`, (g) => resolve(g), track('glb'), reject)),
    new Promise<{ scene: THREE.Group }>((resolve, reject) => gltfLoader.load(`${o.base}hero.glb`, (g) => resolve(g), track('hero'), reject)),
    loadTex('room.webp'),
    loadTex('furn.webp'),
    loadTex(Math.min(screen.width, screen.height) < 700 || maxTex < 4096 ? 'props-m.webp' : 'props.webp'),
    loadTex('base.webp'),
    loadTex('hero.webp'),
    loadTex('kbd.webp'),
    loadTex('lpt.webp'),
    loadTex('lmp.webp'),
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
  };
  const lap = laptopScreen(maxAniso);
  const mini = miniScreen(o.screen, maxAniso);
  const led = ledScreen(maxAniso);
  mats.lapscreen = new THREE.MeshBasicMaterial({ map: lap, color: new THREE.Color(0.93, 0.93, 0.93) });
  mats.miniscreen = new THREE.MeshBasicMaterial({ map: mini.texture, color: new THREE.Color(0.95, 0.95, 0.95) });
  mats.lampled = new THREE.MeshBasicMaterial({ map: led.texture });
  gltf.scene.traverse((n) => {
    const m = n as THREE.Mesh;
    if (!m.isMesh) return;
    const key = Object.keys(mats).find((k) => m.name.startsWith(k));
    m.material = key ? mats[key] : mats.props;
    m.matrixAutoUpdate = false;
    m.updateMatrix();
  });
  scene.add(gltf.scene);
  scene.updateMatrixWorld(true);

  const cubeTarget = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType });
  const cubeCam = new THREE.CubeCamera(0.02, 20, cubeTarget);
  cubeCam.position.copy(b2t([-0.15, -0.75, 1.05]));
  scene.add(cubeCam);
  cubeCam.update(renderer, scene);
  scene.remove(cubeCam);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromCubemap(cubeTarget.texture);
  pmrem.dispose();
  cubeTarget.dispose();
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
      azimuth: [sp.theta - 0.62, sp.theta + 0.62],
      polar: [Math.max(0.35, sp.phi - 0.42), Math.min(1.42, sp.phi + 0.2)],
      distance: [hi * 0.36, hi],
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
    shots.about = section(miniS.center, miniS.normal, miniS.width * 1.1, portrait ? 0.9 : 0.5, 0.12);
    const note = b2t(data.anchors.notebook);
    shots.contact = section(note, new THREE.Vector3(0.12, 1.25, 0.75), 0.3, portrait ? 0.88 : 0.55, 0);
  };

  const applyLimits = (s: Shot) => {
    controls.minAzimuthAngle = s.azimuth[0];
    controls.maxAzimuthAngle = s.azimuth[1];
    controls.minPolarAngle = s.polar[0];
    controls.maxPolarAngle = s.polar[1];
    controls.minDistance = s.distance[0];
    controls.maxDistance = s.distance[1];
  };

  const setOffset = (y: number) => {
    view.offsetY = y;
    if (Math.abs(y) < 0.5) camera.clearViewOffset();
    else camera.setViewOffset(W, H, 0, y, W, H);
  };

  const zoomState = () => {
    const d = camera.position.distanceTo(controls.target);
    o.onZoom(d > controls.minDistance * 1.02, d < controls.maxDistance * 0.98);
  };

  let tween: gsap.core.Timeline | null = null;
  let syncRadius = () => {};
  const fly = (to: Shot, dur: number, onDone?: () => void) => {
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
    const arc = Math.min(0.25, fromPos.distanceTo(to.position) * 0.12);
    tween = gsap.timeline({
      onComplete: () => {
        moving = false;
        controls.enabled = true;
        applyLimits(to);
        syncRadius();
        dirty = true;
        zoomState();
        onDone?.();
      },
    });
    tween.to(st, {
      k: 1,
      duration: reduce ? 0.01 : dur,
      ease: 'power2.inOut',
      onUpdate: () => {
        const k = st.k;
        tgt.lerpVectors(fromTgt, to.target, k);
        sp.radius = THREE.MathUtils.lerp(a.radius, b.radius, k) * (1 + Math.sin(k * Math.PI) * arc);
        sp.phi = THREE.MathUtils.lerp(a.phi, b.phi, k);
        sp.theta = a.theta + dTheta * k;
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
  renderer.setAnimationLoop(() => {
    let changed = controls.update();
    if (!moving && keepInside()) changed = true;
    const s = Math.floor(Date.now() / 1000);
    if (s !== lastSecond) {
      lastSecond = s;
      mini.draw();
      if (s % 30 === 0) led.draw();
      dirty = true;
    }
    if (dirty || changed || moving) {
      renderer.render(scene, camera);
      dirty = false;
    }
  });
  renderer.compile(scene, camera);
  renderer.render(scene, camera);

  const go = (key: ShotKey, instant = false) => {
    if (key === current && !instant) {
      fly(shots[key], 0.9);
      return;
    }
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

  const zoom = (dir: 1 | -1) => {
    if (moving) return;
    const s = shots[current];
    const sp = spherical(camera.position, controls.target);
    const next = THREE.MathUtils.clamp(sp.radius * (dir > 0 ? 0.72 : 1.38), s.distance[0], s.distance[1]);
    const state = { r: sp.radius };
    gsap.to(state, {
      r: next,
      duration: reduce ? 0.01 : 0.7,
      ease: 'power2.out',
      onUpdate: () => {
        sp.radius = state.r;
        camera.position.setFromSpherical(sp).add(controls.target);
        dirty = true;
        zoomState();
      },
    });
  };

  const reset = () => fly(shots[current], 1.1);

  zoomState();
  return { go, intro, zoom, reset, current: () => current, busy: () => moving };
}
