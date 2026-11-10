"use client";

import { encodeWav, pad } from "@/hooks/journeySong";
import { makeHall } from "@/hooks/soundEffects";
import { fmBell, noiseBuffer, pluck, talkingDrum } from "@/hooks/warriorSong";

const RATE = 44100;
const LENGTH = 196;

const A3 = 220;
const C4 = 261.63;
const D4 = 293.66;
const E4 = 329.63;
const F4 = 349.23;
const G4 = 392;
const A4 = 440;
const B4 = 493.88;
const C5 = 523.25;
const D5 = 587.33;
const E5 = 659.25;
const F5 = 698.46;
const G5 = 783.99;
const A5 = 880;

const DRONE = [73.42, 110, 146.83];
const WANDER = [
  [146.83, 220, 329.63, 440],
  [116.54, 233.08, 349.23, 440],
  [98, 196, 293.66, 440],
  [110, 220, 293.66, 329.63],
];
const OPEN = [
  [146.83, 220, 329.63, 369.99, 440],
  [98, 196, 293.66, 369.99, 493.88],
  [123.47, 246.94, 369.99, 440],
  [110, 220, 329.63, 440, 554.37],
];

const CALL: [number, number][] = [
  [E5, 1.5],
  [A4, 1.5],
  [B4, 2.6],
];

type Phrase = [number, number][];

export const sing = (
  ctx: BaseAudioContext,
  bus: AudioNode,
  noise: AudioBuffer,
  start: number,
  phrase: Phrase,
  level: number,
  pan = 0,
) => {
  const length = phrase.reduce((sum, [, seconds]) => sum + seconds, 0);
  const end = start + length;
  const body = ctx.createOscillator();
  const air = ctx.createOscillator();
  const throat = ctx.createOscillator();
  const vibrato = ctx.createOscillator();
  const depth = ctx.createGain();
  const airMix = ctx.createGain();
  const throatMix = ctx.createGain();
  const soften = ctx.createBiquadFilter();
  const formant = ctx.createBiquadFilter();
  const breath = ctx.createBufferSource();
  const breathBand = ctx.createBiquadFilter();
  const breathMix = ctx.createGain();
  const gain = ctx.createGain();
  const panner = ctx.createStereoPanner();

  body.type = "triangle";
  air.type = "sine";
  throat.type = "sawtooth";
  airMix.gain.value = 0.4;
  throatMix.gain.value = 0.09;
  soften.type = "lowpass";
  soften.frequency.value = 2300;
  formant.type = "bandpass";
  formant.frequency.value = 900;
  formant.Q.value = 3;
  vibrato.frequency.value = 4.8;
  panner.pan.value = pan;

  gain.gain.setValueAtTime(0.0001, start);
  let t = start;
  phrase.forEach(([freq, seconds], i) => {
    [body, throat].forEach((osc) => {
      if (i === 0) osc.frequency.setValueAtTime(freq, t);
      else osc.frequency.setTargetAtTime(freq, t, 0.075);
    });
    if (i === 0) air.frequency.setValueAtTime(freq * 2, t);
    else air.frequency.setTargetAtTime(freq * 2, t, 0.075);
    depth.gain.setValueAtTime(0, t);
    depth.gain.linearRampToValueAtTime(
      seconds > 1 ? freq * 0.0075 : freq * 0.002,
      t + seconds * 0.7,
    );
    gain.gain.linearRampToValueAtTime(level * 0.72, t + Math.min(0.3, seconds * 0.3));
    gain.gain.linearRampToValueAtTime(level, t + seconds * 0.62);
    gain.gain.linearRampToValueAtTime(level * 0.76, t + seconds);
    t += seconds;
  });
  gain.gain.linearRampToValueAtTime(0.0001, end + 0.5);

  vibrato.connect(depth);
  depth.connect(body.frequency);
  depth.connect(throat.frequency);
  body.connect(soften);
  air.connect(airMix).connect(soften);
  throat.connect(formant).connect(throatMix).connect(soften);
  soften.connect(gain);

  breath.buffer = noise;
  breath.loop = true;
  breathBand.type = "bandpass";
  breathBand.frequency.value = 2600;
  breathBand.Q.value = 0.9;
  breathMix.gain.value = 0.05;
  breath.connect(breathBand).connect(breathMix).connect(gain);

  gain.connect(panner).connect(bus);
  [body, air, throat, vibrato].forEach((osc) => {
    osc.start(start);
    osc.stop(end + 0.6);
  });
  breath.start(start);
  breath.stop(end + 0.6);
};

const compose = (
  ctx: BaseAudioContext,
  her: AudioNode,
  world: AudioNode,
  far: AudioNode,
) => {
  const noise = noiseBuffer(ctx, 2);
  const strings = new Map<number, AudioBuffer>();
  const her1 = (at: number, phrase: Phrase, level: number, pan = 0) =>
    sing(ctx, her, noise, at, phrase, level, pan);

  const call = (at: number, level: number, pan: number) => {
    let t = at;
    CALL.forEach(([freq, seconds]) => {
      fmBell(ctx, far, t, freq * 2, level, 3.01, 6, pan);
      t += seconds;
    });
  };

  const wander = (at: number, chords: number[][], seconds: number, level: number) => {
    chords.forEach((chord, i) => {
      const t = at + i * seconds;
      pad(ctx, world, t, seconds, chord, level, 900);
      chord.forEach((freq, k) => {
        pluck(ctx, world, strings, t + k * 1.15, freq * 2, 0.055, k % 2 ? 0.4 : -0.4);
      });
    });
  };

  pad(ctx, world, 0, 38, DRONE, 0.018, 320);
  her1(5, [[A4, 1.6], [C5, 1.4], [D5, 3.4]], 0.13);
  her1(16, [[A4, 1.3], [C5, 1.1], [D5, 1.3], [E5, 1.1], [D5, 1], [A4, 3.6]], 0.13);
  call(29, 0.012, 0.65);

  wander(38, WANDER, 7.2, 0.012);
  wander(38 + 28.8, WANDER.slice(0, 2), 7.2, 0.014);
  her1(40, [[D5, 2], [C5, 1], [A4, 1.2], [G4, 1], [A4, 3.6]], 0.13);
  her1(51, [[A4, 1], [C5, 1], [E5, 2.4], [D5, 1], [C5, 1], [D5, 3.2]], 0.135);
  her1(63, [[F5, 2.2], [E5, 1], [D5, 1], [C5, 1.2], [A4, 1], [G4, 1], [A4, 3.8]], 0.14);
  call(74.5, 0.022, -0.55);

  pad(ctx, world, 83, 32, [73.42, 110], 0.016, 240);
  [84, 85.1, 88, 89.1, 92, 93.1, 96, 97.1, 100, 101.1].forEach((t, i) => {
    talkingDrum(ctx, world, t, 62, 44, i % 2 ? 0.1 : 0.15, 0);
  });
  her1(87, [[D4, 2.2], [F4, 1.2], [E4, 2.6]], 0.11);
  her1(95, [[D4, 1.4], [C4, 1.2], [A3, 3.2]], 0.1);
  call(104, 0.04, 0.35);
  her1(109, [[E5, 1.5], [A4, 1.5], [B4, 3.4]], 0.115);

  OPEN.concat(OPEN).forEach((chord, i) => {
    const t = 116 + i * 5.6;
    pad(ctx, world, t, 5.6, chord, 0.016 + i * 0.0035, 1000 + i * 150);
    chord.forEach((freq, k) => {
      pluck(ctx, world, strings, t + k * 0.9, freq * 2, 0.06, k % 2 ? 0.45 : -0.45);
    });
  });
  her1(117, [[E5, 1.4], [A4, 1.4], [B4, 2], [D5, 1], [E5, 3.2]], 0.135);
  her1(127, [[F5 * 1.0595, 2], [E5, 1], [D5, 1], [B4, 1.2], [A4, 3.2]], 0.14);
  her1(130, [[A4, 2], [B4, 2.2], [A4, 3]], 0.075, -0.45);
  her1(137, [[A4, 1], [B4, 1], [D5, 1], [E5, 1.2], [G5, 1.4], [A5, 5]], 0.145);
  her1(138.5, [[E4, 2], [G4, 2], [A4, 5]], 0.07, 0.45);
  her1(140, [[D5, 1.6], [E5, 1.6], [A5 / 2, 5]], 0.07, -0.45);
  her1(149, [[A5, 1.8], [F5 * 1.0595, 1.4], [E5, 1.4], [D5, 1], [E5, 4]], 0.14);
  her1(150, [[D5, 3], [B4, 3], [A4, 3.4]], 0.07, 0.45);

  pad(ctx, world, 160, 30, [73.42, 146.83, 220, 329.63], 0.022, 620);
  her1(163, [[A4, 1.6], [C5 * 1.0595, 1.4], [D5, 3.2]], 0.125);
  call(171, 0.04, 0);
  her1(171, [[E5, 1.5], [A4, 1.5], [B4, 2.6], [A4, 1.2], [D5, 5.4]], 0.12);
  fmBell(ctx, far, 183.4, 587.33, 0.03, 2, 8, 0);
};

let rendered: Promise<string> | null = null;

export const renderHerSong = (): Promise<string> => {
  if (rendered) return rendered;
  rendered = (async () => {
    const ctx = new OfflineAudioContext(2, Math.floor(LENGTH * RATE), RATE);
    const hall = makeHall(ctx, 6);
    const wet = ctx.createGain();
    wet.gain.value = 0.8;
    hall.connect(wet).connect(ctx.destination);

    const her = ctx.createGain();
    const herDry = ctx.createGain();
    herDry.gain.value = 0.85;
    const herEcho = ctx.createDelay(1);
    herEcho.delayTime.value = 0.46;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.26;
    her.connect(herDry).connect(ctx.destination);
    her.connect(hall);
    her.connect(herEcho).connect(feedback).connect(herEcho);
    feedback.connect(hall);

    const world = ctx.createGain();
    const worldDry = ctx.createGain();
    worldDry.gain.value = 0.5;
    world.connect(worldDry).connect(ctx.destination);
    world.connect(hall);

    const far = ctx.createGain();
    far.connect(hall);

    compose(ctx, her, world, far);
    const buffer = await ctx.startRendering();
    return URL.createObjectURL(encodeWav(buffer));
  })();
  return rendered;
};
