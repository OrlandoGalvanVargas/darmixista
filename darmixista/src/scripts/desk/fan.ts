import * as THREE from 'three';

const SPIN = Math.PI * 2 * 2.3;

function worldPositions(mesh: THREE.Mesh, center: THREE.Vector3) {
  const pos = (mesh.geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute;
  const out = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3();
  mesh.updateMatrixWorld(true);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld).sub(center);
    out[i * 3] = v.x;
    out[i * 3 + 1] = v.y;
    out[i * 3 + 2] = v.z;
  }
  return out;
}

function splitBlades(mesh: THREE.Mesh, P: Float32Array) {
  const g = mesh.geometry as THREE.BufferGeometry;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const idx = g.index!;
  const keep: number[] = [];
  const take: number[] = [];
  for (let i = 0; i < idx.count; i += 3) {
    const a = idx.getX(i) * 3;
    const b = idx.getX(i + 1) * 3;
    const c = idx.getX(i + 2) * 3;
    const cx = (P[a] + P[b] + P[c]) / 3;
    const cy = (P[a + 1] + P[b + 1] + P[c + 1]) / 3;
    const cz = (P[a + 2] + P[b + 2] + P[c + 2]) / 3;
    const blade = Math.hypot(cx, cy) < 0.045 && cz > -0.008 && cz < 0.004;
    (blade ? take : keep).push(idx.getX(i), idx.getX(i + 1), idx.getX(i + 2));
  }
  if (!take.length) return null;
  const map = new Map<number, number>();
  const pos: number[] = [];
  const uvs: number[] = [];
  const newIdx: number[] = [];
  for (const v of take) {
    let n = map.get(v);
    if (n === undefined) {
      n = map.size;
      map.set(v, n);
      pos.push(P[v * 3], P[v * 3 + 1], P[v * 3 + 2]);
      uvs.push(uv.getX(v), uv.getY(v));
    }
    newIdx.push(n);
  }
  const bg = new THREE.BufferGeometry();
  bg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  bg.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  bg.setIndex(newIdx);
  bg.computeBoundingSphere();
  g.setIndex(keep);
  return bg;
}

function plateDisc(mesh: THREE.Mesh, P: Float32Array) {
  const g = mesh.geometry as THREE.BufferGeometry;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const idx = g.index!;
  const M = new Float64Array(9);
  const bu = new Float64Array(3);
  const bv = new Float64Array(3);
  let n = 0;
  for (let i = 0; i < idx.count; i += 3) {
    let ok = true;
    for (let j = 0; j < 3 && ok; j++) {
      const k = idx.getX(i + j) * 3;
      ok = P[k + 2] < -0.0078 && P[k + 2] > -0.0083 && Math.hypot(P[k], P[k + 1]) < 0.05;
    }
    if (!ok) continue;
    for (let j = 0; j < 3; j++) {
      const k = idx.getX(i + j);
      const row = [P[k * 3], P[k * 3 + 1], 1];
      for (let a = 0; a < 3; a++) {
        for (let b = 0; b < 3; b++) M[a * 3 + b] += row[a] * row[b];
        bu[a] += row[a] * uv.getX(k);
        bv[a] += row[a] * uv.getY(k);
      }
      n++;
    }
  }
  if (n < 6) return null;
  const m = new THREE.Matrix3().set(M[0], M[1], M[2], M[3], M[4], M[5], M[6], M[7], M[8]).invert();
  const cu = new THREE.Vector3(bu[0], bu[1], bu[2]).applyMatrix3(m);
  const cv = new THREE.Vector3(bv[0], bv[1], bv[2]).applyMatrix3(m);
  const disc = new THREE.CircleGeometry(0.0472, 96);
  const dp = disc.attributes.position as THREE.BufferAttribute;
  const du = disc.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < dp.count; i++) {
    const x = dp.getX(i);
    const y = dp.getY(i);
    du.setXY(i, cu.x * x + cu.y * y + cu.z, cv.x * x + cv.y * y + cv.z);
  }
  disc.translate(0, 0, -0.0078);
  return disc;
}

function createSound() {
  let ctx: AudioContext | null = null;
  let air: GainNode | null = null;
  let hum: GainNode | null = null;
  let lp: BiquadFilterNode | null = null;
  let motor: OscillatorNode | null = null;
  let level = 0;
  let near = 0.3;

  const build = () => {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    const len = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + w * 0.099046;
      b1 = 0.963 * b1 + w * 0.2965164;
      b2 = 0.57 * b2 + w * 1.0526913;
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2;
    }
    const fade = Math.floor(ctx.sampleRate * 0.05);
    for (let i = 0; i < fade; i++) {
      const t = i / fade;
      d[len - fade + i] = d[len - fade + i] * (1 - t) + d[i] * t;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.loopStart = fade / ctx.sampleRate;
    src.loopEnd = buf.duration;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 120;
    lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 400;
    lp.Q.value = 0.4;
    air = ctx.createGain();
    air.gain.value = 0;
    src.connect(hp).connect(lp).connect(air).connect(ctx.destination);
    motor = ctx.createOscillator();
    motor.type = 'triangle';
    motor.frequency.value = 90;
    const mf = ctx.createBiquadFilter();
    mf.type = 'lowpass';
    mf.frequency.value = 320;
    hum = ctx.createGain();
    hum.gain.value = 0;
    motor.connect(mf).connect(hum).connect(ctx.destination);
    src.start();
    motor.start();
    document.addEventListener('visibilitychange', () => {
      if (!ctx) return;
      if (document.hidden) ctx.suspend();
      else ctx.resume();
    });
  };

  const events = ['pointerdown', 'pointerup', 'click', 'keydown', 'touchend'];
  const stop = () => events.forEach((ev) => window.removeEventListener(ev, unlock, true));
  const unlock = () => {
    if (!ctx) build();
    if (!ctx) return stop();
    if (ctx.state === 'running') return stop();
    if (!document.hidden) ctx.resume().then(() => ctx?.state === 'running' && stop(), () => {});
  };
  events.forEach((ev) => window.addEventListener(ev, unlock, { capture: true, passive: true }));
  try {
    build();
    if (ctx && !document.hidden) (ctx as AudioContext).resume().then(() => ctx?.state === 'running' && stop(), () => {});
  } catch {}

  const click = (on: boolean) => {
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime;
    const n = Math.floor(ctx.sampleRate * 0.03);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.0035));
    const s = ctx.createBufferSource();
    s.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = on ? 3200 : 2600;
    bp.Q.value = 1.4;
    const g = ctx.createGain();
    g.gain.value = 0.55;
    s.connect(bp).connect(g).connect(ctx.destination);
    s.start(t);
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(on ? 1500 : 1250, t);
    o.frequency.exponentialRampToValueAtTime(on ? 900 : 700, t + 0.04);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.08, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    o.connect(og).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.06);
  };

  const update = (speed: number, dist: number) => {
    const raw = 0.42 / Math.max(dist, 0.05);
    near = THREE.MathUtils.clamp(raw < 0.3 ? raw : 0.3 + (raw - 0.3) * 0.4, 0.12, 0.62);
    level = speed;
    if (!ctx || ctx.state !== 'running' || !air || !hum || !lp || !motor) return;
    const t = ctx.currentTime;
    air.gain.setTargetAtTime(0.13 * level * near, t, 0.12);
    hum.gain.setTargetAtTime(0.006 * level * level * near, t, 0.12);
    lp.frequency.setTargetAtTime(300 + 650 * level, t, 0.12);
    motor.frequency.setTargetAtTime(48 + 42 * level, t, 0.12);
  };

  return { click, update, context: () => ctx };
}

export function createFan(lmpMesh: THREE.Mesh, center: THREE.Vector3, button: THREE.Vector3) {
  const P = worldPositions(lmpMesh, center);
  const disc = plateDisc(lmpMesh, P);
  const split = splitBlades(lmpMesh, P);
  const pivot = new THREE.Group();
  pivot.position.copy(center);
  const base = lmpMesh.material as THREE.MeshBasicMaterial;
  const ghosts: THREE.Mesh[] = [];
  let blades: THREE.Mesh | null = null;
  if (split) {
    blades = new THREE.Mesh(split, base);
    if (disc) {
      const dm = base.clone();
      dm.polygonOffset = true;
      dm.polygonOffsetFactor = -1;
      dm.polygonOffsetUnits = -1;
      blades.add(new THREE.Mesh(disc, dm));
    }
    pivot.add(blades);
    for (const op of [0.32, 0.16]) {
      const gm = new THREE.MeshBasicMaterial({ map: base.map, transparent: true, opacity: 0, depthWrite: false });
      const gh = new THREE.Mesh(split, gm);
      gh.renderOrder = 1;
      gh.userData.op = op;
      pivot.add(gh);
      ghosts.push(gh);
    }
  }
  const sound = createSound();
  const sphere = new THREE.Sphere(center.clone(), 0.06);
  const frustum = new THREE.Frustum();
  const pm = new THREE.Matrix4();
  let on = true;
  let speed = 0;
  let angle = 0;
  let lastSpeed = -1;

  const toggle = () => {
    on = !on;
    sound.click(on);
  };

  const update = (dt: number, camera: THREE.Camera) => {
    const target = on ? 1 : 0;
    const k = on ? 1.4 : 0.75;
    speed += (target - speed) * Math.min(1, dt * k * (on ? 1 : 1.2));
    if (Math.abs(target - speed) < 0.002) speed = target;
    sound.update(speed, camera.position.distanceTo(center));
    if (!blades) return false;
    const moving = speed > 0 || lastSpeed !== speed;
    lastSpeed = speed;
    if (!moving) return false;
    pm.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(pm);
    const visible = frustum.intersectsSphere(sphere);
    angle -= SPIN * speed * dt;
    angle %= Math.PI * 2;
    blades.rotation.z = angle;
    const step = SPIN * speed * (1 / 60);
    ghosts.forEach((g, i) => {
      g.rotation.z = angle + step * 0.45 * (i + 1);
      (g.material as THREE.MeshBasicMaterial).opacity = g.userData.op * Math.min(1, speed * 1.4);
      g.visible = speed > 0.05;
    });
    return visible;
  };

  const near = (ray: THREE.Ray) => ray.distanceSqToPoint(button) < 0.016 * 0.016;

  return {
    object: pivot,
    button,
    toggle,
    update,
    near,
    audio: () => sound.context(),
    get on() {
      return on;
    },
  };
}
