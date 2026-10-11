import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';
import { SCENE_READY, SITE_LOADED, isSiteLoaded } from '../../lib/stage-events';
import { Rings } from './Rings';

/**
 * Iluminación de estudio monocromática: softboxes virtuales que solo
 * existen en el reflejo del metal. No hay luces de color ni archivos HDR.
 */
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      {/* Gris de estudio (no negro puro): evita que el metal se vea "agujero negro" */}
      <color attach="background" args={['#1c1c1c']} />
      {/* Softbox cenital: la luz principal, larga y suave */}
      <Lightformer form="rect" intensity={1.6} position={[0, 6, 2]} scale={[12, 4, 1]} target={[0, 0, 0]} />
      {/* Tiras verticales alrededor: dibujan los bordes y los degradados de cada banda */}
      <Lightformer form="rect" intensity={1.4} position={[-6, 0.5, 3]} scale={[1.6, 10, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={0.9} position={[6, -0.5, 2]} scale={[1.6, 10, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={0.7} position={[-4, 0, -5]} scale={[1.2, 10, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={0.7} position={[4, 0, -5]} scale={[1.2, 10, 1]} target={[0, 0, 0]} />
      {/* Relleno frontal amplio y tenue: da cuerpo a las caras que miran a la cámara */}
      <Lightformer form="rect" intensity={0.45} position={[0, 0, 8]} scale={[14, 8, 1]} target={[0, 0, 0]} />
      {/* Rebote desde abajo, muy suave (sin piso visible) */}
      <Lightformer form="rect" intensity={0.25} position={[0, -6, 0]} scale={[12, 4, 1]} target={[0, 0, 0]} />
    </Environment>
  );
}

/** Sin WebGL: no hay anillos, pero la pantalla de carga no debe esperarlos */
function NoWebGL() {
  useEffect(() => {
    document.documentElement.dataset.scene = 'ready';
    window.dispatchEvent(new Event(SCENE_READY));
  }, []);
  return null;
}

export default function RingsScene() {
  const [visible, setVisible] = useState(isSiteLoaded);

  useEffect(() => {
    if (visible) return;
    const show = () => setVisible(true);
    window.addEventListener(SITE_LOADED, show, { once: true });
    return () => window.removeEventListener(SITE_LOADED, show);
  }, [visible]);

  return (
    <div
      className="h-full w-full transition-opacity duration-[1400ms] ease-(--ease-zen)"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 9], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.05;
        }}
        fallback={<NoWebGL />}
      >
        <Suspense fallback={null}>
          <Studio />
          <Rings />
        </Suspense>
      </Canvas>
    </div>
  );
}
