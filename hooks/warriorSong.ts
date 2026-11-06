"use client";

import { encodeWav } from "@/hooks/journeySong";
import { makeHall } from "@/hooks/soundEffects";

const RATE = 44100;
const BEAT = 0.625;
const BAR = BEAT * 4;
const BARS = 42;
const LENGTH = BARS * BAR + 7;

const D2 = 73.42;
const THEME_MINOR = [293.66, 349.23, 392, 440, 523.25, 440];
const THEME_MAJOR = [293.66, 369.99, 392, 440, 587.33, 440];
const OSTINATO = [293.66, 440, 349.23, 523.25, 392, 440];
const OSTINATO_MAJOR = [293.66, 440, 369.99, 587.33, 392, 440];
const ROOTS = [73.42, 73.42, 65.41, 87.31];
const ROOTS_MAJOR = [73.42, 98, 110, 73.42];

export const place = (ctx: BaseAudioContext, bus: AudioNode, pan: number) => {
  const panner = ctx.createStereoPanner();
  panner.pan.value = pan;
  panner.connect(bus);
  return panner;
};

const stringBuffer = (
  ctx: BaseAudioContext,
  cache: Map<number, AudioBuffer>,
  freq: number,
) => {
  const known = cache.get(freq);
  if (known) return known;
  const length = Math.floor(RATE * 1.9);
  const buffer = ctx.createBuffer(1, length, RATE);
  const data = buffer.getChannelData(0);
  const period = Math.max(2, Math.round(RATE / freq));
  const line = new Float32Array(period);
  let seed = Math.round(freq * 97);
  for (let i = 0; i < period; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    line[i] = (seed >>> 0) / 2147483648 - 1;
  }
  let index = 0;
  for (let i = 0; i < length; i++) {
    const next = (index + 1) % period;
    const value = (line[index] + line[next]) * 0.4975;
    data[i] = line[index];
    line[index] = value;
    index = next;
  }
  cache.set(freq, buffer);
  return buffer;
};

export const pluck = (
  ctx: BaseAudioContext,
  bus: AudioNode,
  cache: Map<number, AudioBuffer>,
  t: number,
  freq: number,
  level: number,
  pan: number,
) => {
  const source = ctx.createBufferSource();
  source.buffer = stringBuffer(ctx, cache, freq);
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 3800;
  const gain = ctx.createGain();
  gain.gain.value = level;
  source.connect(tone).connect(gain).connect(place(ctx, bus, pan));
  source.start(t);
};

export const fmBell = (
  ctx: BaseAudioContext,
  bus: AudioNode,
  t: number,
  freq: number,
  level: number,
  ratio: number,
  decay: number,
  pan: number,
) => {
  const carrier = ctx.createOscillator();
  const modulator = ctx.createOscillator();
  const index = ctx.createGain();
  const gain = ctx.createGain();
  carrier.frequency.value = freq;
  modulator.frequency.value = freq * ratio;
  index.gain.setValueAtTime(freq * 2.6, t);
  index.gain.exponentialRampToValueAtTime(freq * 0.05, t + decay);
  modulator.connect(index).connect(carrier.frequency);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(level, t + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  carrier.connect(gain).connect(place(ctx, bus, pan));
  carrier.start(t);
  modulator.start(t);
  carrier.stop(t + decay + 0.05);
  modulator.stop(t + decay + 0.05);
};

export const talkingDrum = (
  ctx: BaseAudioContext,
  bus: AudioNode,
  t: number,
  from: number,
  to: number,
  level: number,
  pan: number,
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + 0.16);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(level, t + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
  osc.connect(gain).connect(place(ctx, bus, pan));
  osc.start(t);
  osc.stop(t + 0.36);
};

export const noiseBuffer = (ctx: BaseAudioContext, seconds: number) => {
  const length = Math.floor(RATE * seconds);
  const buffer = ctx.createBuffer(1, length, RATE);
  const data = buffer.getChannelData(0);
  let seed = 12345;
  for (let i = 0; i < length; i++) {
    seed = (Math.imul(seed, 1103515245) + 12345) | 0;
    data[i] = (seed >>> 0) / 2147483648 - 1;
  }
  return buffer;
};

export const shaker = (
  ctx: BaseAudioContext,
  bus: AudioNode,
  noise: AudioBuffer,
  t: number,
  level: number,
  pan: number,
) => {
  const source = ctx.createBufferSource();
  source.buffer = noise;
  const high = ctx.createBiquadFilter();
  high.type = "highpass";
  high.frequency.value = 6500;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(level, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  source.connect(high).connect(gain).connect(place(ctx, bus, pan));
  source.start(t, (t * 0.37) % 1.5, 0.08);
};

export const wind = (
  ctx: BaseAudioContext,
  bus: AudioNode,
  noise: AudioBuffer,
  t: number,
  length: number,
  level: number,
) => {
  const source = ctx.createBufferSource();
  source.buffer = noise;
  source.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 2.4;
  band.frequency.setValueAtTime(220, t);
  band.frequency.linearRampToValueAtTime(720, t + length * 0.5);
  band.frequency.linearRampToValueAtTime(180, t + length);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(level, t + length * 0.4);
  gain.gain.linearRampToValueAtTime(0.0001, t + length);
  source.connect(band).connect(gain).connect(bus);
  source.start(t);
  source.stop(t + length);
};

export const bass = (
  ctx: BaseAudioContext,
  bus: AudioNode,
  t: number,
  length: number,
  freq: number,
  level: number,
  bright: number,
) => {
  const saw = ctx.createOscillator();
  const sub = ctx.createOscillator();
  saw.type = "sawtooth";
  sub.type = "sine";
  saw.frequency.value = freq;
  sub.frequency.value = freq / 2;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 5;
  filter.frequency.setValueAtTime(bright, t);
  filter.frequency.exponentialRampToValueAtTime(bright * 0.3, t + length);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(level, t + 0.03);
  gain.gain.setValueAtTime(level, t + length * 0.7);
  gain.gain.linearRampToValueAtTime(0.0001, t + length);
  saw.connect(filter);
  sub.connect(filter);
  filter.connect(gain).connect(bus);
  [saw, sub].forEach((osc) => {
    osc.start(t);
    osc.stop(t + length);
  });
};

export const lead = (
  ctx: BaseAudioContext,
  bus: AudioNode,
  t: number,
  length: number,
  freq: number,
  level: number,
  pan: number,
) => {
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 7;
  filter.frequency.setValueAtTime(500, t);
  filter.frequency.exponentialRampToValueAtTime(3400, t + length * 0.35);
  filter.frequency.exponentialRampToValueAtTime(900, t + length);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(level, t + 0.05);
  gain.gain.setValueAtTime(level, t + length * 0.75);
  gain.gain.linearRampToValueAtTime(0.0001, t + length);
  filter.connect(gain).connect(place(ctx, bus, pan));
  [-7, 7].forEach((cents) => {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    osc.detune.value = cents;
    osc.connect(filter);
    osc.start(t);
    osc.stop(t + length);
  });
};

const compose = (ctx: BaseAudioContext, bus: AudioNode) => {
  const bar = (n: number) => n * BAR;
  const strings = new Map<number, AudioBuffer>();
  const noise = noiseBuffer(ctx, 2);
  const tri = BAR / 6;

  wind(ctx, bus, noise, 0, bar(9), 0.1);
  bass(ctx, bus, 0, bar(8), D2 / 2, 0.1, 160);
  [
    [1, 415.3],
    [3, 293.66],
    [5, 622.25],
    [6.5, 415.3],
  ].forEach(([at, freq], i) => {
    fmBell(ctx, bus, bar(at), freq, 0.09, 1.41, 4.5, i % 2 ? 0.5 : -0.5);
  });
  for (let n = 4; n < 8; n++) {
    talkingDrum(ctx, bus, bar(n), 92, 58, 0.22, 0);
    talkingDrum(ctx, bus, bar(n) + BEAT * 0.75, 88, 58, 0.14, 0);
  }

  for (let n = 8; n < 18; n++) {
    const root = ROOTS[n % 4];
    bass(ctx, bus, bar(n), BAR * 0.95, root, 0.1, 340 + (n - 8) * 45);
    for (let k = 0; k < 6; k++) {
      pluck(ctx, bus, strings, bar(n) + k * tri, OSTINATO[k], 0.2, k % 2 ? 0.35 : -0.35);
    }
    talkingDrum(ctx, bus, bar(n), 150, 74, 0.26, 0);
    talkingDrum(ctx, bus, bar(n) + BEAT * 2, 210, 110, 0.18, -0.2);
    if (n >= 12) {
      talkingDrum(ctx, bus, bar(n) + BEAT * 1.5, 250, 150, 0.13, 0.25);
      talkingDrum(ctx, bus, bar(n) + BEAT * 3, 180, 90, 0.17, 0.1);
      for (let k = 0; k < 8; k++) {
        shaker(ctx, bus, noise, bar(n) + k * (BEAT / 2), k % 2 ? 0.05 : 0.09, 0.3);
      }
    }
  }
  [10, 14].forEach((at, i) => {
    fmBell(ctx, bus, bar(at), 622.25, 0.06, 1.41, 4, i ? -0.6 : 0.6);
  });

  wind(ctx, bus, noise, bar(18), bar(8), 0.05);
  bass(ctx, bus, bar(18), bar(8), D2, 0.06, 240);
  for (let n = 18; n < 26; n++) {
    for (let k = 0; k < 6; k++) {
      const lag = n >= 20 ? 1 : 0;
      pluck(ctx, bus, strings, bar(n) + k * tri, OSTINATO[k], 0.14, -0.5);
      if (lag) {
        pluck(ctx, bus, strings, bar(n) + (k + 0.5) * tri, OSTINATO[(k + 2) % 6] * 2, 0.08, 0.5);
      }
    }
  }
  THEME_MINOR.forEach((freq, i) => {
    fmBell(ctx, bus, bar(19) + i * BEAT * 2, freq * 2, 0.11, 2, 2.4, 0);
  });
  THEME_MINOR.forEach((freq, i) => {
    fmBell(ctx, bus, bar(22) + i * BEAT * 2, freq * 2, 0.13, 3, 2.4, 0);
  });
  talkingDrum(ctx, bus, bar(25) + BEAT * 2, 130, 70, 0.2, 0);
  talkingDrum(ctx, bus, bar(25) + BEAT * 3, 170, 80, 0.24, 0);
  talkingDrum(ctx, bus, bar(25) + BEAT * 3.5, 230, 100, 0.28, 0);

  for (let n = 26; n < 37; n++) {
    const root = ROOTS_MAJOR[n % 4];
    bass(ctx, bus, bar(n), BAR * 0.5, root, 0.13, 900);
    bass(ctx, bus, bar(n) + BAR * 0.5, BAR * 0.45, root, 0.11, 700);
    for (let k = 0; k < 6; k++) {
      pluck(ctx, bus, strings, bar(n) + k * tri, OSTINATO_MAJOR[k], 0.2, k % 2 ? 0.4 : -0.4);
    }
    for (let k = 0; k < 4; k++) {
      talkingDrum(ctx, bus, bar(n) + k * BEAT, k % 2 ? 230 : 140, k % 2 ? 120 : 68, 0.27, 0);
    }
    talkingDrum(ctx, bus, bar(n) + BEAT * 2.5, 260, 150, 0.14, 0.3);
    talkingDrum(ctx, bus, bar(n) + BEAT * 3.5, 300, 170, 0.13, -0.3);
    for (let k = 0; k < 8; k++) {
      shaker(ctx, bus, noise, bar(n) + k * (BEAT / 2), k % 2 ? 0.06 : 0.11, -0.3);
    }
  }
  [26, 29, 32].forEach((start, round) => {
    THEME_MAJOR.forEach((freq, i) => {
      const octave = round === 2 ? 2 : 1;
      lead(ctx, bus, bar(start) + i * BEAT * 2, BEAT * 1.9, freq * octave, 0.05, 0);
    });
  });
  lead(ctx, bus, bar(35), BAR * 2, 587.33, 0.06, 0);
  lead(ctx, bus, bar(35), BAR * 2, 880, 0.04, 0.2);

  for (let n = 37; n < 41; n++) {
    for (let k = 0; k < 6; k++) {
      pluck(ctx, bus, strings, bar(n) + k * tri, OSTINATO_MAJOR[k], 0.13 - (n - 37) * 0.025, 0);
    }
  }
  bass(ctx, bus, bar(37), bar(4), D2, 0.07, 260);
  THEME_MAJOR.forEach((freq, i) => {
    fmBell(ctx, bus, bar(37) + i * BEAT * 2.4, freq * 2, 0.1, 2, 3, 0);
  });
  talkingDrum(ctx, bus, bar(41), 140, 60, 0.32, 0);
  bass(ctx, bus, bar(41), 4.5, D2, 0.12, 420);
  [293.66, 369.99, 440, 587.33].forEach((freq, i) => {
    fmBell(ctx, bus, bar(41), freq, 0.09, 2, 5.5, (i - 1.5) * 0.3);
  });
};

let rendered: Promise<string> | null = null;

export const renderWarriorSong = (): Promise<string> => {
  if (rendered) return rendered;
  rendered = (async () => {
    const ctx = new OfflineAudioContext(2, Math.floor(LENGTH * RATE), RATE);
    const hall = makeHall(ctx, 3.2);
    const wet = ctx.createGain();
    wet.gain.value = 0.45;
    const dry = ctx.createGain();
    dry.gain.value = 0.8;
    const bus = ctx.createGain();
    bus.connect(hall).connect(wet).connect(ctx.destination);
    bus.connect(dry).connect(ctx.destination);
    compose(ctx, bus);
    const buffer = await ctx.startRendering();
    return URL.createObjectURL(encodeWav(buffer));
  })();
  return rendered;
};
