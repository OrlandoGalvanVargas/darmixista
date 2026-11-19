import { useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  PORTAL_HOLE,
  SCENE_READY,
  SITE_LOADED,
  STAGE_CHANGE,
  getStageFx,
  isSiteLoaded,
  readCurrentPose,
} from '../../lib/stage-events';
import {
  createBandGeometry,
  createBrushedTexture,
  createFinish,
  createGlowMaterial,
  createGlowTexture,
  createInlayGeometry,
  type BandProfile,
  type Finish,
} from './materials';

const BAND = { width: 0.34, thickness: 0.08, bevel: 0.022 };

interface RingSpec {
  profile: BandProfile;
  body: Finish;
  inlay?: Finish;
  speed: number;
  start: number;
}

const RINGS: readonly RingSpec[] = [
  {
    profile: { radius: 1.62, ...BAND, channel: { width: 0.2, depth: 0.018 } },
    body: 'polished',
    inlay: 'black-gloss',
    speed: 0.34,
    start: 0.6,
  },
  {
    profile: { radius: 1.27, ...BAND, channel: { width: 0.22, depth: 0.016, groove: 0.03 } },
    body: 'black-gloss',
    inlay: 'gunmetal',
    speed: -0.46,
    start: 1.1,
  },
  {
    profile: { radius: 0.93, ...BAND, channel: { width: 0.05, depth: 0.014 } },
    body: 'brushed',
    inlay: 'black-gloss',
    speed: 0.6,
    start: 2.0,
  },
];

const OUTER_DIAMETER = (RINGS[0].profile.radius + BAND.thickness) * 2;

const DRAG = {
  impulse: 0.014,
  maxSpin: 9,
  friction: 1.6,
  boost: 0.3,
};

const BASE_TILT = { x: 0.32, y: -0.25, z: 0.38 };

const HOLD = { spin: 2.4, tumbleX: 0.9, tumbleY: 1.4 };

interface Pose {
  x: number;
  y: number;
  s: number;
}

const PORTAL_MARGIN = 1.12;

const nearestFlat = (angle: number) => Math.round(angle / Math.PI) * Math.PI;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const HERO_STACK_QUERY = '(max-aspect-ratio: 20/23) and (max-width: 1099px)';
const SHORT_HEIGHT = 520;

function heroPose(vw: number, vh: number, pxW: number, pxH: number, stacked: boolean): Pose {
  const toWorld = vh / pxH;
  let diameterPx = Math.min(pxH * 0.56, pxW * 0.4);
  let centerPx = pxH * 0.47;
  if (stacked) {
    diameterPx = Math.min(pxW * 0.78, pxH * 0.4);
    centerPx = pxH * 0.44;
  } else if (pxH < SHORT_HEIGHT) {
    diameterPx = Math.min(pxH * 0.46, pxW * 0.4);
    centerPx = pxH * 0.5;
  }
  return { x: 0, y: (pxH / 2 - centerPx) * toWorld, s: (diameterPx * toWorld) / OUTER_DIAMETER };
}

function backgroundPose(vw: number, vh: number): Pose {
  const diameter = Math.min(vh * 0.92, vw * 1.1);
  return { x: 0, y: 0, s: diameter / OUTER_DIAMETER };
}

interface BandProps {
  part: { body: THREE.BufferGeometry; inlay: THREE.BufferGeometry | null };
  material: { body: THREE.Material; inlay: THREE.Material | null };
  rotation: [number, number, number];
}

function Band({ part, material, rotation }: BandProps) {
  return (
    <group rotation={rotation}>
      <mesh geometry={part.body} material={material.body} />
      {part.inlay && material.inlay && <mesh geometry={part.inlay} material={material.inlay} />}
    </group>
  );
}

export function Rings() {
  const placement = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const gimbal0 = useRef<THREE.Group>(null);
  const gimbal1 = useRef<THREE.Group>(null);
  const gimbal2 = useRef<THREE.Group>(null);

  const anim = useRef({ mix: readCurrentPose() === 'background' ? 1 : 0, intro: 0 });
  const pointer = useRef({ x: 0, y: 0, px: -1, py: -1 });
  const stacked = useRef(false);
  const screenCircle = useRef({ cx: 0, cy: 0, r: 0 });
  const motion = useRef({ vx: 0, vy: 0, hover: 0, press: 0, hovered: false, dragging: false, lastX: 0, lastY: 0 });
  const announcedReady = useRef(false);
  const fx = useRef(getStageFx());
  const acc = useRef({ g0: RINGS[0].start, g1: RINGS[1].start, g2: RINGS[2].start, sx: 0, sy: 0, tx: BASE_TILT.x, ty: BASE_TILT.y });

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const brushed = useMemo(() => createBrushedTexture(), []);
  const parts = useMemo(
    () =>
      RINGS.map((r) => ({
        body: createBandGeometry(r.profile),
        inlay: r.inlay ? createInlayGeometry(r.profile) : null,
      })),
    [],
  );
  const materials = useMemo(
    () =>
      RINGS.map((r) => ({
        body: createFinish(r.body, brushed),
        inlay: r.inlay ? createFinish(r.inlay, brushed) : null,
      })),
    [brushed],
  );
  const allMaterials = useMemo(
    () => materials.flatMap((m) => (m.inlay ? [m.body, m.inlay] : [m.body])),
    [materials],
  );
  const baseGlow = useMemo(() => allMaterials.map((m) => m.envMapIntensity), [allMaterials]);
  const glow = useMemo(() => {
    const floor = createGlowTexture('rgba(74,222,128,0.72)', 'rgba(34,197,94,0.28)');
    return {
      floorTex: floor,
      floor: createGlowMaterial(floor, 1),
      plane: new THREE.PlaneGeometry(1, 1),
    };
  }, []);

  useEffect(
    () => () => {
      parts.forEach((g) => {
        g.body.dispose();
        g.inlay?.dispose();
      });
      allMaterials.forEach((m) => m.dispose());
      brushed.dispose();
      glow.floor.dispose();
      glow.floorTex.dispose();
      glow.plane.dispose();
    },
    [parts, allMaterials, brushed],
  );

  useEffect(() => {
    const state = anim.current;
    let intro: gsap.core.Tween | null = null;
    const startIntro = () => {
      intro = gsap.to(state, { intro: 1, duration: reducedMotion ? 0.6 : 2.6, ease: 'expo.out' });
    };
    if (isSiteLoaded()) startIntro();
    else window.addEventListener(SITE_LOADED, startIntro, { once: true });

    const onChange = (e: WindowEventMap['darmixista:stage-change']) => {
      gsap.to(state, {
        mix: e.detail.pose === 'background' ? 1 : 0,
        duration: reducedMotion ? 0.4 : 1.4,
        ease: 'power3.inOut',
        overwrite: 'auto',
      });
    };
    window.addEventListener(STAGE_CHANGE, onChange);

    const stackQuery = window.matchMedia(HERO_STACK_QUERY);
    const syncStack = () => {
      stacked.current = stackQuery.matches;
    };
    syncStack();
    stackQuery.addEventListener('change', syncStack);

    return () => {
      intro?.kill();
      gsap.killTweensOf(state);
      window.removeEventListener(SITE_LOADED, startIntro);
      window.removeEventListener(STAGE_CHANGE, onChange);
      stackQuery.removeEventListener('change', syncStack);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const root = document.documentElement;
    const m = motion.current;

    const interactive = () =>
      isSiteLoaded() &&
      root.dataset.currentSection === 'home' &&
      root.dataset.menu !== 'open' &&
      anim.current.mix < 0.02;

    const isOverRings = (x: number, y: number) => {
      const c = screenCircle.current;
      return Math.hypot(x - c.cx, y - c.cy) <= c.r * 1.02;
    };
    const blockedTarget = (t: EventTarget | null) =>
      !!(t as Element | null)?.closest?.('a, button, input, textarea, [data-mobile-menu]');

    const setHover = (value: boolean) => {
      if (m.hovered === value) return;
      m.hovered = value;
      if (value) root.dataset.ringsHover = 'true';
      else delete root.dataset.ringsHover;
    };

    const begin = (x: number, y: number) => {
      m.dragging = true;
      m.lastX = x;
      m.lastY = y;
      root.dataset.ringsDrag = 'true';
    };
    const move = (x: number, y: number) => {
      const dx = x - m.lastX;
      const dy = y - m.lastY;
      m.lastX = x;
      m.lastY = y;
      m.vy = THREE.MathUtils.clamp(m.vy + dx * DRAG.impulse, -DRAG.maxSpin, DRAG.maxSpin);
      m.vx = THREE.MathUtils.clamp(m.vx + dy * DRAG.impulse, -DRAG.maxSpin, DRAG.maxSpin);
    };
    const end = () => {
      if (!m.dragging) return;
      m.dragging = false;
      delete root.dataset.ringsDrag;
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      if (e.pointerType === 'touch') return;
      if (m.dragging) move(e.clientX, e.clientY);
      else setHover(interactive() && !blockedTarget(e.target) && isOverRings(e.clientX, e.clientY));
    };
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      if (!interactive() || blockedTarget(e.target) || !isOverRings(e.clientX, e.clientY)) return;
      e.preventDefault();
      begin(e.clientX, e.clientY);
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (e.touches.length !== 1 || !interactive() || blockedTarget(e.target)) return;
      if (isOverRings(t.clientX, t.clientY)) begin(t.clientX, t.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (m.dragging) move(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onSectionChange = () => {
      end();
      setHover(false);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    window.addEventListener('blur', end);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', end);
    window.addEventListener('touchcancel', end);
    window.addEventListener(STAGE_CHANGE, onSectionChange);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      window.removeEventListener('blur', end);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', end);
      window.removeEventListener('touchcancel', end);
      window.removeEventListener(STAGE_CHANGE, onSectionChange);
      end();
      setHover(false);
    };
  }, []);

  useFrame((frame, rawDelta) => {
    if (!announcedReady.current) {
      announcedReady.current = true;
      document.documentElement.dataset.scene = 'ready';
      window.dispatchEvent(new Event(SCENE_READY));
    }

    const dt = Math.min(rawDelta, 1 / 20);
    const { viewport, size } = frame;
    const state = anim.current;
    const mo = motion.current;
    const g = [gimbal0.current, gimbal1.current, gimbal2.current];
    if (!placement.current || !tilt.current || !spin.current || g.some((x) => !x)) return;

    const a = heroPose(viewport.width, viewport.height, size.width, size.height, stacked.current);
    const b = backgroundPose(viewport.width, viewport.height);
    const m = state.mix;
    const f = fx.current;
    const p = f.portal;
    const toPx = size.height / viewport.height;
    mo.hover = THREE.MathUtils.damp(mo.hover, mo.hovered || mo.dragging ? 1 : 0, 6, dt);
    let x = THREE.MathUtils.lerp(a.x, b.x, m);
    let y = THREE.MathUtils.lerp(a.y, b.y, m);
    let scale =
      THREE.MathUtils.lerp(a.s, b.s, m) * (0.55 + 0.45 * state.intro) * (1 + 0.035 * mo.hover);
    let face = 0;
    if (p > 0 && p < 1) {
      if (p < 0.5) {
        const k = easeInOut(p / 0.5);
        const peakPx = (Math.hypot(size.width, size.height) / 2) * PORTAL_MARGIN / PORTAL_HOLE;
        const basePx = (OUTER_DIAMETER / 2) * scale * toPx;
        scale *= THREE.MathUtils.lerp(1, peakPx / basePx, k);
        x = THREE.MathUtils.lerp(x, 0, k);
        y = THREE.MathUtils.lerp(y, 0, k);
        face = easeOut(Math.min(1, p / 0.3));
      } else {
        const k = easeOut((p - 0.5) / 0.5);
        scale *= k;
        face = 1 - k;
      }
    }
    placement.current.position.set(x, y, 0);
    placement.current.scale.setScalar(Math.max(scale, 0.0001));

    screenCircle.current.cx = size.width / 2 + x * toPx;
    screenCircle.current.cy = size.height / 2 - y * toPx;
    screenCircle.current.r = (OUTER_DIAMETER / 2) * scale * toPx;
    f.cx = screenCircle.current.cx;
    f.cy = screenCircle.current.cy;
    f.r = screenCircle.current.r;

    const dim = THREE.MathUtils.lerp(1, 0.25, m);
    allMaterials.forEach((mat, n) => {
      mat.envMapIntensity = baseGlow[n] * dim;
    });
    const lightFade = (1 - face) * THREE.MathUtils.lerp(1, 0.3, m) * state.intro;
    glow.floor.opacity = 0.85 * lightFade;

    const friction = mo.dragging ? 0.6 : DRAG.friction + m * 6;
    const decay = Math.exp(-friction * dt);
    mo.vx *= decay;
    mo.vy *= decay;
    const r = acc.current;
    r.sx += mo.vx * dt;
    r.sy += mo.vy * dt;

    mo.press = THREE.MathUtils.damp(mo.press, mo.dragging && !reducedMotion ? 1 : 0, mo.dragging ? 2.2 : 1.4, dt);
    r.sx += HOLD.tumbleX * mo.press * dt;
    r.sy += HOLD.tumbleY * mo.press * dt;
    const freeSpin = Math.min(Math.hypot(mo.vx, mo.vy) * DRAG.boost, 3);
    const speed =
      (reducedMotion ? 0.25 : 1) * (1 - 0.4 * m) * (1 + freeSpin + 0.25 * mo.hover + HOLD.spin * mo.press);
    r.g0 += RINGS[0].speed * dt * speed;
    r.g1 += RINGS[1].speed * dt * speed;
    r.g2 += RINGS[2].speed * dt * speed;

    const follow = 1 - m;
    r.tx = THREE.MathUtils.damp(r.tx, BASE_TILT.x + pointer.current.y * 0.18 * follow, 2.5, dt);
    r.ty = THREE.MathUtils.damp(r.ty, BASE_TILT.y + pointer.current.x * 0.28 * follow, 2.5, dt);

    const flat = (v: number) => THREE.MathUtils.lerp(v, nearestFlat(v), face);
    spin.current.rotation.x = flat(r.sx);
    spin.current.rotation.y = flat(r.sy);
    g[0]!.rotation.y = flat(r.g0);
    g[1]!.rotation.x = flat(r.g1);
    g[2]!.rotation.y = flat(r.g2);
    tilt.current.rotation.x = flat(r.tx);
    tilt.current.rotation.y = flat(r.ty);
    tilt.current.rotation.z = BASE_TILT.z + (1 - state.intro) * 1.4;
  });

  const faceCamera: [number, number, number] = [Math.PI / 2, 0, 0];

  return (
    <group ref={placement}>
      <mesh geometry={glow.plane} material={glow.floor} position={[0, -OUTER_DIAMETER * 0.6, 0]} scale={[OUTER_DIAMETER * 0.7, OUTER_DIAMETER * 0.11, 1]} renderOrder={-1} />
      <group ref={tilt}>
        <group ref={spin}>
          <group ref={gimbal0} rotation={[0, RINGS[0].start, 0]}>
            <Band part={parts[0]} material={materials[0]} rotation={faceCamera} />
            <group ref={gimbal1} rotation={[RINGS[1].start, 0, 0]}>
              <Band part={parts[1]} material={materials[1]} rotation={faceCamera} />
              <group ref={gimbal2} rotation={[0, RINGS[2].start, 0]}>
                <Band part={parts[2]} material={materials[2]} rotation={faceCamera} />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
