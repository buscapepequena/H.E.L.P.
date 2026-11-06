"use client";

import { makeHall } from "@/hooks/soundEffects";

const BAR = 3.6;
const LENGTH = 16 * BAR + 6;
const RATE = 44100;
const THEME = [587.33, 880, 739.99, 987.77, 659.25];
const CHORDS = [
  [146.83, 220, 293.66, 329.63, 440],
  [123.47, 185, 293.66, 369.99, 440],
  [98, 196, 293.66, 392, 493.88],
  [110, 220, 329.63, 440, 493.88],
];

export const note = (
  ctx: BaseAudioContext,
  bus: AudioNode,
  t: number,
  freq: number,
  level: number,
  decay = 2.6,
) => {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(level, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  gain.connect(bus);
  [
    { ratio: 1, type: "triangle" as OscillatorType, part: 1 },
    { ratio: 2, type: "sine" as OscillatorType, part: 0.28 },
  ].forEach(({ ratio, type, part }) => {
    const osc = ctx.createOscillator();
    const mix = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq * ratio;
    mix.gain.value = part;
    osc.connect(mix).connect(gain);
    osc.start(t);
    osc.stop(t + decay + 0.05);
  });
};

export const pad = (
  ctx: BaseAudioContext,
  bus: AudioNode,
  t: number,
  length: number,
  freqs: number[],
  level: number,
  cutoff: number,
) => {
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(cutoff * 0.5, t);
  filter.frequency.linearRampToValueAtTime(cutoff, t + length * 0.6);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(level, t + length * 0.4);
  gain.gain.setValueAtTime(level, t + length * 0.7);
  gain.gain.linearRampToValueAtTime(0.0001, t + length + 1.2);
  filter.connect(gain).connect(bus);
  freqs.forEach((freq, i) => {
    [-4, 4].forEach((cents) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 ? "sine" : "triangle";
      osc.frequency.value = freq;
      osc.detune.value = cents;
      osc.connect(filter);
      osc.start(t);
      osc.stop(t + length + 1.3);
    });
  });
};

export const voice = (
  ctx: BaseAudioContext,
  bus: AudioNode,
  t: number,
  length: number,
  from: number,
  to: number,
  level: number,
) => {
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.setValueAtTime(from, t + length * 0.45);
  osc.frequency.linearRampToValueAtTime(to, t + length * 0.62);
  const vibrato = ctx.createOscillator();
  const depth = ctx.createGain();
  vibrato.frequency.value = 4.6;
  depth.gain.value = 5;
  vibrato.connect(depth).connect(osc.frequency);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(level, t + length * 0.4);
  gain.gain.linearRampToValueAtTime(0.0001, t + length);
  [
    [750, 7],
    [1150, 9],
  ].forEach(([freq, q]) => {
    const formant = ctx.createBiquadFilter();
    formant.type = "bandpass";
    formant.frequency.value = freq;
    formant.Q.value = q;
    osc.connect(formant).connect(gain);
  });
  gain.connect(bus);
  osc.start(t);
  vibrato.start(t);
  osc.stop(t + length);
  vibrato.stop(t + length);
};

const compose = (ctx: BaseAudioContext, bus: AudioNode) => {
  const bar = (n: number) => n * BAR;

  THEME.forEach((freq, i) => {
    note(ctx, bus, 0.4 + i * 2.7, freq, 0.17, 3.2);
  });
  pad(ctx, bus, bar(2), BAR * 2, CHORDS[2], 0.012, 500);

  for (let n = 4; n < 8; n++) {
    pad(ctx, bus, bar(n), BAR, CHORDS[n % 4], 0.03, 900);
    note(ctx, bus, bar(n), CHORDS[n % 4][0] * 2, 0.08, 3);
  }
  THEME.forEach((freq, i) => {
    note(ctx, bus, bar(4) + 0.9 + i * 2.2, freq, 0.17);
  });
  voice(ctx, bus, bar(5), BAR * 2, 587.33, 659.25, 0.035);
  voice(ctx, bus, bar(7), BAR, 739.99, 659.25, 0.03);

  for (let n = 8; n < 12; n++) {
    const chord = CHORDS[n % 4];
    pad(ctx, bus, bar(n), BAR, chord, 0.058, 1900);
    note(ctx, bus, bar(n), chord[0], 0.13, 3.4);
    for (let k = 0; k < 8; k++) {
      const tone = chord[1 + (k % 4)] * 2;
      note(ctx, bus, bar(n) + k * (BAR / 8), tone, 0.05, 1.3);
    }
  }
  THEME.forEach((freq, i) => {
    note(ctx, bus, bar(8) + 0.4 + i * 2.7, freq * 2, 0.13, 3);
  });
  voice(ctx, bus, bar(8), BAR * 2, 880, 987.77, 0.04);
  voice(ctx, bus, bar(10), BAR * 2, 739.99, 880, 0.04);

  pad(ctx, bus, bar(12), BAR * 2, CHORDS[0], 0.022, 700);
  THEME.slice(0, 4).forEach((freq, i) => {
    note(ctx, bus, bar(12) + 0.6 + i * 3, freq, 0.15, 3.4);
  });
  note(ctx, bus, bar(15) + 0.4, 293.66, 0.17, 5);
  note(ctx, bus, bar(15) + 0.4, 587.33, 0.1, 5);
};

export const encodeWav = (buffer: AudioBuffer): Blob => {
  const channels = buffer.numberOfChannels;
  const frames = buffer.length;
  const bytes = frames * channels * 2;
  const view = new DataView(new ArrayBuffer(44 + bytes));
  const text = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };
  text(0, "RIFF");
  view.setUint32(4, 36 + bytes, true);
  text(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, bytes, true);
  const data = Array.from({ length: channels }, (_, c) =>
    buffer.getChannelData(c),
  );
  let peak = 0.0001;
  data.forEach((channel) => {
    for (let i = 0; i < frames; i++) {
      peak = Math.max(peak, Math.abs(channel[i]));
    }
  });
  const scale = 0.88 / peak;
  let offset = 44;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < channels; c++) {
      view.setInt16(offset, data[c][i] * scale * 32767, true);
      offset += 2;
    }
  }
  return new Blob([view], { type: "audio/wav" });
};

let rendered: Promise<string> | null = null;

export const renderJourneySong = (): Promise<string> => {
  if (rendered) return rendered;
  rendered = (async () => {
    const ctx = new OfflineAudioContext(2, Math.floor(LENGTH * RATE), RATE);
    const hall = makeHall(ctx, 4.5);
    const wet = ctx.createGain();
    wet.gain.value = 0.7;
    const dry = ctx.createGain();
    dry.gain.value = 0.6;
    const bus = ctx.createGain();
    bus.connect(hall).connect(wet).connect(ctx.destination);
    bus.connect(dry).connect(ctx.destination);
    compose(ctx, bus);
    const buffer = await ctx.startRendering();
    return URL.createObjectURL(encodeWav(buffer));
  })();
  return rendered;
};
