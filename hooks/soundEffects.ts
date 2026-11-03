"use client";

let context: AudioContext | null = null;

const getContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  if (context.state === "suspended") void context.resume();
  return context;
};

export const playClick = (pitch = 1) => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(1400 * pitch, now);
  osc.frequency.exponentialRampToValueAtTime(500 * pitch, now + 0.05);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.08);
};

export const playBuzz = (duration = 1.3) => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const end = now + duration;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.22, now + 0.03);
  master.gain.setValueAtTime(0.22, end - 0.08);
  master.gain.exponentialRampToValueAtTime(0.0001, end);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1600;
  filter.Q.value = 2;

  const tremolo = ctx.createGain();
  tremolo.gain.value = 0.65;
  const lfo = ctx.createOscillator();
  const lfoDepth = ctx.createGain();
  lfo.frequency.value = 50;
  lfoDepth.gain.value = 0.35;
  lfo.connect(lfoDepth).connect(tremolo.gain);

  const low = ctx.createOscillator();
  low.type = "sawtooth";
  low.frequency.value = 120;
  const high = ctx.createOscillator();
  high.type = "square";
  high.frequency.value = 240;
  const highGain = ctx.createGain();
  highGain.gain.value = 0.35;

  low.connect(filter);
  high.connect(highGain).connect(filter);
  filter.connect(tremolo).connect(master).connect(ctx.destination);

  [low, high, lfo].forEach((o) => {
    o.start(now);
    o.stop(end + 0.02);
  });
};

export const playTick = () => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const length = Math.floor(ctx.sampleRate * 0.018);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 4);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 3200 + Math.random() * 900;
  band.Q.value = 2;
  const gain = ctx.createGain();
  gain.gain.value = 0.09;
  noise.connect(band).connect(gain).connect(ctx.destination);
  noise.start(now);
};

export const playPop = () => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(320 + Math.random() * 120, now);
  osc.frequency.exponentialRampToValueAtTime(980, now + 0.08);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.17);
};

export const playClash = (weight = 1) => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const out = ctx.createGain();
  out.gain.value = 0.55 * (0.5 + weight * 0.5);
  out.connect(ctx.destination);

  const thump = ctx.createOscillator();
  const thumpGain = ctx.createGain();
  thump.type = "sine";
  thump.frequency.setValueAtTime(150 / (0.6 + weight * 0.4), now);
  thump.frequency.exponentialRampToValueAtTime(38, now + 0.28);
  thumpGain.gain.setValueAtTime(0.0001, now);
  thumpGain.gain.exponentialRampToValueAtTime(0.9 * weight + 0.15, now + 0.004);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
  thump.connect(thumpGain).connect(out);
  thump.start(now);
  thump.stop(now + 0.36);

  const crashLength = Math.floor(ctx.sampleRate * (0.35 + weight * 0.4));
  const buffer = ctx.createBuffer(1, crashLength, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < crashLength; i++) {
    channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / crashLength, 2.4);
  }
  const crash = ctx.createBufferSource();
  crash.buffer = buffer;
  const high = ctx.createBiquadFilter();
  high.type = "highpass";
  high.frequency.value = 2200;
  const crashGain = ctx.createGain();
  crashGain.gain.value = 0.32;
  crash.connect(high).connect(crashGain).connect(out);
  crash.start(now);

  const pitch = weight < 0.7 ? 1.6 : 1;
  [523, 811, 1187, 1543, 2219].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = i % 2 ? "square" : "triangle";
    osc.frequency.value = freq * pitch * (1 + (Math.random() - 0.5) * 0.02);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.07 / (i + 1) + 0.02, now + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25 + 0.25 * weight);
    osc.connect(g).connect(out);
    osc.start(now);
    osc.stop(now + 0.55);
  });
};

export const playBoom = () => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const out = ctx.createGain();
  out.gain.value = 0.8;
  out.connect(ctx.destination);

  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.type = "sine";
  sub.frequency.setValueAtTime(110, now);
  sub.frequency.exponentialRampToValueAtTime(28, now + 0.7);
  subGain.gain.setValueAtTime(0.0001, now);
  subGain.gain.exponentialRampToValueAtTime(1, now + 0.008);
  subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
  sub.connect(subGain).connect(out);
  sub.start(now);
  sub.stop(now + 0.95);

  const length = Math.floor(ctx.sampleRate * 1.4);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const low = ctx.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.setValueAtTime(5200, now);
  low.frequency.exponentialRampToValueAtTime(260, now + 1.2);
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.75;
  noise.connect(low).connect(noiseGain).connect(out);
  noise.start(now);

  for (let i = 0; i < 14; i++) {
    const t = now + (i / 14) * 0.43 + Math.random() * 0.03;
    const pop = ctx.createOscillator();
    const popGain = ctx.createGain();
    pop.type = "sine";
    pop.frequency.setValueAtTime(380 + Math.random() * 500, t);
    pop.frequency.exponentialRampToValueAtTime(1400, t + 0.07);
    popGain.gain.setValueAtTime(0.0001, t);
    popGain.gain.exponentialRampToValueAtTime(0.12, t + 0.008);
    popGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    pop.connect(popGain).connect(out);
    pop.start(t);
    pop.stop(t + 0.14);
  }
};

export const playLatch = () => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const thump = ctx.createOscillator();
  const thumpGain = ctx.createGain();
  thump.type = "sine";
  thump.frequency.setValueAtTime(180, now);
  thump.frequency.exponentialRampToValueAtTime(60, now + 0.09);
  thumpGain.gain.setValueAtTime(0.0001, now);
  thumpGain.gain.exponentialRampToValueAtTime(0.35, now + 0.003);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  thump.connect(thumpGain).connect(ctx.destination);
  thump.start(now);
  thump.stop(now + 0.13);

  const length = Math.floor(ctx.sampleRate * 0.05);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 2600;
  band.Q.value = 1.2;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.5;
  noise.connect(band).connect(noiseGain).connect(ctx.destination);
  noise.start(now);
};

export const playSwoosh = (duration = 0.75) => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const end = now + duration;
  const tail = end + 0.22;

  const length = Math.floor(ctx.sampleRate * (duration + 0.25));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) channel[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 1.4;
  band.frequency.setValueAtTime(260, now);
  band.frequency.exponentialRampToValueAtTime(5200, end);
  band.frequency.exponentialRampToValueAtTime(1800, tail);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.08, now + duration * 0.4);
  noiseGain.gain.exponentialRampToValueAtTime(0.42, end - 0.04);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, tail);
  noise.connect(band).connect(noiseGain).connect(ctx.destination);
  noise.start(now);
  noise.stop(tail + 0.02);

  const tone = ctx.createOscillator();
  tone.type = "sine";
  tone.frequency.setValueAtTime(90, now);
  tone.frequency.exponentialRampToValueAtTime(520, end);
  const toneGain = ctx.createGain();
  toneGain.gain.setValueAtTime(0.0001, now);
  toneGain.gain.exponentialRampToValueAtTime(0.12, end - 0.05);
  toneGain.gain.exponentialRampToValueAtTime(0.0001, end + 0.12);
  tone.connect(toneGain).connect(ctx.destination);
  tone.start(now);
  tone.stop(end + 0.14);
};

export const playSound =(src: string | undefined, fallback: () => void) => {
  if (!src || typeof window === "undefined") {
    fallback();
    return;
  }
  const audio = new Audio(src);
  audio.play().catch(() => fallback());
};
