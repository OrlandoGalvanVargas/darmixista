export function createWhoosh(getCtx: () => AudioContext | null) {
  let noise: AudioBuffer | null = null;
  const pink = (ctx: AudioContext) => {
    if (noise && noise.sampleRate === ctx.sampleRate) return noise;
    const len = Math.floor(ctx.sampleRate * 2.4);
    noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noise.getChannelData(0);
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
    return noise;
  };
  return (dir: 'in' | 'out', dur: number) => {
    const ctx = getCtx();
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime + 0.01;
    const end = t + dur + 0.5;
    const out = ctx.createGain();
    out.gain.value = 1;
    const pan = ctx.createStereoPanner();
    pan.pan.setValueAtTime(dir === 'in' ? -0.25 : 0.25, t);
    pan.pan.linearRampToValueAtTime(dir === 'in' ? 0.2 : -0.2, t + dur);
    const soft = ctx.createBiquadFilter();
    soft.type = 'lowpass';
    soft.frequency.value = 2200;
    out.connect(soft).connect(pan).connect(ctx.destination);

    const src = ctx.createBufferSource();
    src.buffer = pink(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 0.9;
    const f = dir === 'in' ? [240, 820, 380] : [620, 420, 220];
    bp.frequency.setValueAtTime(f[0], t);
    bp.frequency.exponentialRampToValueAtTime(f[1], t + dur * 0.45);
    bp.frequency.exponentialRampToValueAtTime(f[2], t + dur);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(0.07, t + dur * 0.42);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.2);
    src.connect(bp).connect(ng).connect(out);
    src.start(t);
    src.stop(end);

    const notes = dir === 'in' ? [329.63, 493.88] : [493.88, 329.63];
    notes.forEach((hz, i) => {
      const at = t + 0.12 + i * dur * 0.32;
      [0, 4].forEach((cents) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = hz;
        o.detune.value = cents;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(0.011, at + 0.22);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 1.4);
        o.connect(g).connect(out);
        o.start(at);
        o.stop(at + 1.5);
      });
    });
  };
}
