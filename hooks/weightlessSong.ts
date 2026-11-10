"use client";

import { encodeWav, voice } from "@/hooks/journeySong";
import { noiseBuffer } from "@/hooks/warriorSong";
import { peakOf, renderBuffer } from "@/hooks/whoAreYouSong";
import { PhraseNote, WeightlessShape } from "@/types/music";

const LENGTH = 64;
const RISE_END = 14;
const CLIMAX_END = 32;
const SLOW_END = 46;
const HEART = 60 / 48;

const LONG_LENGTH = 160;
const BUILD_FROM = 54;
const LOUD_AT = 72;
const LIFT_AT = 104;
const LOUD_END = 136;
const RELEASE_END = 152;
const LIFT = 2;
const DRIVE = 0.75;

export const WEIGHTLESS_CLIMAX = CLIMAX_END;
export const WEIGHTLESS_ROUND = LENGTH;

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

const energy = (t: number) => {
  if (t < RISE_END) return 0.15 + 0.85 * (t / RISE_END) ** 1.8;
  if (t < CLIMAX_END) return 1;
  if (t < SLOW_END) return 1 - 0.75 * ((t - CLIMAX_END) / (SLOW_END - CLIMAX_END));
  return Math.max(0.12, 0.25 - 0.13 * ((t - SLOW_END) / (LENGTH - SLOW_END)));
};

const bend = (t: number) => {
  if (t < CLIMAX_END) return 0;
  if (t < SLOW_END) return -140 * ((t - CLIMAX_END) / (SLOW_END - CLIMAX_END)) ** 1.5;
  if (t < LENGTH) return -140 * (1 - (t - SLOW_END) / (LENGTH - SLOW_END));
  return 0;
};

const CHORDS = [
  [47, 54, 59, 63, 66, 71, 75],
  [44, 51, 56, 59, 63, 68, 71],
  [40, 47, 52, 56, 59, 64, 68],
  [42, 49, 54, 58, 61, 66, 70],
];

const cycle = (t: number) => CHORDS[Math.floor(t / 8) % CHORDS.length];

const soarShort = (t: number) => (t > RISE_END * 0.6 ? energy(t) : 0) * (t > SLOW_END ? 0.6 : 1);

const shimmerShort = (t: number) =>
  t < CLIMAX_END ? 0 : t < SLOW_END ? (t - CLIMAX_END) / (SLOW_END - CLIMAX_END) : 1 - 0.7 * ((t - SLOW_END) / (LENGTH - SLOW_END));

const SHORT: WeightlessShape = {
  length: LENGTH,
  energy,
  bend,
  lift: () => 0,
  chordAt: cycle,
  soar: soarShort,
  shimmer: shimmerShort,
};

const longEnergy = (t: number) => {
  if (t < BUILD_FROM) return energy(t);
  const base = energy(BUILD_FROM);
  if (t < LOUD_AT) return base + (1 - base) * ((t - BUILD_FROM) / (LOUD_AT - BUILD_FROM)) ** 1.4;
  if (t < LOUD_END) return 1;
  if (t < RELEASE_END) return 1 - 0.75 * ((t - LOUD_END) / (RELEASE_END - LOUD_END));
  return 0.25 * Math.max(0, 1 - (t - RELEASE_END) / (LONG_LENGTH - 2 - RELEASE_END)) ** 1.5;
};

const LONG: WeightlessShape = {
  length: LONG_LENGTH,
  energy: longEnergy,
  bend,
  lift: (t) => (t >= LIFT_AT && t < LOUD_END ? LIFT : 0),
  chordAt: (t) => {
    if (t < BUILD_FROM + 2) return cycle(t);
    if (t < LOUD_AT) return CHORDS[3];
    if (t < LOUD_END) return cycle(t - LOUD_AT);
    if (t >= LOUD_END + 8 && t < LOUD_END + 16) return CHORDS[2];
    return CHORDS[0];
  },
  soar: (t) => {
    if (t < BUILD_FROM) return soarShort(t);
    if (t < LOUD_AT) return longEnergy(t) * 0.8;
    if (t < LOUD_END) return 1.15;
    return longEnergy(t) * 0.8;
  },
  shimmer: (t) => {
    if (t < LENGTH) return shimmerShort(t);
    return shimmerShort(LENGTH - 0.01) * Math.max(0, 1 - (t - LENGTH) / 6);
  },
};

const follow = (param: AudioParam, length: number, shape: (t: number) => number, scale: number, floor = 0.0001) => {
  param.setValueAtTime(Math.max(floor, shape(0) * scale), 0);
  for (let t = 0.5; t <= length; t += 0.5) {
    param.linearRampToValueAtTime(Math.max(floor, shape(t) * scale), t);
  }
};

const tremoloStrings = (ctx: BaseAudioContext, bus: AudioNode, shape: WeightlessShape, level: number) => {
  const span = 8;
  for (let i = 0; i < shape.length / span; i++) {
    const start = i * span;
    const middle = start + span / 2;
    const chord = shape.chordAt(start).map((midi) => midi + shape.lift(start));
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900 + 3200 * shape.energy(middle);
    const gain = ctx.createGain();
    const peak = Math.max(0.0002, level * shape.energy(middle));
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(peak, start + 2.2);
    gain.gain.setValueAtTime(peak, start + span);
    gain.gain.linearRampToValueAtTime(0.0001, start + span + 2.4);
    const shake = ctx.createGain();
    shake.gain.value = 0.55;
    const flutter = ctx.createOscillator();
    const depth = ctx.createGain();
    flutter.frequency.value = 12;
    depth.gain.value = 0.45 * Math.min(1, shape.energy(middle) * 1.2);
    flutter.connect(depth).connect(shake.gain);
    flutter.start(start);
    flutter.stop(start + span + 2.5);
    filter.connect(shake).connect(gain).connect(bus);
    chord.forEach((midi, k) => {
      [
        [-8, -0.8],
        [8, 0.8],
      ].forEach(([cents, side]) => {
        const osc = ctx.createOscillator();
        const pan = ctx.createStereoPanner();
        osc.type = k < 2 ? "triangle" : "sawtooth";
        osc.frequency.value = hz(midi);
        osc.detune.setValueAtTime(cents + shape.bend(start), start);
        osc.detune.linearRampToValueAtTime(cents + shape.bend(start + span + 2.5), start + span + 2.5);
        pan.pan.value = side;
        osc.connect(pan).connect(filter);
        osc.start(start);
        osc.stop(start + span + 2.5);
      });
    });
  }
};

const brass = (ctx: BaseAudioContext, bus: AudioNode, shape: WeightlessShape, from: number, to: number, level: number) => {
  const span = 8;
  for (let start = from; start < to; start += span) {
    const chord = shape.chordAt(start).map((midi) => midi + shape.lift(start));
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 2;
    filter.frequency.setValueAtTime(320, start);
    filter.frequency.linearRampToValueAtTime(1300, start + 3);
    filter.frequency.linearRampToValueAtTime(800, start + span);
    const gain = ctx.createGain();
    const peak = level * shape.energy(start + span / 2);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(peak, start + 1.4);
    gain.gain.setValueAtTime(peak, start + span - 0.3);
    gain.gain.linearRampToValueAtTime(0.0001, start + span + 1.2);
    filter.connect(gain).connect(bus);
    [chord[0], chord[1], chord[0] + 12, chord[2]].forEach((midi, k) => {
      [-5, 5].forEach((cents, side) => {
        const osc = ctx.createOscillator();
        const pan = ctx.createStereoPanner();
        osc.type = "sawtooth";
        osc.frequency.value = hz(midi);
        osc.detune.value = cents + k * 2;
        pan.pan.value = side ? 0.35 : -0.35;
        osc.connect(pan).connect(filter);
        osc.start(start);
        osc.stop(start + span + 1.3);
      });
    });
  }
};

const soaring = (ctx: BaseAudioContext, bus: AudioNode, shape: WeightlessShape, level: number) => {
  [
    [90, -0.3],
    [87, 0.3],
    [83, 0],
  ].forEach(([midi, side], i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const pan = ctx.createStereoPanner();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 4200;
    osc.type = "sawtooth";
    osc.frequency.value = hz(midi);
    follow(osc.detune, shape.length, (t) => shape.bend(t) + 100 * shape.lift(t), 1, -1000);
    const vibrato = ctx.createOscillator();
    const depth = ctx.createGain();
    vibrato.frequency.value = 5.4 + i * 0.3;
    depth.gain.value = hz(midi) * 0.005;
    vibrato.connect(depth).connect(osc.frequency);
    follow(gain.gain, shape.length, shape.soar, level);
    pan.pan.value = side;
    osc.connect(filter).connect(gain).connect(pan).connect(bus);
    [osc, vibrato].forEach((node) => {
      node.start(0);
      node.stop(shape.length);
    });
  });
};

const harp = (ctx: BaseAudioContext, bus: AudioNode, shape: WeightlessShape, start: number, level: number) => {
  const chord = shape.chordAt(start).map((midi) => midi + shape.lift(start));
  const tones = [...chord.slice(2), ...chord.slice(2).map((m) => m + 12), chord[2] + 24];
  tones.forEach((midi, i) => {
    const t = start + i * 0.055;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const pan = ctx.createStereoPanner();
    osc.type = "triangle";
    osc.frequency.value = hz(midi);
    osc.detune.value = shape.bend(t);
    pan.pan.value = -0.7 + (1.4 * i) / (tones.length - 1);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(level, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    osc.connect(gain).connect(pan).connect(bus);
    osc.start(t);
    osc.stop(t + 2.5);
  });
};

const timpani = (ctx: BaseAudioContext, bus: AudioNode, start: number, length: number, level: number) => {
  const drum = ctx.createOscillator();
  drum.type = "sine";
  drum.frequency.value = hz(35);
  const body = ctx.createGain();
  body.gain.value = 0.6;
  const roll = ctx.createOscillator();
  const depth = ctx.createGain();
  roll.frequency.value = 15;
  depth.gain.value = 0.4;
  roll.connect(depth).connect(body.gain);
  const skin = ctx.createBufferSource();
  skin.buffer = noiseBuffer(ctx, Math.ceil(length) + 2);
  const low = ctx.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = 240;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(level, start + length * 0.8);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length + 1);
  drum.connect(body);
  skin.connect(low).connect(body);
  body.connect(gain).connect(bus);
  [drum, roll, skin].forEach((node) => {
    node.start(start);
    node.stop(start + length + 1.1);
  });
};

const hit = (ctx: BaseAudioContext, bus: AudioNode, at: number, level: number) => {
  const drum = ctx.createOscillator();
  drum.type = "sine";
  drum.frequency.setValueAtTime(hz(38), at);
  drum.frequency.exponentialRampToValueAtTime(hz(35), at + 0.4);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(level, at + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 2.6);
  const skin = ctx.createBufferSource();
  skin.buffer = noiseBuffer(ctx, 1);
  const low = ctx.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = 500;
  const snap = ctx.createGain();
  snap.gain.setValueAtTime(level * 0.8, at);
  snap.gain.exponentialRampToValueAtTime(0.0001, at + 0.25);
  drum.connect(gain).connect(bus);
  skin.connect(low).connect(snap).connect(bus);
  drum.start(at);
  drum.stop(at + 2.7);
  skin.start(at);
  skin.stop(at + 0.3);
};

const beat = (ctx: BaseAudioContext, bus: AudioNode, t: number, level: number) => {
  [0, 0.26].forEach((offset, i) => {
    const at = t + offset;
    const thump = ctx.createOscillator();
    const gain = ctx.createGain();
    thump.type = "sine";
    thump.frequency.setValueAtTime(i ? 50 : 60, at);
    thump.frequency.exponentialRampToValueAtTime(32, at + 0.2);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(level * (i ? 0.65 : 1), at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.34);
    thump.connect(gain).connect(bus);
    thump.start(at);
    thump.stop(at + 0.36);
  });
};

const fullBeat = (ctx: BaseAudioContext, bus: AudioNode, t: number, level: number) => {
  beat(ctx, bus, t, level);
  [0, 0.26].forEach((offset, i) => {
    const at = t + offset;
    const sub = ctx.createOscillator();
    const gain = ctx.createGain();
    sub.type = "triangle";
    sub.frequency.setValueAtTime(i ? 85 : 110, at);
    sub.frequency.exponentialRampToValueAtTime(40, at + 0.12);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(level * (i ? 0.4 : 0.6), at + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
    sub.connect(gain).connect(bus);
    sub.start(at);
    sub.stop(at + 0.52);
    const skin = ctx.createBufferSource();
    skin.buffer = noiseBuffer(ctx, 1);
    const low = ctx.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.value = 180;
    const body = ctx.createGain();
    body.gain.setValueAtTime(level * (i ? 0.5 : 0.8), at);
    body.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);
    skin.connect(low).connect(body).connect(bus);
    skin.start(at);
    skin.stop(at + 0.2);
  });
};

const tom = (ctx: BaseAudioContext, bus: AudioNode, at: number, level: number) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(95, at);
  osc.frequency.exponentialRampToValueAtTime(58, at + 0.18);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(level, at + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.3);
  osc.connect(gain).connect(bus);
  osc.start(at);
  osc.stop(at + 0.32);
};

const heartbeat = (ctx: BaseAudioContext, bus: AudioNode, level: number) => {
  for (let t = CLIMAX_END + 1; t < LENGTH - 2; t += HEART * (1 + (t - CLIMAX_END) * 0.012)) {
    beat(ctx, bus, t, level);
  }
};

const drivingHeart = (ctx: BaseAudioContext, bus: AudioNode, level: number) => {
  let t = CLIMAX_END + 1;
  while (t < BUILD_FROM) {
    beat(ctx, bus, t, level);
    t += HEART * (1 + (t - CLIMAX_END) * 0.012);
  }
  const calm = HEART * (1 + (BUILD_FROM - CLIMAX_END) * 0.012);
  while (t < LOUD_AT - DRIVE) {
    const u = (t - BUILD_FROM) / (LOUD_AT - BUILD_FROM);
    fullBeat(ctx, bus, t, level * (0.8 + 0.4 * u));
    t += calm - (calm - DRIVE) * u ** 1.2;
  }
  for (let n = 0; LOUD_AT + n * DRIVE < LOUD_END; n++) {
    const at = LOUD_AT + n * DRIVE;
    const lifted = at >= LIFT_AT;
    fullBeat(ctx, bus, at, level * (lifted ? 1.35 : 1.2));
    tom(ctx, bus, at + DRIVE / 2, level * (lifted ? 0.5 : 0.35));
    if (lifted) tom(ctx, bus, at + DRIVE * 0.75, level * 0.3);
  }
  for (let s = LOUD_END; s < LONG_LENGTH - 6; s += HEART * (1 + (s - LOUD_END) * 0.035)) {
    const fade = Math.max(0.15, 1 - (s - LOUD_END) / (LONG_LENGTH - 8 - LOUD_END));
    (s < RELEASE_END ? fullBeat : beat)(ctx, bus, s, level * fade);
  }
};

const white = (ctx: BaseAudioContext, bus: AudioNode, shape: WeightlessShape, level: number) => {
  [
    [95, -0.4],
    [95.07, 0.4],
  ].forEach(([midi, side]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const pan = ctx.createStereoPanner();
    osc.type = "sine";
    osc.frequency.value = hz(midi);
    follow(gain.gain, shape.length, shape.shimmer, level);
    pan.pan.value = side;
    osc.connect(gain).connect(pan).connect(bus);
    osc.start(0);
    osc.stop(shape.length);
  });
  const hiss = ctx.createBufferSource();
  hiss.buffer = noiseBuffer(ctx, 4);
  hiss.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = "highpass";
  band.frequency.value = 6000;
  const gain = ctx.createGain();
  follow(gain.gain, shape.length, (t) => (t < LENGTH ? 0.3 + 0.7 * shape.energy(t) : 0.25 * shape.energy(t)), level * 0.5);
  hiss.connect(band).connect(gain).connect(bus);
  hiss.start(0);
  hiss.stop(shape.length);
};

const PHRASE: PhraseNote[] = [
  { at: 0, midi: 66, length: 2 },
  { at: 2, midi: 63, length: 1 },
  { at: 3, midi: 64, length: 1 },
  { at: 4, midi: 66, length: 4 },
  { at: 8, midi: 68, length: 2 },
  { at: 10, midi: 66, length: 1 },
  { at: 11, midi: 63, length: 1 },
  { at: 12, midi: 63, length: 4 },
  { at: 16, midi: 64, length: 1 },
  { at: 17, midi: 68, length: 1 },
  { at: 18, midi: 71, length: 4 },
  { at: 22, midi: 70, length: 2 },
  { at: 24, midi: 68, length: 2 },
  { at: 26, midi: 66, length: 2 },
  { at: 28, midi: 70, length: 4 },
];

const horns = (ctx: BaseAudioContext, bus: AudioNode, shape: WeightlessShape, start: number, level: number) => {
  PHRASE.forEach((note) => {
    const t = start + note.at;
    const midi = note.midi + shape.lift(t);
    const end = t + note.length;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(level, t + 0.25);
    gain.gain.setValueAtTime(level, end - 0.05);
    gain.gain.linearRampToValueAtTime(0.0001, end + 0.5);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 1.5;
    filter.frequency.setValueAtTime(500, t);
    filter.frequency.linearRampToValueAtTime(1600, t + Math.min(1, note.length * 0.5));
    filter.frequency.linearRampToValueAtTime(1100, end);
    filter.connect(gain).connect(bus);
    [
      [-7, 0],
      [7, 0],
      [0, -12],
    ].forEach(([cents, octave]) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = hz(midi + octave);
      osc.detune.value = cents;
      osc.connect(filter);
      osc.start(t);
      osc.stop(end + 0.55);
    });
  });
};

const compose = (ctx: BaseAudioContext, world: AudioNode) => {
  tremoloStrings(ctx, world, SHORT, 0.009);
  soaring(ctx, world, SHORT, 0.008);
  for (let t = 1; t < SLOW_END; t += t < RISE_END ? 4 : t < CLIMAX_END ? 2 : 4) {
    harp(ctx, world, SHORT, t, 0.03 * energy(t));
  }
  timpani(ctx, world, RISE_END - 6, 6, 0.06);
  timpani(ctx, world, CLIMAX_END - 8, 8, 0.07);
  heartbeat(ctx, world, 0.22);
  white(ctx, world, SHORT, 0.006);
  voice(ctx, world, SLOW_END - 4, LENGTH - SLOW_END + 4, hz(71), hz(71), 0.012);
  voice(ctx, world, 2, RISE_END, hz(66), hz(71), 0.01);
};

const composeLong = (ctx: BaseAudioContext, world: AudioNode) => {
  tremoloStrings(ctx, world, LONG, 0.011);
  soaring(ctx, world, LONG, 0.008);
  for (let t = 1; t < SLOW_END; t += t < RISE_END ? 4 : t < CLIMAX_END ? 2 : 4) {
    harp(ctx, world, LONG, t, 0.03 * longEnergy(t));
  }
  brass(ctx, world, LONG, BUILD_FROM + 2, RELEASE_END, 0.012);
  timpani(ctx, world, RISE_END - 6, 6, 0.06);
  timpani(ctx, world, CLIMAX_END - 8, 8, 0.07);
  timpani(ctx, world, LOUD_AT - 8, 8, 0.11);
  timpani(ctx, world, LIFT_AT - 4, 4, 0.1);
  for (let t = LOUD_AT; t < LOUD_END; t += 8) hit(ctx, world, t, t >= LIFT_AT ? 0.3 : 0.24);
  hit(ctx, world, LOUD_END, 0.26);
  drivingHeart(ctx, world, 0.24);
  white(ctx, world, LONG, 0.006);
  voice(ctx, world, 2, RISE_END, hz(66), hz(71), 0.01);
  voice(ctx, world, SLOW_END - 4, BUILD_FROM - SLOW_END + 8, hz(71), hz(71), 0.012);
  voice(ctx, world, BUILD_FROM, LOUD_AT - BUILD_FROM + 2, hz(66), hz(70), 0.012);
  horns(ctx, world, LONG, LOUD_AT, 0.012);
  horns(ctx, world, LONG, LIFT_AT, 0.014);
  voice(ctx, world, LOUD_END, LONG_LENGTH - 2 - LOUD_END, hz(71), hz(71), 0.012);
};

let rendered: Promise<string> | null = null;
let renderedLong: Promise<string> | null = null;

export const renderWeightlessSong = (): Promise<string> => {
  if (rendered) return rendered;
  rendered = (async () => {
    const buffer = await renderBuffer(LENGTH, (ctx, _keys, world) => compose(ctx, world), {}, 1, false);
    return URL.createObjectURL(encodeWav(buffer, 0.86 / peakOf(buffer)));
  })();
  return rendered;
};

export const renderWeightlessLongSong = (): Promise<string> => {
  if (renderedLong) return renderedLong;
  renderedLong = (async () => {
    const buffer = await renderBuffer(LONG_LENGTH, (ctx, _keys, world) => composeLong(ctx, world), {}, 1, false);
    return URL.createObjectURL(encodeWav(buffer, 0.86 / peakOf(buffer)));
  })();
  return renderedLong;
};
