import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';
import { SCENE_READY, SITE_LOADED, isSiteLoaded } from '../../lib/stage-events';
import { Rings } from './Rings';

function Studio() {
  return (
    <Environment resolution={512} frames={1}>
      <color attach="background" args={['#6b6e73']} />
      <Lightformer form="rect" intensity={3} position={[0, 7, 1]} scale={[16, 6, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={1.8} position={[-7, 1, 3]} scale={[2.2, 12, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={1.2} position={[7, -0.5, 2]} scale={[2.2, 12, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={0.9} position={[0, 0, 9]} scale={[18, 10, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={0.5} color="#0b0c0e" position={[0, -7, 0]} scale={[16, 5, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={0.6} color="#0b0c0e" position={[0, 2, -8]} scale={[18, 8, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={3} color="#22c55e" position={[0, -5.5, 1.5]} scale={[12, 1, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={1.6} color="#4ade80" position={[-5.5, -1.5, 2.5]} scale={[0.8, 7, 1]} target={[0, 0, 0]} />
    </Environment>
  );
}

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
          gl.toneMappingExposure = 1.1;
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
