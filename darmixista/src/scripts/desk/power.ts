export function createPowerSound(getCtx: () => AudioContext | null) {
  let burst: AudioBuffer | null = null;
  const noise = (ctx: AudioContext) => {
    if (burst && burst.sampleRate === ctx.sampleRate) return burst;
    const n = Math.floor(ctx.sampleRate * 0.05);
    burst = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = burst.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.006));
    return burst;
  };
  return (on: boolean) => {
    const ctx = getCtx();
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime + 0.005;
    const out = ctx.createGain();
    out.gain.value = 0.9;
    out.connect(ctx.destination);

    const s = ctx.createBufferSource();
    s.buffer = noise(ctx);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = on ? 1300 : 1050;
    lp.Q.value = 0.7;
    const sg = ctx.createGain();
    sg.gain.value = 0.32;
    s.connect(lp).connect(sg).connect(out);
    s.start(t);

    const thump = ctx.createOscillator();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(on ? 210 : 180, t);
    thump.frequency.exponentialRampToValueAtTime(on ? 120 : 95, t + 0.07);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.0001, t);
    tg.gain.exponentialRampToValueAtTime(0.12, t + 0.004);
    tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    thump.connect(tg).connect(out);
    thump.start(t);
    thump.stop(t + 0.1);

    const notes = on ? [659.25, 987.77] : [783.99, 523.25];
    notes.forEach((hz, i) => {
      const at = t + 0.07 + i * 0.085;
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = hz;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.028, at + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.32);
      o.connect(g).connect(out);
      o.start(at);
      o.stop(at + 0.34);
    });
  };
}
