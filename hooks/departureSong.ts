"use client";

import { encodeWav, note, pad, voice } from "@/hooks/journeySong";
import { makeHall } from "@/hooks/soundEffects";

const BAR = 4;
const LENGTH = 18 * BAR + 7;
const RATE = 44100;
const QUESTION = [659.25, 880, 987.77, 783.99, 987.77];
const CHORDS = [
  [110, 164.81, 246.94, 329.63],
  [87.31, 174.61, 261.63, 392],
  [130.81, 196, 293.66, 329.63],
  [98, 196, 246.94, 293.66],
];

const harp = (
  ctx: BaseAudioContext,
  bus: AudioNode,
  t: number,
  freq: number,
  level: number,
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(level, t + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
  osc.connect(gain).connect(bus);
  osc.start(t);
  osc.stop(t + 1.85);
};

const step = (
  ctx: BaseAudioContext,
  bus: AudioNode,
  t: number,
  level: number,
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(82, t);
  osc.frequency.exponentialRampToValueAtTime(48, t + 0.22);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(level, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
  osc.connect(gain).connect(bus);
  osc.start(t);
  osc.stop(t + 0.45);
};

const flute = (
  ctx: BaseAudioContext,
  bus: AudioNode,
  t: number,
  length: number,
  freq: number,
  level: number,
) => {
  const osc = ctx.createOscillator();
  const vibrato = ctx.createOscillator();
  const depth = ctx.createGain();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  vibrato.frequency.value = 5;
  depth.gain.setValueAtTime(0, t);
  depth.gain.linearRampToValueAtTime(freq * 0.006, t + length * 0.5);
  vibrato.connect(depth).connect(osc.frequency);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(level, t + 0.25);
  gain.gain.setValueAtTime(level, t + length * 0.7);
  gain.gain.linearRampToValueAtTime(0.0001, t + length);
  osc.connect(gain).connect(bus);
  osc.start(t);
  vibrato.start(t);
  osc.stop(t + length);
  vibrato.stop(t + length);
};

const compose = (ctx: BaseAudioContext, bus: AudioNode) => {
  const bar = (n: number) => n * BAR;

  for (let n = 0; n < 4; n += 2) {
    step(ctx, bus, bar(n) + 3, 0.12);
  }
  QUESTION.slice(0, 3).forEach((freq, i) => {
    note(ctx, bus, 0.6 + i * 2.4, freq, 0.16, 3.4);
  });
  QUESTION.slice(0, 3).forEach((freq, i) => {
    note(ctx, bus, bar(2) + 1 + i * 2.2, freq * 0.5, 0.11, 3.2);
  });

  for (let n = 4; n < 8; n++) {
    const chord = CHORDS[n % 4];
    pad(ctx, bus, bar(n), BAR, chord, 0.02, 650);
    chord.forEach((freq, k) => {
      harp(ctx, bus, bar(n) + k * 0.9, freq * 2, 0.09);
    });
    step(ctx, bus, bar(n), 0.15);
    step(ctx, bus, bar(n) + 2, 0.11);
  }
  QUESTION.forEach((freq, i) => {
    note(ctx, bus, bar(5) + i * 2.4, freq, 0.15, 3);
  });

  for (let n = 8; n < 14; n++) {
    const chord = CHORDS[n % 4];
    const lift = n >= 11 ? 0.05 : 0.036;
    pad(ctx, bus, bar(n), BAR, chord, lift, n >= 11 ? 1900 : 1200);
    note(ctx, bus, bar(n), chord[0], 0.1, 3.6);
    for (let k = 0; k < 8; k++) {
      harp(ctx, bus, bar(n) + k * 0.5, chord[k % 4] * 4, 0.05);
    }
    step(ctx, bus, bar(n), 0.17);
    step(ctx, bus, bar(n) + 1, 0.1);
    step(ctx, bus, bar(n) + 2, 0.14);
    step(ctx, bus, bar(n) + 3, 0.1);
  }
  [
    [8, 2.6, 659.25],
    [8.75, 2.6, 880],
    [9.5, 3.2, 987.77],
    [10.5, 2.4, 1046.5],
    [11.2, 3.4, 987.77],
    [12.1, 2.4, 880],
    [12.8, 4.2, 1318.51],
  ].forEach(([at, length, freq]) => {
    flute(ctx, bus, bar(at), length, freq, 0.075);
  });
  voice(ctx, bus, bar(10), BAR * 2, 659.25, 739.99, 0.03);
  voice(ctx, bus, bar(12), BAR * 2, 880, 987.77, 0.036);

  pad(ctx, bus, bar(14), BAR * 2, CHORDS[0], 0.018, 600);
  step(ctx, bus, bar(14), 0.13);
  step(ctx, bus, bar(14) + 3, 0.1);
  step(ctx, bus, bar(15) + 3, 0.08);
  QUESTION.forEach((freq, i) => {
    note(ctx, bus, bar(14) + 1 + i * 2.8, freq, 0.14, 3.4);
  });
  step(ctx, bus, bar(17) + 2, 0.06);
  note(ctx, bus, bar(17) + 2.6, 220, 0.13, 5);
  note(ctx, bus, bar(17) + 2.6, 329.63, 0.09, 5);
  note(ctx, bus, bar(17) + 2.6, 987.77, 0.07, 5);
};

let rendered: Promise<string> | null = null;

export const renderDepartureSong = (): Promise<string> => {
  if (rendered) return rendered;
  rendered = (async () => {
    const ctx = new OfflineAudioContext(2, Math.floor(LENGTH * RATE), RATE);
    const hall = makeHall(ctx, 5);
    const wet = ctx.createGain();
    wet.gain.value = 0.75;
    const dry = ctx.createGain();
    dry.gain.value = 0.55;
    const bus = ctx.createGain();
    bus.connect(hall).connect(wet).connect(ctx.destination);
    bus.connect(dry).connect(ctx.destination);
    compose(ctx, bus);
    const buffer = await ctx.startRendering();
    return URL.createObjectURL(encodeWav(buffer));
  })();
  return rendered;
};
