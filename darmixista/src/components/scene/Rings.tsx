import { useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  SCENE_READY,
  SITE_LOADED,
  STAGE_CHANGE,
  isSiteLoaded,
  readCurrentPose,
} from '../../lib/stage-events';
import { createBandGeometry, createBrushedTexture } from './materials';

/* ──────────────────────────────────────────────
   Configuración de los anillos (ajústala libremente)
   Los tres están anidados como un giroscopio: cada uno gira
   sobre un eje distinto dentro del anterior, así el conjunto
   rota "como una esfera" sin que las bandas se atraviesen.
   ────────────────────────────────────────────── */
const BAND = { width: 0.34, thickness: 0.075 };

const RINGS = [
  // exterior: acero cepillado claro
  { radius: 1.62, color: '#d4d7db', roughness: 0.34, clearcoat: 0.25, speed: 0.26, start: 0.6 },
  // medio: titanio, un poco más oscuro y satinado
  { radius: 1.27, color: '#a4a9b0', roughness: 0.42, clearcoat: 0.15, speed: -0.36, start: 1.1 },
  // interior: acero pulido, el más brillante
  { radius: 0.93, color: '#e6e8eb', roughness: 0.26, clearcoat: 0.4, speed: 0.47, start: 2.0 },
] as const;

const OUTER_DIAMETER = (RINGS[0].radius + BAND.thickness) * 2;
const CONTAINER_MAX = 1400; // mismo max-width del layout, en px
const MOBILE_BP = 768;

/** Interacción en el Hero: arrastrar para girar (solo en la primera sección) */
const DRAG = {
  /** Impulso por píxel arrastrado (rad/s) */
  impulse: 0.014,
  /** Velocidad máxima del giro libre (rad/s) */
  maxSpin: 9,
  /** Qué tan rápido se frena al soltar (mayor = frena antes) */
  friction: 1.6,
  /** Cuánto se aceleran los giros propios de cada anillo mientras giran libres */
  boost: 0.3,
};

/** Inclinación base para que el conjunto nunca se vea "de frente" plano */
const BASE_TILT = { x: 0.32, y: -0.25, z: 0.38 };

interface Pose {
  x: number;
  y: number;
  s: number;
}

/** Espacio reservado abajo para el contador de sección (px) */
const HUD_SPACE = 48;

/**
 * Posición en el Hero: a la derecha en escritorio; en móvil, centrados en el
 * espacio libre real que queda debajo del texto (`contentBottom`, en px).
 */
function heroPose(vw: number, vh: number, pxW: number, pxH: number, contentBottom: number): Pose {
  if (pxW < MOBILE_BP) {
    const toWorld = vh / pxH;
    const top = contentBottom + 20;
    const bottom = pxH - HUD_SPACE;
    const diameterPx = Math.max(130, Math.min(pxW * 0.68, bottom - top, pxH * 0.34));
    const centerPx = Math.max(top + diameterPx / 2, (top + bottom) / 2);
    return {
      x: 0,
      y: (pxH / 2 - centerPx) * toWorld,
      s: (diameterPx * toWorld) / OUTER_DIAMETER,
    };
  }
  const containerRatio = Math.min(pxW, CONTAINER_MAX) / pxW;
  const diameter = Math.min(vh * 0.64, vw * containerRatio * 0.42);
  return { x: vw * containerRatio * 0.25, y: 0, s: diameter / OUTER_DIAMETER };
}

/** Posición como fondo: centrados y grandes */
function backgroundPose(vw: number, vh: number): Pose {
  const diameter = Math.min(vh * 0.92, vw * 1.1);
  return { x: 0, y: 0, s: diameter / OUTER_DIAMETER };
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
  const heroBottom = useRef(0); // borde inferior del texto del Hero, en px
  /** Círculo que ocupan los anillos en pantalla (px), para saber si el puntero está encima */
  const screenCircle = useRef({ cx: 0, cy: 0, r: 0 });
  const motion = useRef({ vx: 0, vy: 0, hover: 0, hovered: false, dragging: false, lastX: 0, lastY: 0 });
  const announcedReady = useRef(false);

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const brushed = useMemo(() => createBrushedTexture(), []);
  const geometries = useMemo(
    () => RINGS.map((r) => createBandGeometry(r.radius, BAND.width, BAND.thickness)),
    [],
  );
  const materials = useMemo(
    () =>
      RINGS.map(
        (r) =>
          new THREE.MeshPhysicalMaterial({
            color: r.color,
            metalness: 1,
            roughness: r.roughness,
            roughnessMap: brushed,
            anisotropy: 0.6, // estira el reflejo a lo largo de la banda: look de metal cepillado
            clearcoat: r.clearcoat,
            clearcoatRoughness: 0.2,
            envMapIntensity: 1.2,
          }),
      ),
    [brushed],
  );

  useEffect(
    () => () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      brushed.dispose();
    },
    [geometries, materials, brushed],
  );

  /* ── Entrada (tras la pantalla de carga) y cambios de sección ── */
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

    // Mide dónde termina el texto del Hero (cambia con el tamaño de la pantalla y las fuentes)
    const heroContent = document.querySelector<HTMLElement>('[data-hero-content]');
    const measure = () => {
      if (!heroContent) return;
      const section = heroContent.closest<HTMLElement>('[data-section]');
      // offsetTop no se ve afectado por la escala de las transiciones
      heroBottom.current = heroContent.offsetTop + heroContent.offsetHeight + (section?.offsetTop ?? 0);
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    if (heroContent) resizeObserver.observe(heroContent);
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);

    return () => {
      intro?.kill();
      gsap.killTweensOf(state);
      window.removeEventListener(SITE_LOADED, startIntro);
      window.removeEventListener(STAGE_CHANGE, onChange);
      resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [reducedMotion]);

  /* ── Interacción: hover + arrastrar para girar (solo en el Hero) ── */
  useEffect(() => {
    const root = document.documentElement;
    const m = motion.current;

    /** Los anillos solo responden en el Hero, ya cargado, sin menú abierto y sin transición en curso */
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

    // Mouse / lápiz
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
      e.preventDefault(); // evita seleccionar texto mientras se arrastra
      begin(e.clientX, e.clientY);
    };

    // Touch (eventos touch: no se cancelan aunque el navegador intente desplazar)
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
    // Avisa a la pantalla de carga en cuanto se pinta el primer frame
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

    // Posición y escala: mezcla entre la pose del Hero y la de fondo
    const a = heroPose(viewport.width, viewport.height, size.width, size.height, heroBottom.current);
    const b = backgroundPose(viewport.width, viewport.height);
    const m = state.mix;
    const x = THREE.MathUtils.lerp(a.x, b.x, m);
    const y = THREE.MathUtils.lerp(a.y, b.y, m);
    mo.hover = THREE.MathUtils.damp(mo.hover, mo.hovered || mo.dragging ? 1 : 0, 6, dt);
    const scale =
      THREE.MathUtils.lerp(a.s, b.s, m) * (0.55 + 0.45 * state.intro) * (1 + 0.035 * mo.hover);
    placement.current.position.set(x, y, 0);
    placement.current.scale.setScalar(scale);

    // Círculo en pantalla para detectar el puntero (px)
    const toPx = size.height / viewport.height;
    screenCircle.current.cx = size.width / 2 + x * toPx;
    screenCircle.current.cy = size.height / 2 - y * toPx;
    screenCircle.current.r = (OUTER_DIAMETER / 2) * scale * toPx;

    // Giro libre por arrastre: se frena solo al soltar; en el fondo se apaga del todo
    const friction = mo.dragging ? 0.6 : DRAG.friction + m * 6;
    const decay = Math.exp(-friction * dt);
    mo.vx *= decay;
    mo.vy *= decay;
    spin.current.rotation.x += mo.vx * dt;
    spin.current.rotation.y += mo.vy * dt;

    // Giro tipo giroscopio (más lento de fondo; más rápido mientras gira libre o con hover)
    const freeSpin = Math.min(Math.hypot(mo.vx, mo.vy) * DRAG.boost, 3);
    const speed = (reducedMotion ? 0.25 : 1) * (1 - 0.4 * m) * (1 + freeSpin + 0.25 * mo.hover);
    g[0]!.rotation.y += RINGS[0].speed * dt * speed;
    g[1]!.rotation.x += RINGS[1].speed * dt * speed;
    g[2]!.rotation.y += RINGS[2].speed * dt * speed;

    // Inclinación suave siguiendo el puntero: solo en el Hero (de fondo no reacciona a nada)
    const follow = 1 - m;
    tilt.current.rotation.x = THREE.MathUtils.damp(
      tilt.current.rotation.x,
      BASE_TILT.x + pointer.current.y * 0.18 * follow,
      2.5,
      dt,
    );
    tilt.current.rotation.y = THREE.MathUtils.damp(
      tilt.current.rotation.y,
      BASE_TILT.y + pointer.current.x * 0.28 * follow,
      2.5,
      dt,
    );
    tilt.current.rotation.z = BASE_TILT.z + (1 - state.intro) * 1.4;
  });

  // Rotación [π/2,0,0]: el torno genera el anillo en el plano XZ; así queda de frente (plano XY)
  const faceCamera: [number, number, number] = [Math.PI / 2, 0, 0];

  return (
    <group ref={placement}>
      <group ref={tilt}>
        <group ref={spin}>
          <group ref={gimbal0} rotation={[0, RINGS[0].start, 0]}>
            <mesh geometry={geometries[0]} material={materials[0]} rotation={faceCamera} />
            <group ref={gimbal1} rotation={[RINGS[1].start, 0, 0]}>
              <mesh geometry={geometries[1]} material={materials[1]} rotation={faceCamera} />
              <group ref={gimbal2} rotation={[0, RINGS[2].start, 0]}>
                <mesh geometry={geometries[2]} material={materials[2]} rotation={faceCamera} />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
