"use client";

import { encodeWav, pad, voice } from "@/hooks/journeySong";
import { makeHall } from "@/hooks/soundEffects";
import {
  bass,
  fmBell,
  lead,
  noiseBuffer,
  pluck,
  shaker,
  talkingDrum,
  wind,
} from "@/hooks/warriorSong";

const RATE = 44100;
const BEAT = 0.75;
const BAR = BEAT * 4;
const SIXTEENTH = BEAT / 4;
const BARS = 60;
const LENGTH = BARS * BAR + 7;

const CHORDS = [
  [146.83, 220, 293.66, 349.23],
  [130.81, 196, 261.63, 329.63],
  [116.54, 174.61, 233.08, 293.66],
  [110, 164.81, 277.18, 329.63],
];
const HOME = [146.83, 220, 293.66, 369.99, 440];
const FIGURE = [0, 2, 1, 3, 2, 1, 3, 2];
const THEME: [number, number][] = [
  [440, 4],
  [392, 2],
  [329.63, 2],
  [349.23, 2],
  [587.33, 2],
  [329.63, 2],
  [554.37, 2],
];

const organ = (
  ctx: BaseAudioContext,
  bus: AudioNode,
  t: number,
  length: number,
  freqs: number[],
  level: number,
) => {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(level, t + 0.35);
  gain.gain.setValueAtTime(level, t + length * 0.8);
  gain.gain.linearRampToValueAtTime(0.0001, t + length);
  gain.connect(bus);
  freqs.forEach((freq) => {
    [1, 2, 3, 4].forEach((partial) => {
      const osc = ctx.createOscillator();
      const mix = ctx.createGain();
      osc.frequency.value = freq * partial;
      mix.gain.value = 1 / (partial * partial);
      osc.connect(mix).connect(gain);
      osc.start(t);
      osc.stop(t + length);
    });
  });
};

const compose = (ctx: BaseAudioContext, bus: AudioNode) => {
  const strings = new Map<number, AudioBuffer>();
  const noise = noiseBuffer(ctx, 2);
  const bar = (n: number) => n * BAR;
  const chord = (n: number) => CHORDS[n % 4];

  const ostinato = (n: number, level: number, mult: number, pan: number) => {
    for (let k = 0; k < 16; k++) {
      const accent = k % 4 === 0 ? 1.25 : 1;
      pluck(
        ctx,
        bus,
        strings,
        bar(n) + k * SIXTEENTH,
        chord(n)[FIGURE[k % 8]] * mult,
        level * accent,
        pan,
      );
    }
  };

  const theme = (
    start: number,
    play: (t: number, freq: number, length: number) => void,
  ) => {
    let beat = 0;
    THEME.forEach(([freq, beats]) => {
      play(bar(start) + beat * BEAT, freq, beats * BEAT);
      beat += beats;
    });
  };

  const bell = (level: number, mult: number) =>
    (t: number, freq: number, length: number) => {
      fmBell(ctx, bus, t, freq * mult, level, 2, Math.max(2.4, length * 1.4), 0);
    };

  const sing = (level: number, mult: number) =>
    (t: number, freq: number, length: number) => {
      lead(ctx, bus, t, length * 0.96, freq * mult, level, 0);
    };

  wind(ctx, bus, noise, 0, bar(9), 0.05);
  for (let n = 0; n < 8; n++) {
    bass(ctx, bus, bar(n), BAR, chord(n)[0], 0.07, 260);
    [1.5, 2.5, 3.5].forEach((beat) => {
      pluck(ctx, bus, strings, bar(n) + beat * BEAT, chord(n)[1] * 2, 0.08, 0.3);
    });
  }
  theme(0, bell(0.1, 1));
  theme(4, bell(0.11, 1));
  fmBell(ctx, bus, bar(8), 293.66, 0.09, 1.41, 6, 0);

  for (let n = 9; n < 13; n++) {
    ostinato(n, 0.06 + (n - 9) * 0.03, 1, -0.3);
  }

  for (let n = 13; n < 19; n++) {
    bass(ctx, bus, bar(n), BAR, chord(n)[0], 0.09, 420);
    ostinato(n, 0.15, 1, -0.35);
    ostinato(n, 0.1, 2, 0.35);
    pad(ctx, bus, bar(n), BAR, chord(n), 0.02, 800);
  }

  for (let n = 19; n < 25; n++) {
    bass(ctx, bus, bar(n), BAR, chord(n)[0], 0.11, 620);
    ostinato(n, 0.16, 1, -0.35);
    ostinato(n, 0.11, 2, 0.35);
    pad(ctx, bus, bar(n), BAR, chord(n), 0.032, 1200);
    talkingDrum(ctx, bus, bar(n), 130, 68, 0.2, 0);
    talkingDrum(ctx, bus, bar(n) + BEAT * 2, 190, 96, 0.14, 0);
  }
  theme(19, sing(0.04, 1));
  voice(ctx, bus, bar(21), BAR * 3, 587.33, 659.25, 0.03);
  theme(23, sing(0.045, 1));

  for (let n = 25; n < 31; n++) {
    const swell = Math.floor((n - 25) / 2) % 2 === 0;
    bass(ctx, bus, bar(n), BAR, chord(n)[0], swell ? 0.14 : 0.09, 900);
    ostinato(n, swell ? 0.18 : 0.12, 1, -0.35);
    ostinato(n, swell ? 0.13 : 0.08, 2, 0.35);
    if (swell) {
      organ(ctx, bus, bar(n), BAR, chord(n), 0.022);
      chord(n).forEach((freq, i) => {
        fmBell(ctx, bus, bar(n), freq * 4, 0.05, 2, 2.6, (i - 1.5) * 0.3);
      });
      for (let k = 0; k < 4; k++) {
        talkingDrum(ctx, bus, bar(n) + k * BEAT, k % 2 ? 220 : 130, 70, 0.24, 0);
      }
    }
  }

  [31, 32].forEach((n, i) => {
    pad(ctx, bus, bar(n), BAR, chord(n + 1), 0.03, 700);
    chord(n + 1).forEach((freq) => {
      fmBell(ctx, bus, bar(n), freq * 2, 0.04 - i * 0.008, 1, 3, 0);
    });
  });
  pad(ctx, bus, bar(33), BAR * 1.4, CHORDS[0], 0.024, 520);
  fmBell(ctx, bus, bar(33), 293.66, 0.08, 1, 5, 0);

  [
    [34.5, 880],
    [35.5, 783.99],
    [36.5, 698.46],
    [37.2, 659.25],
  ].forEach(([at, freq]) => {
    fmBell(ctx, bus, bar(at), freq, 0.09, 2, 3.4, 0);
  });
  bass(ctx, bus, bar(34), BAR * 4, 73.42, 0.05, 200);

  for (let n = 38; n < 45; n++) {
    const rise = (n - 38) / 6;
    bass(ctx, bus, bar(n), BAR, chord(n)[0], 0.07 + rise * 0.05, 400 + rise * 500);
    ostinato(n, 0.08 + rise * 0.09, 2, 0);
    pad(ctx, bus, bar(n), BAR, chord(n), 0.012 + rise * 0.02, 900);
  }
  theme(38, sing(0.03, 2));
  voice(ctx, bus, bar(42), BAR * 3, 880, 987.77, 0.03);

  [45, 46, 47].forEach((n) => {
    organ(ctx, bus, bar(n), BAR, chord(n), 0.012);
    pad(ctx, bus, bar(n), BAR, chord(n), 0.03, 1000);
    fmBell(ctx, bus, bar(n), chord(n)[3] * 2, 0.07, 2, 3, 0);
  });

  for (let n = 48; n < 56; n++) {
    bass(ctx, bus, bar(n), BAR * 0.5, chord(n)[0], 0.15, 1000);
    bass(ctx, bus, bar(n) + BAR * 0.5, BAR * 0.48, chord(n)[0], 0.12, 800);
    organ(ctx, bus, bar(n), BAR, chord(n), 0.016);
    pad(ctx, bus, bar(n), BAR, chord(n), 0.05, 2200);
    ostinato(n, 0.17, 2, -0.35);
    ostinato(n, 0.12, 4, 0.35);
    for (let k = 0; k < 4; k++) {
      talkingDrum(ctx, bus, bar(n) + k * BEAT, k % 2 ? 240 : 140, 70, 0.27, 0);
    }
    talkingDrum(ctx, bus, bar(n) + BEAT * 2.5, 280, 160, 0.14, 0.3);
    talkingDrum(ctx, bus, bar(n) + BEAT * 3.5, 310, 170, 0.14, -0.3);
    for (let k = 0; k < 8; k++) {
      shaker(ctx, bus, noise, bar(n) + k * (BEAT / 2), k % 2 ? 0.06 : 0.11, 0.2);
    }
  }
  theme(48, sing(0.05, 2));
  theme(52, sing(0.055, 2));
  voice(ctx, bus, bar(52), BAR * 4, 880, 1174.66, 0.04);

  for (let n = 56; n < 59; n++) {
    const tones = n === 58 ? HOME : chord(n);
    const sweep = [...tones, ...tones.map((f) => f * 2)];
    const path = [...sweep, ...[...sweep].reverse()];
    path.forEach((freq, k) => {
      pluck(ctx, bus, strings, bar(n) + k * SIXTEENTH, freq, 0.19, (k / path.length - 0.5) * 1.2);
    });
    bass(ctx, bus, bar(n), BAR, tones[0], 0.12, 700);
    pad(ctx, bus, bar(n), BAR, tones, 0.04, 1600);
  }

  organ(ctx, bus, bar(59), 6, HOME, 0.018);
  pad(ctx, bus, bar(59), 5, HOME, 0.05, 1400);
  bass(ctx, bus, bar(59), 6, 73.42, 0.1, 420);
  talkingDrum(ctx, bus, bar(59), 130, 58, 0.3, 0);
  HOME.forEach((freq, i) => {
    fmBell(ctx, bus, bar(59), freq * 2, 0.08, 2, 6, (i - 2) * 0.25);
  });
};

let rendered: Promise<string> | null = null;

export const renderDepthsSong = (): Promise<string> => {
  if (rendered) return rendered;
  rendered = (async () => {
    const ctx = new OfflineAudioContext(2, Math.floor(LENGTH * RATE), RATE);
    const hall = makeHall(ctx, 3.6);
    const wet = ctx.createGain();
    wet.gain.value = 0.5;
    const dry = ctx.createGain();
    dry.gain.value = 0.75;
    const bus = ctx.createGain();
    bus.connect(hall).connect(wet).connect(ctx.destination);
    bus.connect(dry).connect(ctx.destination);
    compose(ctx, bus);
    const buffer = await ctx.startRendering();
    return URL.createObjectURL(encodeWav(buffer));
  })();
  return rendered;
};
