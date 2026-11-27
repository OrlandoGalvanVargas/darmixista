import * as THREE from 'three';

export type BoardTool = 'marker' | 'eraser';
export interface BoardPoint {
  u: number;
  v: number;
}

const KEY = 'darmixista-board';
const INK: Record<string, string> = {
  '#1b1d20': '#16181b',
  '#d23b3b': '#dc3a35',
  '#2358c9': '#2a62da',
  '#1d9a57': '#1fa45e',
};
const MAX = 4096;

export function createBoard(renderer: THREE.WebGLRenderer, size: { w: number; h: number }, center: THREE.Vector3, maxAniso: number, small: boolean) {
  const W = small ? 1400 : 2048;
  const H = Math.round((W * size.h) / size.w);
  const rt = new THREE.WebGLRenderTarget(W, H, {
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
  });
  rt.texture.anisotropy = maxAniso;

  const mat = new THREE.MeshBasicMaterial({
    map: rt.texture,
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.DstColorFactor,
    blendDst: THREE.ZeroFactor,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size.w, size.h), mat);
  mesh.rotation.y = Math.PI / 2;
  mesh.position.copy(center);
  mesh.renderOrder = 2;
  mesh.updateMatrix();
  mesh.updateMatrixWorld(true);
  mesh.matrixAutoUpdate = false;

  const cam = new THREE.OrthographicCamera(0, W, 0, -H, -1, 1);
  const brushScene = new THREE.Scene();
  const brushMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color() }, uSize: { value: 10 } },
    vertexShader: `uniform float uSize;varying vec2 vP;void main(){vP=position.xy*2.0;vec4 p=instanceMatrix*vec4(position.xy*(uSize+2.0),0.0,1.0);gl_Position=projectionMatrix*viewMatrix*p;}`,
    fragmentShader: `uniform vec3 uColor;uniform float uSize;varying vec2 vP;void main(){float r=length(vP)*(uSize+2.0)*0.5;float a=clamp(uSize*0.5-r+0.5,0.0,1.0);if(a<=0.0)discard;gl_FragColor=vec4(uColor,a);}`,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  const stamps = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), brushMat, MAX);
  stamps.frustumCulled = false;
  stamps.count = 0;
  brushScene.add(stamps);
  const m4 = new THREE.Matrix4();

  const loadMat = new THREE.MeshBasicMaterial({ toneMapped: false, depthTest: false });
  const loadQuad = new THREE.Mesh(new THREE.PlaneGeometry(W, H), loadMat);
  loadQuad.position.set(W / 2, -H / 2, 0);
  const loadScene = new THREE.Scene();
  loadScene.add(loadQuad);

  const store = document.createElement('canvas');
  store.width = W;
  store.height = H;
  const sctx = store.getContext('2d')!;
  sctx.fillStyle = '#ffffff';
  sctx.fillRect(0, 0, W, H);

  let tool: BoardTool = 'marker';
  let color = '#16181b';
  let pending = true;
  let cleared = false;
  let loaded: THREE.Texture | null = null;
  let last: { x: number; y: number } | null = null;
  let mid: { x: number; y: number } | null = null;
  let stroke: { color: string; size: number; pts: number[] } | null = null;
  let saveTimer = 0;
  const pxm = W / size.w;
  const diameter = () => (tool === 'eraser' ? 0.05 : 0.0065) * pxm;

  const withTarget = (fn: () => void) => {
    const prevTarget = renderer.getRenderTarget();
    const prevAuto = renderer.autoClear;
    renderer.autoClear = false;
    renderer.setRenderTarget(rt);
    fn();
    renderer.setRenderTarget(prevTarget);
    renderer.autoClear = prevAuto;
  };

  const flushStamps = () => {
    if (!stamps.count) return;
    stamps.instanceMatrix.needsUpdate = true;
    stamps.instanceMatrix.clearUpdateRanges();
    stamps.instanceMatrix.addUpdateRange(0, stamps.count * 16);
    withTarget(() => renderer.render(brushScene, cam));
    stamps.count = 0;
  };

  const stamp = (x: number, y: number) => {
    if (stamps.count >= MAX) flushStamps();
    m4.makeTranslation(x, -y, 0);
    stamps.setMatrixAt(stamps.count++, m4);
    pending = true;
  };

  const along = (ax: number, ay: number, cx: number, cy: number, bx: number, by: number) => {
    const len = Math.hypot(cx - ax, cy - ay) + Math.hypot(bx - cx, by - cy);
    const step = Math.max(0.6, diameter() * 0.18);
    const n = Math.max(1, Math.ceil(len / step));
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const k = 1 - t;
      stamp(k * k * ax + 2 * k * t * cx + t * t * bx, k * k * ay + 2 * k * t * cy + t * t * by);
    }
  };

  const setBrush = () => {
    if (stamps.count) flushStamps();
    brushMat.uniforms.uColor.value.set(tool === 'eraser' ? '#ffffff' : color);
    brushMat.uniforms.uSize.value = diameter();
  };

  const toPx = (p: BoardPoint) => ({ x: p.u * W, y: (1 - p.v) * H });

  const persist = () => {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      const run = () => {
        try {
          localStorage.setItem(KEY, store.toDataURL('image/webp', 0.8));
        } catch {}
      };
      if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 3000 });
      else run();
    }, 1200);
  };

  const replay = (s: { color: string; size: number; pts: number[] }) => {
    const p = s.pts;
    sctx.lineCap = 'round';
    sctx.lineJoin = 'round';
    sctx.lineWidth = s.size;
    sctx.strokeStyle = s.color;
    sctx.fillStyle = s.color;
    sctx.beginPath();
    sctx.arc(p[0], p[1], s.size / 2, 0, Math.PI * 2);
    sctx.fill();
    if (p.length < 4) return;
    sctx.beginPath();
    sctx.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length; i += 2) sctx.quadraticCurveTo(p[i - 2], p[i - 1], (p[i - 2] + p[i]) / 2, (p[i - 1] + p[i + 1]) / 2);
    sctx.lineTo(p[p.length - 2], p[p.length - 1]);
    sctx.stroke();
  };

  try {
    const s = localStorage.getItem(KEY);
    if (s) {
      const img = new Image();
      img.onload = () => {
        sctx.drawImage(img, 0, 0, W, H);
        const t = new THREE.CanvasTexture(store);
        t.colorSpace = THREE.SRGBColorSpace;
        loaded = t;
        pending = true;
      };
      img.src = s;
    }
  } catch {}

  return {
    mesh,
    get tool() {
      return tool;
    },
    setTool(t: BoardTool) {
      tool = t;
    },
    setColor(c: string) {
      color = INK[c] ?? c;
      tool = 'marker';
    },
    begin(pt: BoardPoint) {
      const p = toPx(pt);
      setBrush();
      stamp(p.x, p.y);
      last = p;
      mid = p;
      stroke = { color: tool === 'eraser' ? '#ffffff' : color, size: diameter(), pts: [p.x, p.y] };
    },
    move(pt: BoardPoint) {
      if (!last || !mid || !stroke) return;
      const p = toPx(pt);
      if (Math.abs(p.x - last.x) + Math.abs(p.y - last.y) < 0.5) return;
      const m = { x: (last.x + p.x) / 2, y: (last.y + p.y) / 2 };
      along(mid.x, mid.y, last.x, last.y, m.x, m.y);
      stroke.pts.push(p.x, p.y);
      last = p;
      mid = m;
    },
    end() {
      if (last && mid) along(mid.x, mid.y, (mid.x + last.x) / 2, (mid.y + last.y) / 2, last.x, last.y);
      if (stroke) {
        const s = stroke;
        window.setTimeout(() => {
          replay(s);
          persist();
        }, 0);
      }
      last = null;
      mid = null;
      stroke = null;
    },
    get drawing() {
      return last !== null;
    },
    render() {
      if (!pending) return false;
      pending = false;
      if (!cleared) {
        cleared = true;
        const c = new THREE.Color();
        renderer.getClearColor(c);
        const a = renderer.getClearAlpha();
        withTarget(() => {
          renderer.setClearColor(0xffffff, 1);
          renderer.clear(true, false, false);
        });
        renderer.setClearColor(c, a);
      }
      if (loaded) {
        loadMat.map = loaded;
        loadMat.needsUpdate = true;
        withTarget(() => renderer.render(loadScene, cam));
        loaded.dispose();
        loaded = null;
        loadMat.map = null;
      }
      stamps.instanceMatrix.needsUpdate = true;
      stamps.instanceMatrix.clearUpdateRanges();
      stamps.instanceMatrix.addUpdateRange(0, Math.max(1, stamps.count) * 16);
      withTarget(() => renderer.render(brushScene, cam));
      stamps.count = 0;
      return true;
    },
    cursor() {
      const d = tool === 'eraser' ? 34 : 20;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${d}" height="${d}" viewBox="0 0 ${d} ${d}"><circle cx="${d / 2}" cy="${d / 2}" r="${d / 2 - 2}" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="3"/><circle cx="${d / 2}" cy="${d / 2}" r="${d / 2 - 2}" fill="none" stroke="#fff" stroke-width="1.5"/>${tool === 'eraser' ? '' : `<circle cx="${d / 2}" cy="${d / 2}" r="3.5" fill="${color}"/>`}</svg>`;
      return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${d / 2} ${d / 2}, crosshair`;
    },
  };
}
