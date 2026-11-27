import * as THREE from 'three';

const FIRE = { x: 0.614, base: 0.77, tip: 0.56 };

const GLSL = `
uniform sampler2D fmask;
uniform float uTime;
float fh(float n) { return fract(sin(n) * 43758.5453); }
float fh2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float fn(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(fh2(i), fh2(i + vec2(1.0, 0.0)), f.x), mix(fh2(i + vec2(0.0, 1.0)), fh2(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  return fn(p) * 0.55 + fn(p * 2.1 + 3.7) * 0.3 + fn(p * 4.3 + 1.3) * 0.15;
}
`;

const FRAG = `
#ifdef USE_MAP
  vec2 fuv = vMapUv;
  vec4 mk = texture2D(fmask, fuv);
  float rise = smoothstep(${FIRE.base.toFixed(3)}, ${FIRE.tip.toFixed(3)}, fuv.y);
  float amt = mk.r * (0.25 + 0.75 * rise);
  vec2 q = vec2(fuv.x * 42.0, fuv.y * 24.0 + uTime * 2.8);
  float n1 = fbm(q);
  float n2 = fbm(q + vec2(5.2, 1.3));
  vec2 off = vec2((n1 - 0.5) * 0.007, (n2 - 0.5) * 0.006 + 0.003 * rise) * amt;
  vec4 fcol = texture2D(map, fuv + off);
  float flick = fbm(vec2(uTime * 2.4, 0.5)) * 0.7 + fn(vec2(uTime * 9.0, 2.0)) * 0.3;
  fcol.rgb *= 1.0 + mk.g * (flick - 0.5) * 0.32 + amt * (n1 - 0.45) * 0.4;
  if (abs(fuv.x - ${FIRE.x.toFixed(3)}) < 0.13 && fuv.y > 0.25 && fuv.y < 0.74) {
    for (int i = 0; i < 22; i++) {
      float s = float(i) * 7.31;
      float life = fract(uTime * (0.16 + 0.14 * fh(s)) + fh(s + 1.7));
      vec2 p = vec2(${FIRE.x.toFixed(3)} + (fh(s + 2.9) - 0.5) * 0.07 + sin(life * 7.0 + s) * 0.018 * life, 0.66 - life * (0.3 + 0.12 * fh(s + 4.1)));
      vec2 d = (fuv - p) * vec2(1.6, 1.0);
      float r = 0.0011 + 0.0007 * fh(s + 5.3);
      float e = exp(-dot(d, d) / (r * r)) * (1.0 - life) * (0.7 + 0.3 * sin(uTime * 13.0 + s));
      fcol.rgb += vec3(1.0, 0.5, 0.15) * e * 1.6;
    }
  }
  diffuseColor *= fcol;
#endif
`;

export function createLaptopPhoto(base: string, maxAniso: number, small: boolean, still: boolean, warm: (t: THREE.Texture) => void = () => {}) {
  const loader = new THREE.TextureLoader();
  const blank = new THREE.DataTexture(new Uint8Array([8, 8, 8, 255]), 1, 1);
  blank.colorSpace = THREE.SRGBColorSpace;
  blank.needsUpdate = true;
  const noMask = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  noMask.needsUpdate = true;
  const uTime = { value: 0 };
  const fmask = { value: noMask as THREE.Texture };
  const material = new THREE.MeshBasicMaterial({ map: blank, color: new THREE.Color(0.95, 0.95, 0.95) });
  material.onBeforeCompile = (s) => {
    s.uniforms.fmask = fmask;
    s.uniforms.uTime = uTime;
    s.fragmentShader = s.fragmentShader.replace('void main() {', `${GLSL}\nvoid main() {`).replace('#include <map_fragment>', FRAG);
  };

  let ready = false;
  let shownAt = 0;
  loader.load(`${base}fire${small ? '-m' : ''}.webp`, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.flipY = false;
    t.anisotropy = maxAniso;
    warm(t);
    material.map = t;
    material.color.setScalar(0);
    ready = true;
    shownAt = performance.now();
  });
  loader.load(`${base}fire-mask.webp`, (t) => {
    t.flipY = false;
    t.colorSpace = THREE.NoColorSpace;
    warm(t);
    fmask.value = t;
  });

  const sphere = new THREE.Sphere();
  const frustum = new THREE.Frustum();
  const pm = new THREE.Matrix4();
  let screenMesh: THREE.Mesh | null = null;
  let intro = true;

  const update = (camera: THREE.Camera) => {
    if (!ready) return false;
    const now = performance.now();
    if (intro) {
      const k = Math.min(1, (now - shownAt) / 1200);
      material.color.setScalar(0.95 * k * k * (3 - 2 * k));
      if (k >= 1) intro = false;
      uTime.value = now / 1000;
      return true;
    }
    if (still) return false;
    if (screenMesh) {
      pm.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      frustum.setFromProjectionMatrix(pm);
      if (!frustum.intersectsSphere(sphere)) return false;
    }
    uTime.value = (now / 1000) % 1000;
    return true;
  };

  const attach = (mesh: THREE.Mesh) => {
    screenMesh = mesh;
    mesh.geometry.computeBoundingSphere();
    sphere.copy(mesh.geometry.boundingSphere!).applyMatrix4(mesh.matrixWorld);
  };

  return { material, update, attach };
}
