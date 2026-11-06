"use client";

import { bow } from "@/hooks/dawnSong";
import { encodeWav, note, pad } from "@/hooks/journeySong";
import { makeHall } from "@/hooks/soundEffects";
import {
  noiseBuffer,
  pluck,
  shaker,
  talkingDrum,
} from "@/hooks/warriorSong";
import { MirrorsVersion } from "@/types/music";

const RATE = 44100;
const CHORD = 4;
const STEPS = 48;
const CENTER = STEPS / 2;
const LENGTH = STEPS * CHORD + 18;

const A = [55, 110, 220, 261.63, 329.63];
const F = [43.65, 87.31, 220, 261.63, 349.23];
const C = [65.41, 130.81, 196, 261.63, 329.63];
const G = [49, 98, 196, 246.94, 293.66];
const E = [41.2, 82.41, 196, 246.94, 329.63];
const D = [73.42, 146.83, 220, 293.66, 349.23];
const D_BRIGHT = [73.42, 146.83, 220, 293.66, 369.99];

const SCALE = [440, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99];
const MOTIF = [0, 2, 3, 2, 4, 3];

const VERSIONS: Record<"first" | "pulse" | "chamber", MirrorsVersion> = {
  first: {
    turn: E,
    undulate: false,
    pulse: false,
    keys: true,
    synth: true,
    room: 5.5,
    wet: 0.65,
    dry: 0.68,
  },
  pulse: {
    turn: D_BRIGHT,
    undulate: true,
    pulse: true,
    keys: true,
    synth: true,
    room: 5.5,
    wet: 0.65,
    dry: 0.68,
  },
  chamber: {
    turn: D_BRIGHT,
    undulate: true,
    pulse: false,
    keys: false,
    synth: false,
    room: 2.6,
    wet: 0.42,
    dry: 0.85,
  },
};

const degree = (step: number): number => {
  const octave = Math.floor(step / 7);
  const index = ((step % 7) + 7) % 7;
  return SCALE[index] * Math.pow(2, octave);
};

const compose = (
  ctx: BaseAudioContext,
  bus: AudioNode,
  far: AudioNode,
  version: MirrorsVersion,
) => {
  const strings = new Map<number, AudioBuffer>();
  const noise = noiseBuffer(ctx, 2);
  const half = [A, F, C, G, A, E, F, D, A, version.turn, F, G];
  const sequence = [...half, ...[...half].reverse()];
  const near = (i: number) => 1 - Math.abs(i + 0.5 - CENTER) / CENTER;
  const motifStep = (i: number, part: number) => {
    const position = (i * 2 + part) % 6;
    return MOTIF[i < CENTER ? position : 5 - position];
  };

  for (let i = 0; i < STEPS; i++) {
    const chord = sequence[i % 24];
    const t = Math.max(0, i * CHORD - 0.6);
    const lift = 0.5 + near(i) * 0.6;

    chord.slice(0, 2).forEach((freq, k) => {
      bow(ctx, bus, t, CHORD + 1.4, freq, 0.024 * lift, k ? 0.2 : -0.2, 340);
    });
    chord.slice(2).forEach((freq, k) => {
      bow(ctx, bus, t, CHORD + 1.4, freq, 0.012 * lift, (k - 1) * 0.35, 720);
    });

    if (version.undulate && i >= 3 && i < STEPS - 3) {
      for (let k = 0; k < 8; k++) {
        const swing = Math.sin(((i * 8 + k) / 16) * Math.PI);
        pluck(
          ctx,
          bus,
          strings,
          i * CHORD + k * (CHORD / 8),
          chord[2 + (k % 3)] * 2,
          0.026 + near(i) * 0.03,
          swing * 0.7,
        );
      }
    }

    if (version.pulse && i >= 16 && i < STEPS - 16) {
      const pulse = 1 - Math.abs(i + 0.5 - CENTER) / 8;
      for (let k = 0; k < 4; k++) {
        talkingDrum(ctx, bus, i * CHORD + k, 66, 40, 0.09 + pulse * 0.17, 0);
        if (pulse > 0.3) {
          talkingDrum(ctx, far, i * CHORD + k + 0.5, 120, 80, 0.05 * pulse, 0);
          shaker(ctx, bus, noise, i * CHORD + k + 0.5, 0.03 * pulse, 0.3);
        }
      }
    }

    if (i >= 6 && i < STEPS - 6) {
      [0, 1].forEach((part) => {
        const at = i * CHORD + part * (CHORD / 2);
        const step = motifStep(i, part);
        if (version.keys) {
          note(ctx, bus, at, degree(step) / 2, 0.075, 3);
          note(ctx, far, at + 1, degree(-step) / 2, 0.05, 3);
        } else {
          bow(ctx, bus, at - 0.2, CHORD / 2 + 0.8, degree(step) / 2, 0.016, -0.4, 1000);
          bow(ctx, bus, at + 0.8, CHORD / 2 + 0.8, degree(-step) / 2, 0.012, 0.4, 900);
        }
      });
    }

    if (i >= 12 && i < STEPS - 12) {
      bow(ctx, bus, t, CHORD + 1.4, chord[3] * 2, 0.014 * lift, -0.3, 1300);
      bow(ctx, bus, t, CHORD + 1.4, chord[4], 0.014 * lift, 0.3, 1300);
    }

    if (i >= 18 && i < STEPS - 18) {
      [0, 1].forEach((part) => {
        const at = i * CHORD + part * (CHORD / 2) - 0.2;
        const step = motifStep(i, part);
        bow(ctx, bus, at, CHORD / 2 + 0.9, degree(step), 0.024, -0.75, 2300);
        bow(ctx, bus, at + 0.5, CHORD / 2 + 0.9, degree(-step), 0.021, 0.75, 2100);
      });
    }
  }

  if (version.synth) {
    pad(ctx, far, 0, STEPS * CHORD, [880, 1318.51], 0.0035, 2400);
  }

  const end = STEPS * CHORD - 0.6;
  A.forEach((freq, k) => {
    bow(ctx, bus, end, 16, freq, k < 2 ? 0.024 : 0.012, (k - 2) * 0.25, k < 2 ? 340 : 700);
  });
  if (version.keys) note(ctx, far, end + 3, 220, 0.07, 6);
};

const render = async (version: MirrorsVersion): Promise<string> => {
  const ctx = new OfflineAudioContext(2, Math.floor(LENGTH * RATE), RATE);
  const hall = makeHall(ctx, version.room);
  const wet = ctx.createGain();
  wet.gain.value = version.wet;
  const dry = ctx.createGain();
  dry.gain.value = version.dry;
  const bus = ctx.createGain();
  bus.connect(hall).connect(wet).connect(ctx.destination);
  bus.connect(dry).connect(ctx.destination);
  const far = ctx.createGain();
  far.connect(hall);
  compose(ctx, bus, far, version);
  const buffer = await ctx.startRendering();
  return URL.createObjectURL(encodeWav(buffer));
};

const once = (version: MirrorsVersion) => {
  let rendered: Promise<string> | null = null;
  return () => {
    if (!rendered) rendered = render(version);
    return rendered;
  };
};

export const renderMirrorsFirst = once(VERSIONS.first);
export const renderMirrorsPulse = once(VERSIONS.pulse);
export const renderMirrorsChamber = once(VERSIONS.chamber);
