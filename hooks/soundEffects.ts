"use client";

let context: AudioContext | null = null;

export const getContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  if (context.state === "suspended") void context.resume();
  return context;
};

export const playClick = (pitch = 1) => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(1400 * pitch, now);
  osc.frequency.exponentialRampToValueAtTime(500 * pitch, now + 0.05);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.08);
};

export const playBuzz = (duration = 1.3) => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const end = now + duration;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.22, now + 0.03);
  master.gain.setValueAtTime(0.22, end - 0.08);
  master.gain.exponentialRampToValueAtTime(0.0001, end);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1600;
  filter.Q.value = 2;

  const tremolo = ctx.createGain();
  tremolo.gain.value = 0.65;
  const lfo = ctx.createOscillator();
  const lfoDepth = ctx.createGain();
  lfo.frequency.value = 50;
  lfoDepth.gain.value = 0.35;
  lfo.connect(lfoDepth).connect(tremolo.gain);

  const low = ctx.createOscillator();
  low.type = "sawtooth";
  low.frequency.value = 120;
  const high = ctx.createOscillator();
  high.type = "square";
  high.frequency.value = 240;
  const highGain = ctx.createGain();
  highGain.gain.value = 0.35;

  low.connect(filter);
  high.connect(highGain).connect(filter);
  filter.connect(tremolo).connect(master).connect(ctx.destination);

  [low, high, lfo].forEach((o) => {
    o.start(now);
    o.stop(end + 0.02);
  });
};

export const playTick = () => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const length = Math.floor(ctx.sampleRate * 0.018);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 4);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 3200 + Math.random() * 900;
  band.Q.value = 2;
  const gain = ctx.createGain();
  gain.gain.value = 0.09;
  noise.connect(band).connect(gain).connect(ctx.destination);
  noise.start(now);
};

export const playPop = () => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(320 + Math.random() * 120, now);
  osc.frequency.exponentialRampToValueAtTime(980, now + 0.08);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.17);
};

export const playClash = (weight = 1) => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const out = ctx.createGain();
  out.gain.value = 0.55 * (0.5 + weight * 0.5);
  out.connect(ctx.destination);

  const thump = ctx.createOscillator();
  const thumpGain = ctx.createGain();
  thump.type = "sine";
  thump.frequency.setValueAtTime(150 / (0.6 + weight * 0.4), now);
  thump.frequency.exponentialRampToValueAtTime(38, now + 0.28);
  thumpGain.gain.setValueAtTime(0.0001, now);
  thumpGain.gain.exponentialRampToValueAtTime(0.9 * weight + 0.15, now + 0.004);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
  thump.connect(thumpGain).connect(out);
  thump.start(now);
  thump.stop(now + 0.36);

  const crashLength = Math.floor(ctx.sampleRate * (0.35 + weight * 0.4));
  const buffer = ctx.createBuffer(1, crashLength, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < crashLength; i++) {
    channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / crashLength, 2.4);
  }
  const crash = ctx.createBufferSource();
  crash.buffer = buffer;
  const high = ctx.createBiquadFilter();
  high.type = "highpass";
  high.frequency.value = 2200;
  const crashGain = ctx.createGain();
  crashGain.gain.value = 0.32;
  crash.connect(high).connect(crashGain).connect(out);
  crash.start(now);

  const pitch = weight < 0.7 ? 1.6 : 1;
  [523, 811, 1187, 1543, 2219].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = i % 2 ? "square" : "triangle";
    osc.frequency.value = freq * pitch * (1 + (Math.random() - 0.5) * 0.02);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.07 / (i + 1) + 0.02, now + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25 + 0.25 * weight);
    osc.connect(g).connect(out);
    osc.start(now);
    osc.stop(now + 0.55);
  });
};

export const playBoom = () => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const out = ctx.createGain();
  out.gain.value = 0.8;
  out.connect(ctx.destination);

  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.type = "sine";
  sub.frequency.setValueAtTime(110, now);
  sub.frequency.exponentialRampToValueAtTime(28, now + 0.7);
  subGain.gain.setValueAtTime(0.0001, now);
  subGain.gain.exponentialRampToValueAtTime(1, now + 0.008);
  subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
  sub.connect(subGain).connect(out);
  sub.start(now);
  sub.stop(now + 0.95);

  const length = Math.floor(ctx.sampleRate * 1.4);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const low = ctx.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.setValueAtTime(5200, now);
  low.frequency.exponentialRampToValueAtTime(260, now + 1.2);
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.75;
  noise.connect(low).connect(noiseGain).connect(out);
  noise.start(now);

  for (let i = 0; i < 14; i++) {
    const t = now + (i / 14) * 0.43 + Math.random() * 0.03;
    const pop = ctx.createOscillator();
    const popGain = ctx.createGain();
    pop.type = "sine";
    pop.frequency.setValueAtTime(380 + Math.random() * 500, t);
    pop.frequency.exponentialRampToValueAtTime(1400, t + 0.07);
    popGain.gain.setValueAtTime(0.0001, t);
    popGain.gain.exponentialRampToValueAtTime(0.12, t + 0.008);
    popGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    pop.connect(popGain).connect(out);
    pop.start(t);
    pop.stop(t + 0.14);
  }
};

export const makeHall = (
  ctx: BaseAudioContext,
  seconds: number,
): ConvolverNode => {
  const length = Math.floor(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const channel = impulse.getChannelData(c);
    for (let i = 0; i < length; i++) {
      channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.8);
    }
  }
  const hall = ctx.createConvolver();
  hall.buffer = impulse;
  return hall;
};

export const playJourney = (duration = 8) => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const end = now + duration;
  const pace = duration / 5;

  const hall = makeHall(ctx, 4.2);
  const wet = ctx.createGain();
  wet.gain.value = 0.85;
  const dry = ctx.createGain();
  dry.gain.value = 0.55;
  hall.connect(wet).connect(ctx.destination);
  dry.connect(ctx.destination);
  const send = ctx.createGain();
  send.connect(hall);
  send.connect(dry);

  const pad = ctx.createBiquadFilter();
  pad.type = "lowpass";
  pad.frequency.setValueAtTime(240, now);
  pad.frequency.exponentialRampToValueAtTime(1500, now + duration * 0.6);
  pad.frequency.exponentialRampToValueAtTime(420, end);
  const padGain = ctx.createGain();
  padGain.gain.setValueAtTime(0.0001, now);
  padGain.gain.exponentialRampToValueAtTime(0.1, now + duration * 0.45);
  padGain.gain.exponentialRampToValueAtTime(0.0001, end);
  pad.connect(padGain).connect(send);
  [146.83, 220, 293.66, 329.63, 440].forEach((freq, i) => {
    [-3, 3].forEach((cents) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 ? "sine" : "triangle";
      osc.frequency.value = freq;
      osc.detune.value = cents;
      osc.connect(pad);
      osc.start(now);
      osc.stop(end + 0.05);
    });
  });

  const voice = ctx.createOscillator();
  voice.type = "sawtooth";
  voice.frequency.setValueAtTime(587.33, now + 1.4 * pace);
  voice.frequency.linearRampToValueAtTime(659.25, now + 3.2 * pace);
  const vibrato = ctx.createOscillator();
  const vibratoDepth = ctx.createGain();
  vibrato.frequency.value = 4.6;
  vibratoDepth.gain.value = 5;
  vibrato.connect(vibratoDepth).connect(voice.frequency);
  const voiceGain = ctx.createGain();
  voiceGain.gain.setValueAtTime(0.0001, now + 1.4 * pace);
  voiceGain.gain.exponentialRampToValueAtTime(0.05, now + 2.8 * pace);
  voiceGain.gain.exponentialRampToValueAtTime(0.0001, end - 0.3);
  [
    [750, 7],
    [1150, 9],
  ].forEach(([freq, q]) => {
    const formant = ctx.createBiquadFilter();
    formant.type = "bandpass";
    formant.frequency.value = freq;
    formant.Q.value = q;
    voice.connect(formant).connect(voiceGain);
  });
  voiceGain.connect(send);
  voice.start(now + 1.4 * pace);
  vibrato.start(now + 1.4 * pace);
  voice.stop(end);
  vibrato.stop(end);

  [
    [0.1, 587.33],
    [0.95, 880],
    [1.75, 739.99],
    [2.7, 987.77],
    [3.75, 659.25],
  ].forEach(([at, freq]) => {
    const t = now + at * pace;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.16, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.1);
    gain.connect(send);
    [
      [1, "triangle", 1],
      [2, "sine", 0.28],
    ].forEach(([ratio, type, level]) => {
      const osc = ctx.createOscillator();
      const part = ctx.createGain();
      osc.type = type as OscillatorType;
      osc.frequency.value = freq * (ratio as number);
      part.gain.value = level as number;
      osc.connect(part).connect(gain);
      osc.start(t);
      osc.stop(t + 2.2);
    });
  });
};

export const playLibrary = (duration = 8) => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const end = now + duration;
  const pace = duration / 5;

  const hall = makeHall(ctx, 4.6);
  const wet = ctx.createGain();
  wet.gain.value = 0.9;
  const dry = ctx.createGain();
  dry.gain.value = 0.5;
  hall.connect(wet).connect(ctx.destination);
  dry.connect(ctx.destination);
  const send = ctx.createGain();
  send.connect(hall);
  send.connect(dry);

  const pad = ctx.createBiquadFilter();
  pad.type = "lowpass";
  pad.frequency.setValueAtTime(260, now);
  pad.frequency.exponentialRampToValueAtTime(1300, now + duration * 0.55);
  pad.frequency.exponentialRampToValueAtTime(380, end);
  const padGain = ctx.createGain();
  padGain.gain.setValueAtTime(0.0001, now);
  padGain.gain.exponentialRampToValueAtTime(0.09, now + duration * 0.4);
  padGain.gain.exponentialRampToValueAtTime(0.0001, end);
  pad.connect(padGain).connect(send);
  [174.61, 261.63, 349.23, 392, 523.25].forEach((freq, i) => {
    [-4, 4].forEach((cents) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 ? "sine" : "triangle";
      osc.frequency.value = freq;
      osc.detune.value = cents;
      osc.connect(pad);
      osc.start(now);
      osc.stop(end + 0.05);
    });
  });

  [
    [0.1, 698.46],
    [0.6, 880],
    [1.1, 1046.5],
    [1.75, 783.99],
    [2.4, 932.33],
    [3.1, 698.46],
    [3.8, 1174.66],
  ].forEach(([at, freq]) => {
    const t = now + at * pace;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.11, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    gain.connect(send);
    [
      [1, "sine", 1],
      [3.01, "sine", 0.22],
      [5.4, "sine", 0.06],
    ].forEach(([ratio, type, level]) => {
      const osc = ctx.createOscillator();
      const part = ctx.createGain();
      osc.type = type as OscillatorType;
      osc.frequency.value = freq * (ratio as number);
      part.gain.value = level as number;
      osc.connect(part).connect(gain);
      osc.start(t);
      osc.stop(t + 2.7);
    });
  });

  const pageLength = Math.floor(ctx.sampleRate * 0.3);
  const pageBuffer = ctx.createBuffer(1, pageLength, ctx.sampleRate);
  const pageData = pageBuffer.getChannelData(0);
  for (let i = 0; i < pageLength; i++) pageData[i] = Math.random() * 2 - 1;
  [0.5, 1.4, 2.2, 2.9, 3.6, 4.3].forEach((at, i) => {
    const t = now + at * pace;
    const page = ctx.createBufferSource();
    page.buffer = pageBuffer;
    page.playbackRate.value = 0.8 + (i % 3) * 0.15;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.setValueAtTime(1800, t);
    band.frequency.exponentialRampToValueAtTime(4200, t + 0.22);
    band.Q.value = 0.9;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.05, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    page.connect(band).connect(gain).connect(send);
    page.start(t);
    page.stop(t + 0.32);
  });
};

export const playFood = (duration = 8) => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const end = now + duration;
  const pace = duration / 5;

  const hall = makeHall(ctx, 3.8);
  const wet = ctx.createGain();
  wet.gain.value = 0.8;
  const dry = ctx.createGain();
  dry.gain.value = 0.6;
  hall.connect(wet).connect(ctx.destination);
  dry.connect(ctx.destination);
  const send = ctx.createGain();
  send.connect(hall);
  send.connect(dry);

  const pad = ctx.createBiquadFilter();
  pad.type = "lowpass";
  pad.frequency.setValueAtTime(280, now);
  pad.frequency.exponentialRampToValueAtTime(1700, now + duration * 0.5);
  pad.frequency.exponentialRampToValueAtTime(450, end);
  const padGain = ctx.createGain();
  padGain.gain.setValueAtTime(0.0001, now);
  padGain.gain.exponentialRampToValueAtTime(0.09, now + duration * 0.4);
  padGain.gain.exponentialRampToValueAtTime(0.0001, end);
  pad.connect(padGain).connect(send);
  [146.83, 220, 293.66, 369.99, 440].forEach((freq, i) => {
    [-3, 3].forEach((cents) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 ? "sine" : "triangle";
      osc.frequency.value = freq;
      osc.detune.value = cents;
      osc.connect(pad);
      osc.start(now);
      osc.stop(end + 0.05);
    });
  });

  [
    [0.1, 587.33],
    [0.7, 739.99],
    [1.3, 880],
    [2, 739.99],
    [2.7, 987.77],
    [3.5, 880],
    [4.1, 1174.66],
  ].forEach(([at, freq]) => {
    const t = now + at * pace;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.13, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.9);
    gain.connect(send);
    [
      [1, "triangle", 1],
      [2, "sine", 0.3],
    ].forEach(([ratio, type, level]) => {
      const osc = ctx.createOscillator();
      const part = ctx.createGain();
      osc.type = type as OscillatorType;
      osc.frequency.value = freq * (ratio as number);
      part.gain.value = level as number;
      osc.connect(part).connect(gain);
      osc.start(t);
      osc.stop(t + 2);
    });
  });

  [0.9, 2.3, 3.9].forEach((at, i) => {
    const t = now + at * pace;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.045, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    gain.connect(send);
    [1, 2.76, 5.4, 8.93].forEach((ratio, k) => {
      const osc = ctx.createOscillator();
      const part = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = (1318.51 + i * 110) * ratio;
      part.gain.value = 1 / (k + 1.5);
      osc.connect(part).connect(gain);
      osc.start(t);
      osc.stop(t + 1.5);
    });
  });
};

export const playCoffee = (duration = 8) => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const end = now + duration;
  const pace = duration / 5;

  const hall = makeHall(ctx, 3.4);
  const wet = ctx.createGain();
  wet.gain.value = 0.75;
  const dry = ctx.createGain();
  dry.gain.value = 0.6;
  hall.connect(wet).connect(ctx.destination);
  dry.connect(ctx.destination);
  const send = ctx.createGain();
  send.connect(hall);
  send.connect(dry);

  const pad = ctx.createBiquadFilter();
  pad.type = "lowpass";
  pad.frequency.setValueAtTime(300, now);
  pad.frequency.exponentialRampToValueAtTime(1400, now + duration * 0.5);
  pad.frequency.exponentialRampToValueAtTime(420, end);
  const padGain = ctx.createGain();
  padGain.gain.setValueAtTime(0.0001, now);
  padGain.gain.exponentialRampToValueAtTime(0.085, now + duration * 0.4);
  padGain.gain.exponentialRampToValueAtTime(0.0001, end);
  pad.connect(padGain).connect(send);
  [130.81, 196, 261.63, 329.63, 493.88].forEach((freq, i) => {
    [-3, 3].forEach((cents) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 ? "sine" : "triangle";
      osc.frequency.value = freq;
      osc.detune.value = cents;
      osc.connect(pad);
      osc.start(now);
      osc.stop(end + 0.05);
    });
  });

  [
    [0.1, 523.25],
    [0.75, 659.25],
    [1.4, 783.99],
    [2.1, 987.77],
    [2.9, 783.99],
    [3.6, 659.25],
    [4.2, 1046.5],
  ].forEach(([at, freq]) => {
    const t = now + at * pace;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    gain.connect(send);
    [
      [1, "triangle", 1],
      [2, "sine", 0.25],
    ].forEach(([ratio, type, level]) => {
      const osc = ctx.createOscillator();
      const part = ctx.createGain();
      osc.type = type as OscillatorType;
      osc.frequency.value = freq * (ratio as number);
      part.gain.value = level as number;
      osc.connect(part).connect(gain);
      osc.start(t);
      osc.stop(t + 1.9);
    });
  });

  const bubbleLength = Math.floor(ctx.sampleRate * 0.12);
  const bubbleBuffer = ctx.createBuffer(1, bubbleLength, ctx.sampleRate);
  const bubbleData = bubbleBuffer.getChannelData(0);
  for (let i = 0; i < bubbleLength; i++) bubbleData[i] = Math.random() * 2 - 1;
  Array.from({ length: 14 }, (_, i) => 0.3 + i * 0.32).forEach((at, i) => {
    const t = now + at * pace * 0.9;
    const bubble = ctx.createBufferSource();
    bubble.buffer = bubbleBuffer;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.setValueAtTime(500 + (i % 4) * 140, t);
    band.frequency.exponentialRampToValueAtTime(1300 + (i % 3) * 200, t + 0.1);
    band.Q.value = 9;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.09, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    bubble.connect(band).connect(gain).connect(send);
    bubble.start(t);
    bubble.stop(t + 0.13);
  });
};

export const playStorage = (duration = 8) => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const end = now + duration;
  const pace = duration / 5;

  const hall = makeHall(ctx, 4);
  const wet = ctx.createGain();
  wet.gain.value = 0.8;
  const dry = ctx.createGain();
  dry.gain.value = 0.55;
  hall.connect(wet).connect(ctx.destination);
  dry.connect(ctx.destination);
  const send = ctx.createGain();
  send.connect(hall);
  send.connect(dry);

  const pad = ctx.createBiquadFilter();
  pad.type = "lowpass";
  pad.frequency.setValueAtTime(260, now);
  pad.frequency.exponentialRampToValueAtTime(1500, now + duration * 0.5);
  pad.frequency.exponentialRampToValueAtTime(400, end);
  const padGain = ctx.createGain();
  padGain.gain.setValueAtTime(0.0001, now);
  padGain.gain.exponentialRampToValueAtTime(0.09, now + duration * 0.4);
  padGain.gain.exponentialRampToValueAtTime(0.0001, end);
  pad.connect(padGain).connect(send);
  [155.56, 233.08, 311.13, 392, 466.16].forEach((freq, i) => {
    [-3, 3].forEach((cents) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 ? "sine" : "triangle";
      osc.frequency.value = freq;
      osc.detune.value = cents;
      osc.connect(pad);
      osc.start(now);
      osc.stop(end + 0.05);
    });
  });

  [
    [0.1, 622.25],
    [0.8, 783.99],
    [1.5, 932.33],
    [2.3, 783.99],
    [3, 1046.5],
    [3.8, 932.33],
  ].forEach(([at, freq]) => {
    const t = now + at * pace;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 2);
    gain.connect(send);
    [
      [1, "triangle", 1],
      [2, "sine", 0.26],
    ].forEach(([ratio, type, level]) => {
      const osc = ctx.createOscillator();
      const part = ctx.createGain();
      osc.type = type as OscillatorType;
      osc.frequency.value = freq * (ratio as number);
      part.gain.value = level as number;
      osc.connect(part).connect(gain);
      osc.start(t);
      osc.stop(t + 2.1);
    });
  });

  [0.6, 1.9, 3.3, 4.4].forEach((at, i) => {
    const t = now + at * pace;
    const thump = ctx.createOscillator();
    thump.type = "sine";
    thump.frequency.setValueAtTime(150 - i * 8, t);
    thump.frequency.exponentialRampToValueAtTime(60, t + 0.18);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.16, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    thump.connect(gain).connect(send);
    thump.start(t);
    thump.stop(t + 0.27);
  });
};

export const playLanguages = (duration = 8) => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const end = now + duration;
  const pace = duration / 5;

  const hall = makeHall(ctx, 3.6);
  const wet = ctx.createGain();
  wet.gain.value = 0.8;
  const dry = ctx.createGain();
  dry.gain.value = 0.55;
  hall.connect(wet).connect(ctx.destination);
  dry.connect(ctx.destination);
  const send = ctx.createGain();
  send.connect(hall);
  send.connect(dry);

  const pad = ctx.createBiquadFilter();
  pad.type = "lowpass";
  pad.frequency.setValueAtTime(280, now);
  pad.frequency.exponentialRampToValueAtTime(1600, now + duration * 0.5);
  pad.frequency.exponentialRampToValueAtTime(420, end);
  const padGain = ctx.createGain();
  padGain.gain.setValueAtTime(0.0001, now);
  padGain.gain.exponentialRampToValueAtTime(0.085, now + duration * 0.4);
  padGain.gain.exponentialRampToValueAtTime(0.0001, end);
  pad.connect(padGain).connect(send);
  [174.61, 261.63, 349.23, 440, 523.25].forEach((freq, i) => {
    [-3, 3].forEach((cents) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 ? "sine" : "triangle";
      osc.frequency.value = freq;
      osc.detune.value = cents;
      osc.connect(pad);
      osc.start(now);
      osc.stop(end + 0.05);
    });
  });

  [
    [0.1, 698.46],
    [0.7, 880],
    [1.4, 1046.5],
    [2.1, 880],
    [2.8, 1174.66],
    [3.6, 1046.5],
    [4.2, 1396.91],
  ].forEach(([at, freq]) => {
    const t = now + at * pace;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.11, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.9);
    gain.connect(send);
    [
      [1, "triangle", 1],
      [2, "sine", 0.25],
    ].forEach(([ratio, type, level]) => {
      const osc = ctx.createOscillator();
      const part = ctx.createGain();
      osc.type = type as OscillatorType;
      osc.frequency.value = freq * (ratio as number);
      part.gain.value = level as number;
      osc.connect(part).connect(gain);
      osc.start(t);
      osc.stop(t + 2);
    });
  });

  const VOWELS = [
    [730, 1090],
    [270, 2290],
    [570, 840],
    [300, 870],
    [530, 1840],
  ];
  Array.from({ length: 16 }, (_, i) => 0.4 + i * 0.27).forEach((at, i) => {
    const t = now + at * pace;
    const voice = ctx.createOscillator();
    voice.type = "sawtooth";
    voice.frequency.setValueAtTime(220 + (i % 3) * 30, t);
    voice.frequency.exponentialRampToValueAtTime(260 + (i % 4) * 25, t + 0.14);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.05, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    VOWELS[i % VOWELS.length].forEach((formant) => {
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = formant;
      band.Q.value = 8;
      voice.connect(band).connect(gain);
    });
    gain.connect(send);
    voice.start(t);
    voice.stop(t + 0.18);
  });
};

export const playDing = () => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const hall = makeHall(ctx, 1.6);
  const wet = ctx.createGain();
  wet.gain.value = 0.45;
  hall.connect(wet).connect(ctx.destination);
  [
    [0, 1318.51],
    [0.42, 1046.5],
  ].forEach(([at, freq]) => {
    const t = now + at;
    const out = ctx.createGain();
    out.connect(ctx.destination);
    out.connect(hall);
    [
      [1, 0.16],
      [2.76, 0.035],
      [5.4, 0.01],
    ].forEach(([ratio, level]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const ring = 1.6 / Math.sqrt(ratio);
      osc.type = "sine";
      osc.frequency.value = freq * ratio;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(level, t + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + ring);
      osc.connect(gain).connect(out);
      osc.start(t);
      osc.stop(t + ring + 0.02);
    });
  });
};

export const playFall = (duration = 5) => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const end = now + duration;

  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) channel[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const low = ctx.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.setValueAtTime(3200, now);
  low.frequency.exponentialRampToValueAtTime(160, end);
  const air = ctx.createGain();
  air.gain.setValueAtTime(0.0001, now);
  air.gain.exponentialRampToValueAtTime(0.09, now + 0.8);
  air.gain.exponentialRampToValueAtTime(0.0001, end);
  noise.connect(low).connect(air).connect(ctx.destination);
  noise.start(now);

  [1568, 1319, 1175, 988, 880, 784, 659, 587, 523, 440].forEach((freq, i) => {
    const t = now + 0.15 + i * 0.4 + Math.random() * 0.1;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.94, t + 1.1);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.1, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 1.25);
  });

  const landing = end - 0.6;
  const thump = ctx.createOscillator();
  const thumpGain = ctx.createGain();
  thump.type = "sine";
  thump.frequency.setValueAtTime(120, landing);
  thump.frequency.exponentialRampToValueAtTime(42, landing + 0.4);
  thumpGain.gain.setValueAtTime(0.0001, landing);
  thumpGain.gain.exponentialRampToValueAtTime(0.32, landing + 0.01);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, landing + 0.55);
  thump.connect(thumpGain).connect(ctx.destination);
  thump.start(landing);
  thump.stop(landing + 0.6);
};

const SPARKLE = [
  1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093, 2349.32, 2637.02,
];

export const playFairies = (duration = 10) => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const end = now + duration;

  const hall = makeHall(ctx, 3.4);
  const wet = ctx.createGain();
  wet.gain.value = 0.6;
  const dry = ctx.createGain();
  dry.gain.value = 0.75;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, now);
  out.gain.exponentialRampToValueAtTime(2.5, now + duration * 0.04);
  out.gain.setValueAtTime(2.5, now + duration * 0.82);
  out.gain.exponentialRampToValueAtTime(0.0001, end);
  out.connect(hall).connect(wet).connect(ctx.destination);
  out.connect(dry).connect(ctx.destination);

  const length = Math.floor(ctx.sampleRate * 0.035);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
  }

  const flutter = (start: number, beats: number, pan: number) => {
    const pace = 0.05 + Math.random() * 0.025;
    const place = ctx.createStereoPanner();
    place.pan.value = pan;
    place.connect(out);
    for (let b = 0; b < beats; b++) {
      const wing = ctx.createBufferSource();
      wing.buffer = buffer;
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 1400 + Math.random() * 1400;
      band.Q.value = 1.1;
      const gain = ctx.createGain();
      gain.gain.value = (0.1 + Math.random() * 0.08) * (b % 2 ? 0.6 : 1);
      wing.connect(band).connect(gain).connect(place);
      wing.start(start + b * pace);
    }
  };

  const chime = (t: number, freq: number, level: number, pan: number) => {
    const place = ctx.createStereoPanner();
    place.pan.value = pan;
    place.connect(out);
    [
      [1, 1],
      [2.76, 0.22],
      [5.4, 0.06],
    ].forEach(([ratio, amount]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const ring = 1.5 / Math.sqrt(ratio);
      osc.type = "sine";
      osc.frequency.value = freq * ratio;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(level * amount, t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + ring);
      osc.connect(gain).connect(place);
      osc.start(t);
      osc.stop(t + ring + 0.02);
    });
  };

  for (let t = 0.1; t < duration - 0.8; t += 0.3 + Math.random() * 0.55) {
    flutter(now + t, 4 + Math.floor(Math.random() * 5), Math.random() * 1.6 - 0.8);
  }

  for (let t = 0.2; t < duration - 1; t += 0.45 + Math.random() * 0.9) {
    chime(
      now + t,
      SPARKLE[Math.floor(Math.random() * SPARKLE.length)],
      0.035 + Math.random() * 0.03,
      Math.random() * 1.6 - 0.8,
    );
  }

  [0.015, 0.34, 0.66].forEach((at, run) => {
    const first = Math.floor(Math.random() * 3);
    for (let n = 0; n < 6; n++) {
      const step = run % 2 ? 5 - n : n;
      chime(
        now + at * duration + n * 0.075,
        SPARKLE[first + step],
        0.04,
        (n / 5 - 0.5) * (run % 2 ? -1.2 : 1.2),
      );
    }
  });
};

export const playLatch = () => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const thump = ctx.createOscillator();
  const thumpGain = ctx.createGain();
  thump.type = "sine";
  thump.frequency.setValueAtTime(180, now);
  thump.frequency.exponentialRampToValueAtTime(60, now + 0.09);
  thumpGain.gain.setValueAtTime(0.0001, now);
  thumpGain.gain.exponentialRampToValueAtTime(0.35, now + 0.003);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  thump.connect(thumpGain).connect(ctx.destination);
  thump.start(now);
  thump.stop(now + 0.13);

  const length = Math.floor(ctx.sampleRate * 0.05);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 2600;
  band.Q.value = 1.2;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.5;
  noise.connect(band).connect(noiseGain).connect(ctx.destination);
  noise.start(now);
};

export const playSwoosh = (duration = 0.75) => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const end = now + duration;
  const tail = end + 0.22;

  const length = Math.floor(ctx.sampleRate * (duration + 0.25));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) channel[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 1.4;
  band.frequency.setValueAtTime(260, now);
  band.frequency.exponentialRampToValueAtTime(5200, end);
  band.frequency.exponentialRampToValueAtTime(1800, tail);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.08, now + duration * 0.4);
  noiseGain.gain.exponentialRampToValueAtTime(0.42, end - 0.04);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, tail);
  noise.connect(band).connect(noiseGain).connect(ctx.destination);
  noise.start(now);
  noise.stop(tail + 0.02);

  const tone = ctx.createOscillator();
  tone.type = "sine";
  tone.frequency.setValueAtTime(90, now);
  tone.frequency.exponentialRampToValueAtTime(520, end);
  const toneGain = ctx.createGain();
  toneGain.gain.setValueAtTime(0.0001, now);
  toneGain.gain.exponentialRampToValueAtTime(0.12, end - 0.05);
  toneGain.gain.exponentialRampToValueAtTime(0.0001, end + 0.12);
  tone.connect(toneGain).connect(ctx.destination);
  tone.start(now);
  tone.stop(end + 0.14);
};

export const playSound =(src: string | undefined, fallback: () => void) => {
  if (!src || typeof window === "undefined") {
    fallback();
    return;
  }
  const audio = new Audio(src);
  audio.play().catch(() => fallback());
};
