"use client";

import {
  BAR,
  CHORDS,
  THEME,
  encodeWav,
  note,
  pad,
  voice,
} from "@/hooks/journeySong";
import { makeHall } from "@/hooks/soundEffects";

const RATE = 44100;
const LENGTH = 48 * BAR + 7.2;

const compose = (ctx: BaseAudioContext, bus: AudioNode) => {
  const bar = (n: number) => n * BAR;

  const theme = (
    start: number,
    scale: number,
    level: number,
    gap: number,
    decay: number,
  ) => {
    THEME.forEach((freq, i) => {
      note(ctx, bus, start + i * gap, freq * scale, level, decay);
    });
  };

  const verse = (from: number, to: number, level: number, cutoff: number) => {
    for (let n = from; n < to; n++) {
      pad(ctx, bus, bar(n), BAR, CHORDS[n % 4], level, cutoff);
      note(ctx, bus, bar(n), CHORDS[n % 4][0] * 2, 0.08, 3);
    }
  };

  const surge = (
    from: number,
    to: number,
    level: number,
    cutoff: number,
    steps: number,
    tone: number,
  ) => {
    for (let n = from; n < to; n++) {
      const chord = CHORDS[n % 4];
      pad(ctx, bus, bar(n), BAR, chord, level, cutoff);
      note(ctx, bus, bar(n), chord[0], 0.13, 3.4);
      for (let k = 0; k < steps; k++) {
        const freq = chord[1 + (k % 4)] * 2;
        note(ctx, bus, bar(n) + k * (BAR / steps), freq, tone, 1.3);
      }
    }
  };

  theme(0.4, 1, 0.17, 2.7, 3.2);
  pad(ctx, bus, bar(2), BAR * 2, CHORDS[2], 0.012, 500);

  verse(4, 8, 0.03, 900);
  theme(bar(4) + 0.9, 1, 0.17, 2.2, 2.6);
  voice(ctx, bus, bar(5), BAR * 2, 587.33, 659.25, 0.035);
  voice(ctx, bus, bar(7), BAR, 739.99, 659.25, 0.03);

  surge(8, 12, 0.042, 1300, 4, 0.035);
  theme(bar(8) + 0.4, 1, 0.15, 2.7, 3);
  voice(ctx, bus, bar(9), BAR * 2, 587.33, 739.99, 0.035);
  voice(ctx, bus, bar(11), BAR, 880, 739.99, 0.03);

  pad(ctx, bus, bar(12), BAR * 4, CHORDS[0], 0.02, 650);
  THEME.slice(0, 3).forEach((freq, i) => {
    note(ctx, bus, bar(12) + 0.6 + i * 3.4, freq, 0.14, 3.4);
  });
  note(ctx, bus, bar(15), 293.66, 0.12, 4);

  surge(16, 24, 0.058, 1900, 8, 0.05);
  theme(bar(16) + 0.4, 2, 0.13, 2.7, 3);
  theme(bar(20) + 0.4, 2, 0.13, 2.7, 3);
  voice(ctx, bus, bar(16), BAR * 2, 880, 987.77, 0.04);
  voice(ctx, bus, bar(18), BAR * 2, 739.99, 880, 0.04);
  voice(ctx, bus, bar(20), BAR * 2, 987.77, 880, 0.04);
  voice(ctx, bus, bar(22), BAR * 2, 739.99, 659.25, 0.04);

  pad(ctx, bus, bar(24), BAR * 4, CHORDS[3], 0.018, 600);
  [...THEME].reverse().forEach((freq, i) => {
    note(ctx, bus, bar(24) + 0.8 + i * 2.7, freq, 0.14, 3.4);
  });
  voice(ctx, bus, bar(25), BAR * 2, 659.25, 587.33, 0.03);

  verse(28, 32, 0.04, 1200);
  theme(bar(28) + 0.9, 1, 0.16, 2.2, 2.6);
  voice(ctx, bus, bar(29), BAR * 2, 587.33, 739.99, 0.038);

  surge(32, 40, 0.064, 2300, 8, 0.055);
  theme(bar(32) + 0.4, 2, 0.14, 2.7, 3);
  theme(bar(34) + 0.4, 1, 0.1, 2.7, 3);
  theme(bar(36) + 0.4, 2, 0.14, 2.7, 3);
  voice(ctx, bus, bar(32), BAR * 2, 987.77, 1174.66, 0.042);
  voice(ctx, bus, bar(34), BAR * 2, 880, 987.77, 0.042);
  voice(ctx, bus, bar(36), BAR * 2, 987.77, 1174.66, 0.042);
  voice(ctx, bus, bar(38), BAR * 2, 880, 739.99, 0.04);

  surge(40, 44, 0.034, 1100, 4, 0.03);
  theme(bar(40) + 0.6, 1, 0.13, 2.7, 3.2);

  pad(ctx, bus, bar(44), BAR * 2, CHORDS[0], 0.022, 700);
  THEME.slice(0, 4).forEach((freq, i) => {
    note(ctx, bus, bar(44) + 0.6 + i * 3, freq, 0.15, 3.4);
  });
  note(ctx, bus, bar(47) + 0.4, 293.66, 0.17, 5);
  note(ctx, bus, bar(47) + 0.4, 587.33, 0.1, 5);
};

let rendered: Promise<string> | null = null;

export const renderJourneyLongSong = (): Promise<string> => {
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
