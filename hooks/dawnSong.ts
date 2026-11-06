"use client";

import { encodeWav } from "@/hooks/journeySong";
import { makeHall } from "@/hooks/soundEffects";
import { place } from "@/hooks/warriorSong";

const RATE = 44100;
const CHORD = 6;
const CYCLE = CHORD * 6;
const LENGTH = CYCLE * 5 + 16;

const Eb4 = 311.13;
const F4 = 349.23;
const G4 = 392;
const Ab4 = 415.3;
const Bb4 = 466.16;
const C5 = 523.25;
const D5 = 587.33;
const Eb5 = 622.25;
const F5 = 698.46;
const G5 = 783.99;

const GROUND = [
  [65.41, 130.81, 196, 311.13],
  [51.91, 103.83, 207.65, 311.13],
  [87.31, 130.81, 207.65, 261.63],
  [77.78, 116.54, 196, 311.13],
  [51.91, 130.81, 207.65, 261.63],
  [58.27, 116.54, 174.61, 293.66],
];
const LOW_LINE = [G4, Ab4, F4, G4, Eb4, F4];
const MIDDLE_LINE = [C5, C5, Ab4, Bb4, C5, D5];
const HIGH_LINE = [Eb5, Eb5, C5, D5, Eb5, F5];
const HOPE_LINE = [G5, Eb5, F5, G5, Eb5, D5];
const END = [77.78, 155.56, 233.08, 311.13, 392];

export const bow = (
  ctx: BaseAudioContext,
  bus: AudioNode,
  t: number,
  length: number,
  freq: number,
  level: number,
  pan: number,
  bright: number,
) => {
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.8;
  filter.frequency.setValueAtTime(bright * 0.55, t);
  filter.frequency.linearRampToValueAtTime(bright, t + length * 0.5);
  filter.frequency.linearRampToValueAtTime(bright * 0.6, t + length);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(level, t + length * 0.42);
  gain.gain.setValueAtTime(level, t + length * 0.6);
  gain.gain.linearRampToValueAtTime(0.0001, t + length);
  filter.connect(gain).connect(place(ctx, bus, pan));

  const vibrato = ctx.createOscillator();
  const depth = ctx.createGain();
  vibrato.frequency.value = 4.7 + (freq % 7) * 0.05;
  depth.gain.setValueAtTime(0, t);
  depth.gain.linearRampToValueAtTime(7, t + length * 0.5);
  vibrato.connect(depth);
  vibrato.start(t);
  vibrato.stop(t + length);

  [-9, -3, 4, 10].forEach((cents) => {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    osc.detune.value = cents;
    depth.connect(osc.detune);
    osc.connect(filter);
    osc.start(t);
    osc.stop(t + length);
  });
};

const compose = (ctx: BaseAudioContext, bus: AudioNode) => {
  const line = (
    cycle: number,
    notes: number[],
    level: number,
    pan: number,
    bright: number,
  ) => {
    notes.forEach((freq, i) => {
      const t = cycle * CYCLE + i * CHORD - 0.6;
      bow(ctx, bus, Math.max(0, t), CHORD + 1.6, freq, level, pan, bright);
    });
  };

  for (let cycle = 0; cycle < 5; cycle++) {
    const rise = [0.55, 0.7, 0.85, 1, 0.6][cycle];
    GROUND.forEach((chord, i) => {
      const t = Math.max(0, cycle * CYCLE + i * CHORD - 0.8);
      chord.forEach((freq, k) => {
        const low = k === 0;
        bow(
          ctx,
          bus,
          t,
          CHORD + 1.8,
          freq,
          (low ? 0.024 : 0.015) * rise,
          (k - 1.5) * 0.28,
          low ? 420 : 760 + cycle * 120,
        );
      });
    });
  }

  line(1, LOW_LINE, 0.021, -0.25, 1200);
  line(2, LOW_LINE, 0.018, -0.3, 1300);
  line(2, MIDDLE_LINE, 0.024, 0.2, 1700);
  line(3, MIDDLE_LINE, 0.021, 0.3, 1800);
  line(3, HIGH_LINE, 0.026, -0.1, 2300);
  line(3, LOW_LINE, 0.016, -0.4, 1300);
  line(4, HOPE_LINE, 0.024, 0, 2500);

  const end = CYCLE * 5 - 0.8;
  END.forEach((freq, k) => {
    bow(ctx, bus, end, 14, freq, 0.02, (k - 2) * 0.25, 900);
  });
  bow(ctx, bus, end + 1, 12.5, G5, 0.019, 0, 2200);
};

let rendered: Promise<string> | null = null;

export const renderDawnSong = (): Promise<string> => {
  if (rendered) return rendered;
  rendered = (async () => {
    const ctx = new OfflineAudioContext(2, Math.floor(LENGTH * RATE), RATE);
    const hall = makeHall(ctx, 5);
    const wet = ctx.createGain();
    wet.gain.value = 0.6;
    const dry = ctx.createGain();
    dry.gain.value = 0.7;
    const bus = ctx.createGain();
    bus.connect(hall).connect(wet).connect(ctx.destination);
    bus.connect(dry).connect(ctx.destination);
    compose(ctx, bus);
    const buffer = await ctx.startRendering();
    return URL.createObjectURL(encodeWav(buffer));
  })();
  return rendered;
};
