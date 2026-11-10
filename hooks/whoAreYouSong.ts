"use client";

import { encodeWav, note, pad, voice } from "@/hooks/journeySong";
import { makeHall } from "@/hooks/soundEffects";
import { noiseBuffer } from "@/hooks/warriorSong";

const RATE = 44100;
const EIGHTH = 60 / 122;
const BAR = EIGHTH * 6;
const HIGH = 540;
const MELODY_LENGTH = 32 * BAR;
const AMBIENT_LENGTH = 100;
const TAIL = 8;

export const N: Record<string, number> = {
  A1: 55, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98, A2: 110, B2: 123.47, C3: 130.81,
  D3: 146.83, E3: 164.81, F3: 174.61, G3: 196, A3: 220, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440,
  B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
  A5: 880, B5: 987.77, C6: 1046.5, D6: 1174.66, E6: 1318.51,
};

type ChordMap = Record<string, { bass: number; arp: number[]; block: number[] }>;

const CHORDS: ChordMap = {
  Am: { bass: N.A2, arp: [N.A2, N.E3, N.A3, N.C4, N.A3, N.E3], block: [N.A3, N.C4, N.E4] },
  F: { bass: N.F2, arp: [N.F2, N.C3, N.F3, N.A3, N.F3, N.C3], block: [N.F3, N.A3, N.C4] },
  Em: { bass: N.E2, arp: [N.E2, N.B2, N.E3, N.G3, N.E3, N.B2], block: [N.E3, N.G3, N.B3] },
  Dm: { bass: N.D2, arp: [N.D2, N.A2, N.D3, N.F3, N.D3, N.A2], block: [N.D3, N.F3, N.A3] },
  Fadd9: { bass: N.F2, arp: [N.F2, N.C3, N.G3, N.A3, N.G3, N.C3], block: [N.A3, N.C4, N.G4] },
  C: { bass: N.C3, arp: [N.C3, N.G3, N.C4, N.E4, N.C4, N.G3], block: [N.C4, N.E4, N.G4] },
  G: { bass: N.G2, arp: [N.G2, N.D3, N.G3, N.B3, N.G3, N.D3], block: [N.G3, N.B3, N.D4] },
};

export type Line = [number, number][];

export const piano = (
  ctx: BaseAudioContext,
  bus: AudioNode,
  t: number,
  freq: number,
  level: number,
  ring = 4,
) => {
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.setValueAtTime(Math.min(2600, freq * 3.2), t);
  tone.frequency.exponentialRampToValueAtTime(Math.max(260, freq * 1.3), t + ring * 0.6);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(level, t + 0.025);
  gain.gain.exponentialRampToValueAtTime(level * 0.32, t + 0.8);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + ring);
  tone.connect(gain).connect(bus);
  [
    [1, 1, -1.2],
    [1, 0.7, 1.2],
    [2, 0.3, 0],
    [3, 0.08, 0],
  ].forEach(([ratio, part, cents]) => {
    const osc = ctx.createOscillator();
    const mix = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * ratio * (1 + ratio * ratio * 0.0001);
    osc.detune.value = cents;
    mix.gain.value = part;
    osc.connect(mix).connect(tone);
    osc.start(t);
    osc.stop(t + ring + 0.05);
  });
};

const kit = (
  ctx: BaseAudioContext,
  keys: AudioNode,
  world: AudioNode,
  far: AudioNode,
  CHORDS: ChordMap,
  EIGHTH: number,
) => {
  const BAR = EIGHTH * 6;
  const ground = (start: number, length: number, tones: number[], level: number) => {
    pad(ctx, world, start, length, tones, level, 480);
    note(ctx, world, start + 0.2, tones[1], 0.06, 8);
    note(ctx, world, start + 0.2, tones[0], 0.05, 8);
  };

  const sing = (start: number, line: Line, level: number, octave = 1) => {
    let t = start;
    line.forEach(([freq, eighths]) => {
      if (freq) {
        const soft = freq * octave > HIGH ? 0.66 : 1;
        const swell = level * soft * (eighths >= 3 ? 1.1 : 0.9);
        note(ctx, keys, t, freq * octave, swell, Math.max(2.6, eighths * EIGHTH * 2.4));
        if (octave > 1) note(ctx, keys, t + 0.01, freq, swell * 0.35, 3);
      }
      t += eighths * EIGHTH;
    });
  };

  const ripple = (start: number, name: string, level: number) => {
    CHORDS[name].arp.forEach((freq, i) => {
      piano(ctx, keys, start + i * EIGHTH, freq, level * (i === 0 ? 1.25 : 0.85), 3);
    });
  };

  const pulse = (start: number, name: string, level: number) => {
    const { bass, block } = CHORDS[name];
    for (let i = 0; i < 6; i++) {
      const t = start + i * EIGHTH;
      if (i === 0 || i === 3) {
        piano(ctx, keys, t, bass / 2, level * 0.8, 2.6);
        piano(ctx, keys, t, bass, level * 0.6, 2.6);
        block.forEach((freq) => piano(ctx, keys, t + 0.006, freq, level * 0.38, 2.2));
      } else {
        piano(ctx, keys, t, block[(i + 1) % block.length], level * 0.26, 1.4);
      }
    }
  };

  const strings = (start: number, name: string, level: number, cutoff: number) => {
    const { bass, block } = CHORDS[name];
    pad(ctx, world, start, BAR, [bass, ...block], level, cutoff);
  };

  const question = (start: number, lift: number, level: number) => {
    [N.E5, N.G5, N.A5, N.B5].forEach((freq, i) => {
      piano(ctx, far, start + i * 1.6, freq * lift, level, 7);
    });
    voice(ctx, far, start + 1, 8, N.G4 * lift, N.A4 * lift, level * 0.3);
  };

  return { ground, sing, ripple, pulse, strings, question };
};

export type Kit = ReturnType<typeof kit>;

const GROUNDS: number[][] = [
  [N.A1, N.A2, N.E3],
  [N.F2 / 2, N.F2, N.C3],
  [N.C3 / 2, N.C3, N.G3],
  [N.G2 / 2, N.G2, N.D3],
  [N.A1, N.A2, N.B2],
];

const composeAmbient = (ctx: BaseAudioContext, world: AudioNode, k: Kit) => {
  for (let i = 0; i * 10 < AMBIENT_LENGTH; i++) {
    k.ground(i * 10, 11, GROUNDS[i % GROUNDS.length], 0.024);
  }
  [
    [18, 1],
    [34, 1.122],
    [58, 1],
    [78, 1.122],
  ].forEach(([t, lift]) => k.question(t, lift, 0.034));
};

const composeMelody = (ctx: BaseAudioContext, keys: AudioNode, world: AudioNode, k: Kit) => {
  const { sing, ripple, pulse, strings, question } = k;
  const floor = (start: number, name: string, level: number) =>
    pad(ctx, world, start, BAR, [CHORDS[name].bass / 2, CHORDS[name].bass], level, 420);

  const look = 0;
  const hesitant: [string, Line][] = [
    ["Am", [[N.A4, 1], [N.C5, 1], [N.E5, 3], [0, 1]]],
    ["F", [[0, 6]]],
    ["C", [[N.G4, 1], [N.C5, 1], [N.D5, 3], [0, 1]]],
    ["G", [[0, 6]]],
    ["Am", [[N.A4, 1], [N.C5, 1], [N.E5, 2], [N.G5, 1], [N.E5, 1]]],
    ["F", [[N.F5, 4], [0, 2]]],
    ["C", [[N.E5, 1], [N.G5, 1], [N.A5, 2], [N.G5, 2]]],
    ["G", [[N.D5, 2], [N.B4, 4]]],
  ];
  hesitant.forEach(([name, line], i) => {
    const start = look + i * BAR;
    ripple(start, name, 0.03 + i * 0.002);
    floor(start, name, 0.018);
    sing(start, line, 0.09);
  });

  const weight = look + 8 * BAR;
  const climb: [string, Line][] = [
    ["F", [[N.A4, 1], [N.C5, 1], [N.F5, 3], [N.E5, 1]]],
    ["C", [[N.E5, 1], [N.G5, 1], [N.C6, 4]]],
    ["G", [[N.D5, 1], [N.G5, 1], [N.B5, 3], [N.A5, 1]]],
    ["Am", [[N.A5, 1], [N.C6, 1], [N.E6, 4]]],
    ["F", [[N.C6, 1], [N.A5, 1], [N.F5, 3], [N.E5, 1]]],
    ["G", [[N.D5, 1], [N.G5, 1], [N.B5, 4]]],
    ["Fadd9", [[N.A5, 2], [N.C6, 2], [N.G5, 2]]],
    ["Fadd9", [[N.A5, 6]]],
  ];
  climb.forEach(([name, line], i) => {
    const start = weight + i * BAR;
    pulse(start, name, 0.045 + i * 0.004);
    strings(start, name, 0.016 + i * 0.003, 1200 + i * 150);
    floor(start, name, 0.016);
    sing(start, line, 0.1 + i * 0.004);
  });
  voice(ctx, world, weight + 2 * BAR, BAR * 6, N.A4, N.C5, 0.024);

  const ponder = weight + 8 * BAR;
  const circle: [string, Line][] = [
    ["Am", [[N.E5, 2], [N.D5, 1], [N.C5, 3]]],
    ["F", [[N.A4, 1], [N.C5, 1], [N.F5, 4]]],
    ["C", [[N.E5, 2], [N.G5, 1], [N.E5, 3]]],
    ["G", [[N.D5, 3], [N.B4, 3]]],
    ["Am", [[N.C5, 1], [N.E5, 1], [N.A5, 3], [N.G5, 1]]],
    ["F", [[N.F5, 2], [N.E5, 1], [N.C5, 3]]],
    ["C", [[N.G5, 1], [N.E5, 1], [N.D5, 4]]],
    ["G", [[N.B4, 6]]],
  ];
  circle.forEach(([name, line], i) => {
    const start = ponder + i * BAR;
    ripple(start, name, 0.034);
    strings(start, name, 0.012, 900);
    floor(start, name, 0.018);
    sing(start, line, 0.085);
  });
  question(ponder + 3 * BAR, 1, 0.026);

  const rise = ponder + 8 * BAR;
  const press: [string, Line][] = [
    ["Am", [[N.A4, 1], [N.C5, 1], [N.E5, 3], [N.D5, 1]]],
    ["F", [[N.C5, 1], [N.F5, 1], [N.A5, 4]]],
    ["C", [[N.G5, 1], [N.A5, 1], [N.C6, 3], [N.B5, 1]]],
    ["G", [[N.B5, 2], [N.D6, 2], [N.B5, 2]]],
    ["Am", [[N.A5, 1], [N.C6, 1], [N.E6, 4]]],
    ["F", [[N.C6, 2], [N.A5, 2], [N.F5, 2]]],
    ["C", [[N.E5, 1], [N.G5, 1], [N.C6, 2], [N.G5, 2]]],
    ["G", [[N.D5, 2], [N.B4, 2], [N.D5, 2]]],
  ];
  press.forEach(([name, line], i) => {
    const start = rise + i * BAR;
    pulse(start, name, 0.05 + i * 0.003);
    strings(start, name, 0.02 + i * 0.002, 1500 + i * 120);
    floor(start, name, 0.018);
    sing(start, line, 0.105);
  });
  voice(ctx, world, rise + 4 * BAR, BAR * 4, N.C5, N.B4, 0.024);
  note(ctx, keys, rise + 8 * BAR - EIGHTH, N.E4, 0.03, 3);
};

const rain = (ctx: BaseAudioContext, bus: AudioNode, length: number) => {
  const hiss = ctx.createBufferSource();
  hiss.buffer = noiseBuffer(ctx, 4);
  hiss.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 2400;
  band.Q.value = 0.5;
  const soften = ctx.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = 5200;
  const level = ctx.createGain();
  level.gain.value = 0.006;
  const breathe = ctx.createOscillator();
  const depth = ctx.createGain();
  breathe.frequency.value = 0.07;
  depth.gain.value = 0.0018;
  breathe.connect(depth).connect(level.gain);
  hiss.connect(band).connect(soften).connect(level).connect(bus);
  hiss.start(0);
  hiss.stop(length);
  breathe.start(0);
  breathe.stop(length);

  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let t = 2; t < length - 2; t += 0.14 + random() * 0.4) {
    const drop = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    const near = random() < 0.15;
    const freq = near ? 1400 + random() * 900 : 2800 + random() * 3200;
    drop.type = "sine";
    drop.frequency.setValueAtTime(freq, t);
    drop.frequency.exponentialRampToValueAtTime(freq * 0.7, t + 0.03);
    panner.pan.value = random() * 1.8 - 0.9;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(near ? 0.0035 : 0.0012 + random() * 0.0012, t + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + (near ? 0.06 : 0.03));
    drop.connect(gain).connect(panner).connect(bus);
    drop.start(t);
    drop.stop(t + 0.08);
  }
};

export const renderBuffer = async (
  length: number,
  compose: (ctx: BaseAudioContext, keys: AudioNode, world: AudioNode, k: Kit) => void,
  chords: ChordMap = CHORDS,
  eighth: number = EIGHTH,
  weather = true,
) => {
  const ctx = new OfflineAudioContext(2, Math.floor((length + TAIL) * RATE), RATE);
  const hall = makeHall(ctx, 5.2);
  const wet = ctx.createGain();
  wet.gain.value = 0.62;
  hall.connect(wet).connect(ctx.destination);

  const keys = ctx.createGain();
  const keysDry = ctx.createGain();
  keysDry.gain.value = 0.72;
  keys.connect(keysDry).connect(ctx.destination);
  keys.connect(hall);

  const world = ctx.createGain();
  const worldDry = ctx.createGain();
  worldDry.gain.value = 0.5;
  world.connect(worldDry).connect(ctx.destination);
  world.connect(hall);

  const far = ctx.createGain();
  far.connect(hall);

  compose(ctx, keys, world, kit(ctx, keys, world, far, chords, eighth));
  if (weather) {
    const sky = ctx.createGain();
    const skyDry = ctx.createGain();
    skyDry.gain.value = 0.35;
    sky.connect(skyDry).connect(ctx.destination);
    sky.connect(hall);
    rain(ctx, sky, length + TAIL);
  }
  return fold(await ctx.startRendering(), Math.floor(length * RATE));
};

const fold = (rendered: AudioBuffer, frames: number) => {
  const looped = new AudioBuffer({
    length: frames,
    numberOfChannels: rendered.numberOfChannels,
    sampleRate: rendered.sampleRate,
  });
  for (let c = 0; c < rendered.numberOfChannels; c++) {
    const source = rendered.getChannelData(c);
    const target = looped.getChannelData(c);
    for (let i = 0; i < frames; i++) {
      target[i] = source[i] + (frames + i < source.length ? source[frames + i] : 0);
    }
  }
  return looped;
};

export const peakOf = (buffer: AudioBuffer) => {
  let peak = 0.0001;
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
  }
  return peak;
};

let rendered: Promise<{ ambient: string; melody: string }> | null = null;

const renderPair = () => {
  if (rendered) return rendered;
  rendered = (async () => {
    const ambient = await renderBuffer(AMBIENT_LENGTH, (ctx, _keys, world, k) =>
      composeAmbient(ctx, world, k),
    );
    const melody = await renderBuffer(MELODY_LENGTH, composeMelody);
    const scale = 0.88 / Math.max(peakOf(ambient), peakOf(melody));
    return {
      ambient: URL.createObjectURL(encodeWav(ambient, scale)),
      melody: URL.createObjectURL(encodeWav(melody, scale)),
    };
  })();
  return rendered;
};

export const renderWhoAreYouAmbient = async (): Promise<string> => (await renderPair()).ambient;

export const renderWhoAreYouSong = async (): Promise<string> => (await renderPair()).melody;
