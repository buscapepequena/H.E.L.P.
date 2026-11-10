"use client";

import { CHORDS, note, pad, voice } from "@/hooks/journeySong";
import { getContext, makeHall } from "@/hooks/soundEffects";

const RISE = [587.33, 880, 739.99, 987.77, 659.25];
const GAP = 0.5;
const GLOWS = [
  [587.33, 880],
  [659.25, 987.77],
  [739.99, 1108.73],
  [880, 1318.51],
  [987.77, 1479.98, 1760],
];

export const playGlimmer = (step: number) => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime + 0.02;
  const glow = GLOWS[Math.min(step, GLOWS.length - 1)];
  const lift = step / (GLOWS.length - 1);
  const end = now + 3.4;
  const hall = makeHall(ctx, 5);
  const wet = ctx.createGain();
  wet.gain.value = 0.75;
  hall.connect(wet).connect(ctx.destination);

  const length = Math.floor(ctx.sampleRate * 3.4);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) channel[i] = Math.random() * 2 - 1;
  const air = ctx.createBufferSource();
  air.buffer = buffer;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 0.9;
  band.frequency.setValueAtTime(700 + lift * 900, now);
  band.frequency.exponentialRampToValueAtTime(1800 + lift * 2400, now + 1.1);
  band.frequency.exponentialRampToValueAtTime(900, end);
  const breath = ctx.createGain();
  breath.gain.setValueAtTime(0.0001, now);
  breath.gain.exponentialRampToValueAtTime(0.035, now + 0.6);
  breath.gain.exponentialRampToValueAtTime(0.0001, end);
  air.connect(band).connect(breath);
  breath.connect(ctx.destination);
  breath.connect(hall);
  air.start(now);
  air.stop(end);

  const light = ctx.createGain();
  light.gain.setValueAtTime(0.0001, now + 0.15);
  light.gain.exponentialRampToValueAtTime(1, now + 0.75);
  light.gain.exponentialRampToValueAtTime(0.0001, end);
  const shimmer = ctx.createOscillator();
  const depth = ctx.createGain();
  shimmer.frequency.value = 5.5 + step * 0.6;
  depth.gain.value = 0.25;
  const tremolo = ctx.createGain();
  tremolo.gain.value = 0.75;
  shimmer.connect(depth).connect(tremolo.gain);
  light.connect(tremolo);
  tremolo.connect(ctx.destination);
  tremolo.connect(hall);
  shimmer.start(now);
  shimmer.stop(end);
  glow.forEach((freq, i) => {
    [
      [1, 0.03 - i * 0.006],
      [2, 0.008],
    ].forEach(([ratio, level]) => {
      [-5, 5].forEach((cents) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq * ratio;
        osc.detune.value = cents;
        gain.gain.value = level;
        osc.connect(gain).connect(light);
        osc.start(now + 0.15);
        osc.stop(end);
      });
    });
  });
};

export const playSwoosh = (power: number) => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime + 0.02;
  const length = 0.9 + power * 0.9;
  const end = now + length;
  const hall = makeHall(ctx, 3.5);
  const wet = ctx.createGain();
  wet.gain.value = 0.55;
  hall.connect(wet).connect(ctx.destination);

  const frames = Math.floor(ctx.sampleRate * length);
  const buffer = ctx.createBuffer(2, frames, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  }
  const air = ctx.createBufferSource();
  air.buffer = buffer;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 1.6;
  band.frequency.setValueAtTime(380, now);
  band.frequency.exponentialRampToValueAtTime(3200 + power * 2600, now + length * 0.62);
  band.frequency.exponentialRampToValueAtTime(1400, end);
  const gain = ctx.createGain();
  const peak = 0.05 + power * 0.08;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + length * 0.55);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  const pan = ctx.createStereoPanner();
  pan.pan.setValueAtTime(-0.6, now);
  pan.pan.linearRampToValueAtTime(0.6, end);
  air.connect(band).connect(gain).connect(pan);
  pan.connect(ctx.destination);
  pan.connect(hall);
  air.start(now);
  air.stop(end);

  [1318.51, 1760, 2349.32].forEach((freq, i) => {
    const sparkle = ctx.createOscillator();
    const glint = ctx.createGain();
    const at = now + length * (0.45 + i * 0.1);
    sparkle.type = "sine";
    sparkle.frequency.value = freq;
    glint.gain.setValueAtTime(0.0001, at);
    glint.gain.exponentialRampToValueAtTime(0.012 * power + 0.004, at + 0.02);
    glint.gain.exponentialRampToValueAtTime(0.0001, at + 1.2);
    sparkle.connect(glint).connect(hall);
    sparkle.start(at);
    sparkle.stop(at + 1.3);
  });
};

export const playPsychic = () => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime + 0.03;
  const hall = makeHall(ctx, 4.5);
  const wet = ctx.createGain();
  wet.gain.value = 0.7;
  const dry = ctx.createGain();
  dry.gain.value = 0.5;
  const bus = ctx.createGain();
  bus.gain.value = 0.8;
  bus.connect(hall).connect(wet).connect(ctx.destination);
  bus.connect(dry).connect(ctx.destination);

  pad(ctx, bus, now, 2.6, CHORDS[1], 0.026, 1100);
  note(ctx, bus, now, CHORDS[1][0], 0.07, 3.4);
  RISE.forEach((freq, i, all) => {
    const last = i === all.length - 1;
    note(ctx, bus, now + 0.15 + i * GAP, freq, last ? 0.09 : 0.12, last ? 3.6 : 2.8);
  });
  voice(ctx, bus, now + 0.3, 2.6, 587.33, 659.25, 0.022);
};
