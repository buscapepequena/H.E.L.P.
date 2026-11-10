import { WEIGHTLESS_CLIMAX, WEIGHTLESS_ROUND } from "@/hooks/weightlessSong";
import { buildStairs, stairPoint } from "@/hooks/pixelStairs";
import { rotateSprite, scaleSprite } from "@/hooks/pixelSprite";
import { ROSETTA_CLIMB } from "@/hooks/rosettaClimb";
import { ROSETTA_DROP } from "@/hooks/rosettaDrop";
import { ROSETTA_FALL } from "@/hooks/rosettaFall";
import { ROSETTA_FRAMES } from "@/hooks/rosettaFrames";
import { ROSETTA_WALK } from "@/hooks/rosettaWalk";
import { FigureCell, FigureStyle, RainField, RainPhase, Veil } from "@/types/rain";

export const RAIN_CELL = 6;
const FIRST_DROPS = [0.3, 2.2, 3.7, 4.7, 5.4, 6];
const RAMP_START = 6.5;
const RAMP_SECONDS = 45;
const MIN_RATE = 0.03;
const MAX_RATE = 0.7;
const SLANT = 3;
const PUDDLE_LIFE = 5;
const PUDDLE_GROWTH = 1.3;
const PUDDLE_MAX = 7;
const FORM_START = 30;
const FORM_RAMP = 0.012;
const FORM_MAX = 0.75;
const FORM_SPEED = 1;
const SETTLE_GLOW = 1.1;
const HOLD = 4;
const RISE_FRAME = 0.34;
const SIT_FRAME = 0.28;
const ASK_DELAY = 1.4;
const REST = 6;
const SHIFT_GLOW = 0;
const WALK_FRAME = 0.4;
const REFORM_DELAY = 0.3;
const REFORM_RAMP = 0.6;
const REFORM_MAX = 6;
const AWAY_HOLD = 3;
const STAIR_RATE = 9;
const STAIR_SPEED = 2;
const STAIR_PAUSE = 1;
const CLIMB_PACE = 0.08;
const CLIMB_FRAME = 0.34;
const CLIMB_SCALE = 1.15;
const CLIMB_LEAN = 0.06;
const SUMMIT_FADE = 1.8;
const GONE_HOLD = 2;
const BREAK_LEAD = 0.5;
const BREAK_SPREAD = 2.2;
const BREAK_JITTER = 0.45;
const BREAK_WARN = 0.3;
const BREAK_END = 4.2;
const BREAK_STARS = 1.4;
const DEBRIS_PULL = 0.05;
const DROP_DELAY = 0.45;
const DROP_PULL = 34;
const CRACK = "#ffd3e8";
const TUMBLE_FRAME = 0.32;
const TUMBLE_FROM = 8;
const SPIN_TURN = 740;
const VANISH = 0.6;
const SPIN_LEAN = -20;
const SINK_FRAME = 0.5;
const SINK_SPIN = 22;
const STREAK_RATE = 2.6;
const VEIL_RATE = 120;
const SWOOSH_LEAD = 0.5;
const VOID = 0.9;
const STAIR_DIM = 0.72;
const SHADOW_FILL = "#2e0a1e";
const SHADOW_RIM = "#d24a8c";
const LINE_TONE = "#ffb4d6";
const STREAK_TONES = ["#4a1030", "#8a2458", "#d24a8c", "#ffd3e8"];
const STAIR_TONES = ["#5a1238", "#8e2660", "#c63c80", "#ee78b0"];
const OUTLINE = "#14030b";

const DROP_HEAD = "#ffd3e8";
const DROP_BODY = "#f2549a";
const DROP_TAIL = "#9c2a66";
const PUDDLE_EDGE = "255, 156, 203";
const PUDDLE_BODY = "158, 42, 102";
const TONES = ["#6e1846", "#be2e6e", "#f2549a", "#ffb4d6"];

export const createRain = (cols: number, rows: number): RainField => {
  const ground = rows - 4;
  const height = ROSETTA_FRAMES[0].length;
  const width = ROSETTA_FRAMES[0][0].length;
  const left = Math.round((cols - width) / 2);
  const top = ground - height + 1;
  const frames = ROSETTA_FRAMES.map((rowsOfFrame) => {
    const cells: FigureCell[] = [];
    rowsOfFrame.forEach((row, y) => {
      Array.from(row).forEach((mark, x) => {
        if (mark !== ".") cells.push({ x: left + x, y: top + y, tone: Number(mark) - 1 });
      });
    });
    return cells;
  });
  const occupied = frames.map((cells) => new Set(cells.map((cell) => cell.y * cols + cell.x)));
  const figure = frames[0];
  const standing = frames[frames.length - 1];
  const xs = standing.map((cell) => cell.x);
  const anchor = (Math.min(...xs) + Math.max(...xs)) / 2;
  const walk = ROSETTA_WALK.map((step) => {
    const cells: FigureCell[] = [];
    const walkLeft = Math.round(anchor + step.dx);
    const walkTop = ground - step.lift - step.rows.length + 1;
    step.rows.forEach((row, y) => {
      Array.from(row).forEach((mark, x) => {
        if (mark !== ".") cells.push({ x: walkLeft + x, y: walkTop + y, tone: Number(mark) - 1 });
      });
    });
    return cells;
  });
  const upward = (cells: FigureCell[], jitter: number) =>
    cells
      .map((cell, i) => ({ i, weight: cell.y + Math.random() * jitter }))
      .sort((a, b) => b.weight - a.weight)
      .map(({ i }) => i);
  const order = upward(figure, 14);
  const stairs = buildStairs(cols, ground).cells;
  return {
    cols,
    rows,
    ground,
    drops: [],
    puddles: [],
    figure,
    frames,
    occupied,
    walk,
    stride: 0,
    hold: false,
    stairs,
    stairOrder: upward(stairs, 6),
    stairSent: 0,
    stairSettled: new Float32Array(stairs.length).fill(-1),
    climb: 0,
    streaks: [],
    debris: [],
    cues: [],
    breakAt: new Float32Array(stairs.length),
    order,
    sent: 0,
    settled: new Float32Array(figure.length).fill(-1),
    formedAt: -1,
    formAt: FORM_START,
    formRamp: FORM_RAMP,
    phase: "forming",
    phaseAt: 0,
    frame: 0,
    shown: 0,
    previous: 0,
    changedAt: -1,
    time: 0,
  };
};

const enter = (field: RainField, phase: RainPhase) => {
  field.phase = phase;
  field.phaseAt = field.time;
};

const show = (field: RainField, frame: number) => {
  const next = Math.max(0, Math.min(field.frames.length - 1, Math.floor(frame)));
  if (next === field.shown) return;
  field.previous = field.shown;
  field.shown = next;
  field.changedAt = field.time;
};

export const answerRain = (field: RainField, yes: boolean) => {
  if (field.phase !== "asking") return;
  if (yes) {
    field.stride = 0;
    field.hold = false;
  }
  enter(field, yes ? "onward" : "sitting");
};

const STAIR_PHASES: RainPhase[] = ["building", "climbing", "summit", "gone", "breaking"];

const startBreak = (field: RainField) => {
  const span = Math.max(1, field.ground - 7);
  field.stairs.forEach((cell, i) => {
    field.breakAt[i] =
      BREAK_LEAD + (Math.max(0, cell.y - 7) / span) * BREAK_SPREAD + Math.random() * BREAK_JITTER;
  });
  field.debris = [];
  field.climb = 1;
  field.hold = false;
  enter(field, "breaking");
};

const crumble = (field: RainField) => {
  const since = field.time - field.phaseAt;
  field.stairs.forEach((cell, i) => {
    if (field.stairSettled[i] < 0 || since < field.breakAt[i]) return;
    field.stairSettled[i] = -2;
    field.debris.push({
      x: cell.x,
      y: cell.y,
      vx: (Math.random() - 0.5) * 0.35,
      vy: Math.random() * 0.25,
      tone: cell.tone,
    });
  });
  field.debris = field.debris.filter((piece) => {
    piece.vy += DEBRIS_PULL;
    piece.x += piece.vx;
    piece.y += piece.vy;
    return piece.y < field.rows + 2;
  });
};

const startStairs = (field: RainField) => {
  field.stairSettled.fill(-1);
  field.stairSent = 0;
  field.climb = 0;
  enter(field, "building");
};

const finishStairs = (field: RainField) => {
  field.stairSettled.fill(Math.max(0, field.time - 10));
  field.stairSent = field.stairs.length;
  field.drops = field.drops.filter((drop) => drop.stair === undefined);
};

const FALL_PHASES: RainPhase[] = ["falling", "deep"];

export const isFalling = (phase: RainPhase) => FALL_PHASES.includes(phase);

const TUMBLE_END = ROSETTA_FALL.length * TUMBLE_FRAME;
const SINK_END = WEIGHTLESS_ROUND - VANISH;
const SPIN_END = WEIGHTLESS_CLIMAX;
const SPIN_SECONDS = SPIN_END - TUMBLE_END;
const SINK_SECONDS = SINK_END - SPIN_END;
const SINK_FROM = ROSETTA_DROP[0].length;
const SINK_TO = 3;

const SPIN_STYLES: [number, FigureStyle][] = [
  [0.1, "shadow"],
  [0.21, "full"],
  [0.32, "outline"],
  [0.43, "shadow"],
  [0.54, "full"],
  [0.65, "outline"],
  [0.76, "full"],
  [0.86, "shadow"],
  [0.94, "outline"],
];

const SINK_STYLES: [number, FigureStyle][] = [
  [0.12, "outline"],
  [0.26, "shadow"],
  [0.4, "full"],
  [0.55, "outline"],
  [0.7, "full"],
  [0.84, "shadow"],
];

const STYLES: [number, FigureStyle][] = [
  [0, "full"],
  [3.1, "outline"],
  [4.4, "full"],
  ...SPIN_STYLES.map(([f, style]): [number, FigureStyle] => [TUMBLE_END + f * SPIN_SECONDS, style]),
  [SPIN_END, "full"],
  ...SINK_STYLES.map(([f, style]): [number, FigureStyle] => [SPIN_END + f * SINK_SECONDS, style]),
];

const VEILS: Veil[] = [
  { at: 0.1, half: 0.7, power: 0.9 },
  ...STYLES.slice(1).map(([at]) =>
    at === SPIN_END ? { at, half: 0.5, power: 1 } : { at, half: 0.28, power: 0.4 },
  ),
];

const styleAt = (t: number): FigureStyle =>
  STYLES.reduce<FigureStyle>((style, [at, next]) => (t >= at ? next : style), "full");

const veilAt = (t: number) =>
  VEILS.reduce((sum, veil) => Math.max(sum, veil.power * Math.max(0, 1 - Math.abs(t - veil.at) / veil.half)), 0);

const startFall = (field: RainField) => {
  field.drops = [];
  field.puddles = [];
  field.debris = [];
  enter(field, "falling");
};

const leaveFall = (field: RainField) => {
  field.streaks = [];
  field.debris = [];
  finishStairs(field);
  field.climb = 0;
  field.hold = false;
  enter(field, "climbing");
};

const shrunkCache = new Map<string, string[]>();

const shrunk = (index: number, rows: number): string[] => {
  const key = `${index}:${rows}`;
  const hit = shrunkCache.get(key);
  if (hit) return hit;
  const sprite = scaleSprite(ROSETTA_DROP, index, rows);
  const grid = Array.from({ length: sprite.height }, () => Array(sprite.width).fill("."));
  sprite.cells.forEach(([x, y, tone]) => {
    grid[y][x] = String(tone + 1);
  });
  const lines = grid.map((row) => row.join(""));
  shrunkCache.set(key, lines);
  return lines;
};

const fallPose = (field: RainField) => {
  const t = field.time - field.phaseAt;
  const ease = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, x)));
  if (t < TUMBLE_END) {
    const index = Math.min(ROSETTA_FALL.length - 1, Math.floor(t / TUMBLE_FRAME));
    const lean = index < TUMBLE_FROM ? 0 : ease((t - TUMBLE_FROM * TUMBLE_FRAME) / (TUMBLE_END - TUMBLE_FROM * TUMBLE_FRAME));
    return { frames: ROSETTA_FALL, name: "fall", index, angle: SPIN_LEAN * lean };
  }
  if (t < SPIN_END) {
    const spin = (t - TUMBLE_END) / SPIN_SECONDS;
    const last = ROSETTA_FALL.length - 1;
    const loop = ROSETTA_FALL.length - TUMBLE_FROM;
    const beat = (Math.floor((t - TUMBLE_END) / TUMBLE_FRAME) + 1) % (loop * 2 - 2);
    const index = last - (beat < loop ? beat : loop * 2 - 2 - beat);
    return { frames: ROSETTA_FALL, name: "fall", index, angle: SPIN_LEAN - SPIN_TURN * ease(spin) };
  }
  const sink = t - SPIN_END;
  const progress = Math.min(1, sink / SINK_SECONDS);
  const rows = Math.max(SINK_TO, Math.round((SINK_FROM * (SINK_TO / SINK_FROM) ** progress) / 2) * 2);
  const loop = Math.max(1, ROSETTA_DROP.filter((frame) => frame.length >= rows).length);
  const beat = loop > 1 ? Math.floor(sink / SINK_FRAME) % (loop * 2 - 2) : 0;
  const index = beat < loop ? beat : loop * 2 - 2 - beat;
  return {
    frames: [shrunk(index, rows)],
    name: `drop${rows}x${index}`,
    index: 0,
    angle: SPIN_LEAN - SPIN_TURN - SINK_SPIN * sink,
  };
};

const clearStairs = (field: RainField) => {
  field.stairSettled.fill(-1);
  field.stairSent = 0;
  field.climb = 0;
  field.drops = field.drops.filter((drop) => drop.stair === undefined);
  field.debris = [];
  field.streaks = [];
  field.stride = 0;
  field.hold = false;
  enter(field, "onward");
};

const reform = (field: RainField) => {
  field.settled.fill(-1);
  field.sent = 0;
  field.formedAt = -1;
  field.formAt = field.time + REFORM_DELAY;
  field.formRamp = REFORM_RAMP;
  field.drops = field.drops.filter((drop) => drop.target === undefined);
  field.frame = 0;
  field.shown = 0;
  field.previous = 0;
  field.stride = 0;
  field.hold = false;
  enter(field, "forming");
};

export const retreatRain = (field: RainField): boolean => {
  if (isFalling(field.phase)) {
    leaveFall(field);
    return true;
  }
  if (STAIR_PHASES.includes(field.phase)) {
    clearStairs(field);
    return true;
  }
  if (field.phase === "onward" || field.phase === "away" || field.phase === "returning") {
    field.stride = 0;
    field.frame = field.frames.length - 1 + 0.999;
    show(field, field.frame);
    enter(field, "asking");
    return true;
  }
  if (field.phase === "rising" || field.phase === "standing" || field.phase === "asking") {
    field.hold = true;
    enter(field, "sitting");
    return true;
  }
  if (field.phase === "kneeling" || field.phase === "rested" || field.phase === "sitting") {
    reform(field);
    return true;
  }
  return false;
};

const ADVANCES: RainPhase[] = [
  "forming",
  "rising",
  "standing",
  "sitting",
  "kneeling",
  "rested",
  "returning",
  "onward",
  "away",
  "building",
  "climbing",
  "summit",
  "gone",
  "breaking",
  "falling",
];

export const canAdvanceRain = (phase: RainPhase) => ADVANCES.includes(phase);

export const advanceRain = (field: RainField) => {
  const last = field.frames.length - 1;
  if (field.phase === "forming") {
    field.settled.fill(field.time);
    field.sent = field.order.length;
    field.drops = field.drops.filter((drop) => drop.target === undefined);
    field.formedAt = field.time;
    field.frame = 0;
    enter(field, "rising");
    return;
  }
  if (field.phase === "rising" || field.phase === "standing") {
    field.frame = last + 0.999;
    show(field, field.frame);
    enter(field, "asking");
    return;
  }
  if (field.phase === "sitting" || field.phase === "kneeling" || field.phase === "rested") {
    field.hold = false;
    field.frame = Math.max(0, field.frame);
    enter(field, "rising");
    return;
  }
  if (field.phase === "returning") {
    enter(field, "onward");
    return;
  }
  if (field.phase === "onward") {
    field.stride = field.walk.length - 1;
    enter(field, "away");
    return;
  }
  if (field.phase === "away") {
    field.hold = false;
    startStairs(field);
    return;
  }
  if (field.phase === "building") {
    finishStairs(field);
    field.climb = 0;
    enter(field, "climbing");
    return;
  }
  if (field.phase === "climbing" || field.phase === "summit" || field.phase === "gone") {
    startBreak(field);
    return;
  }
  if (field.phase === "breaking") {
    startFall(field);
    return;
  }
  if (field.phase === "falling") enter(field, "deep");
};

const moveFigure = (field: RainField, dt: number) => {
  const last = field.frames.length - 1;
  const since = field.time - field.phaseAt;
  if (field.phase === "forming") {
    if (field.formedAt >= 0 && field.time - field.formedAt >= HOLD) {
      field.frame = 0;
      enter(field, "rising");
    }
    return;
  }
  if (field.phase === "rising") {
    field.frame = Math.min(last + 0.999, field.frame + dt / RISE_FRAME);
    show(field, field.frame);
    if (field.frame >= last + 0.999) enter(field, "standing");
    return;
  }
  if (field.phase === "standing" && since >= ASK_DELAY) {
    enter(field, "asking");
    return;
  }
  if (field.phase === "onward") {
    field.stride = Math.min(field.walk.length - 1, field.stride + dt / WALK_FRAME);
    if (field.stride >= field.walk.length - 1) enter(field, "away");
    return;
  }
  if (field.phase === "away") {
    if (!field.hold && since >= AWAY_HOLD) startStairs(field);
    return;
  }
  if (field.phase === "building") {
    const done =
      field.stairSent >= field.stairs.length && field.stairSettled.every((at) => at >= 0);
    if (done && field.time - Math.max(...field.stairSettled) >= STAIR_PAUSE) {
      field.climb = 0;
      enter(field, "climbing");
    }
    return;
  }
  if (field.phase === "climbing") {
    const point = stairPoint(field.cols, field.ground, field.climb);
    field.climb = Math.min(1, field.climb + dt * CLIMB_PACE * (point.width / point.base));
    if (field.climb >= 1) startBreak(field);
    return;
  }
  if (field.phase === "summit") {
    if (since >= SUMMIT_FADE) enter(field, "gone");
    return;
  }
  if (field.phase === "gone") {
    if (!field.hold && since >= GONE_HOLD) startBreak(field);
    return;
  }
  if (field.phase === "breaking") {
    if (since >= BREAK_END) startFall(field);
    return;
  }
  if (field.phase === "falling") {
    if (since >= SINK_END + VANISH) enter(field, "deep");
    return;
  }
  if (field.phase === "returning") {
    field.stride = Math.min(field.stride, field.walk.length - 0.001) - dt / SIT_FRAME;
    if (field.stride <= 0) {
      field.stride = 0;
      field.frame = last + 0.999;
      show(field, field.frame);
      enter(field, "asking");
    }
    return;
  }
  if (field.phase === "sitting") {
    field.frame = Math.min(field.frame, last + 0.999) - dt / SIT_FRAME;
    show(field, Math.max(0, field.frame));
    if (field.frame <= 0) {
      field.frame = 0;
      enter(field, field.hold ? "rested" : "kneeling");
    }
    return;
  }
  if (field.phase === "kneeling" && since >= REST) enter(field, "rising");
};

const dropIn = (field: RainField, centred: boolean) => {
  const span = centred ? field.cols * 0.5 : field.cols + field.rows / SLANT;
  const offset = centred ? field.cols * 0.25 - field.rows / SLANT / 2 : -field.rows / SLANT;
  field.drops.push({
    x: Math.floor(Math.random() * span + offset),
    y: -3,
    length: 2 + Math.floor(Math.random() * 2),
    speed: 1 + (Math.random() < 0.3 ? 1 : 0),
  });
};

const formIn = (field: RainField) => {
  if (field.sent >= field.order.length) return;
  const target = field.order[field.sent++];
  field.drops.push({
    x: field.figure[target].x,
    y: -3 - Math.random() * 6,
    length: 2,
    speed: FORM_SPEED,
    target,
  });
};

const stairIn = (field: RainField) => {
  if (field.stairSent >= field.stairOrder.length) return;
  const stair = field.stairOrder[field.stairSent++];
  field.drops.push({
    x: field.stairs[stair].x,
    y: -2 - Math.random() * 4,
    length: 2,
    speed: STAIR_SPEED,
    stair,
  });
};

const spawn = (rate: number, make: () => void) => {
  let budget = rate;
  while (budget > 0) {
    if (Math.random() < Math.min(1, budget)) make();
    budget -= 1;
  }
};

const breakRise = (field: RainField) =>
  Math.min(1, Math.max(0, (field.time - field.phaseAt - BREAK_STARS) / (BREAK_END - BREAK_STARS)));

const stepStreaks = (field: RainField, dt: number) => {
  const breaking = field.phase === "breaking";
  const rise = breaking ? breakRise(field) : 1;
  const calm = (field.phase === "deep" ? 0.45 : 1) * rise;
  const now = field.time - field.phaseAt;
  const veil = field.phase === "falling" ? veilAt(now) : breaking ? rise ** 1.6 : 0;
  if (field.phase === "falling") {
    VEILS.slice(1).forEach(({ at, power }) => {
      const cue = at - SWOOSH_LEAD;
      if (now - dt < cue && now >= cue) field.cues.push(power);
    });
  }
  if (breaking) {
    const cue = BREAK_END - SWOOSH_LEAD - 0.4;
    if (now - dt < cue && now >= cue) field.cues.push(1);
  }
  spawn(STREAK_RATE * calm, () => {
    const near = Math.random() < 0.22;
    field.streaks.push({
      x: Math.floor(Math.random() * field.cols),
      y: field.rows + 2,
      length: near ? 4 + Math.floor(Math.random() * 5) : 1 + Math.floor(Math.random() * 3),
      speed: near ? 3 + Math.random() * 2 : 1 + Math.random() * 1.2,
      near,
    });
  });
  spawn(VEIL_RATE * veil, () => {
    field.streaks.push({
      x: Math.floor(Math.random() * field.cols),
      y: Math.random() * (field.rows + 12),
      length: 8 + Math.floor(Math.random() * 10),
      speed: 4 + Math.random() * 3,
      near: true,
    });
  });
  field.streaks = field.streaks.filter((streak) => {
    streak.y -= streak.speed * calm;
    return streak.y + streak.length > -2;
  });
};

export const stepRain = (field: RainField, dt: number) => {
  const before = field.time;
  field.time += dt;
  if (isFalling(field.phase)) {
    stepStreaks(field, dt);
    moveFigure(field, dt);
    return;
  }
  FIRST_DROPS.forEach((at) => {
    if (before < at && field.time >= at) dropIn(field, true);
  });
  if (field.time >= RAMP_START) {
    const ramp = Math.min(1, (field.time - RAMP_START) / RAMP_SECONDS);
    spawn(MIN_RATE + ramp * ramp * (MAX_RATE - MIN_RATE), () => dropIn(field, false));
  }
  if (field.phase === "forming" && field.time >= field.formAt) {
    const ceiling = field.formRamp === REFORM_RAMP ? REFORM_MAX : FORM_MAX;
    spawn(Math.min(ceiling, (field.time - field.formAt) * field.formRamp), () => formIn(field));
  }
  if (field.phase === "building") spawn(STAIR_RATE, () => stairIn(field));
  if (field.phase === "breaking") {
    crumble(field);
    stepStreaks(field, dt);
  }

  field.drops = field.drops.filter((drop) => {
    drop.y += drop.speed;
    if (drop.stair !== undefined) {
      if (drop.y >= field.stairs[drop.stair].y) {
        field.stairSettled[drop.stair] = field.time;
        return false;
      }
      return true;
    }
    if (drop.target !== undefined) {
      if (drop.y >= field.figure[drop.target].y) {
        field.settled[drop.target] = field.time;
        return false;
      }
      return true;
    }
    if (Math.floor(drop.y) % SLANT === 0) drop.x += 1;
    if (drop.y >= field.ground) {
      if (drop.x >= 0 && drop.x < field.cols) field.puddles.push({ x: Math.round(drop.x), age: 0 });
      return false;
    }
    return true;
  });
  field.puddles = field.puddles.filter((puddle) => (puddle.age += dt) < PUDDLE_LIFE);
  if (field.formedAt < 0 && field.sent >= field.order.length && field.settled.every((at) => at >= 0)) {
    field.formedAt = field.time;
  }
  moveFigure(field, dt);
};

const speck = (x: number, y: number) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

const drawClimber = (
  field: RainField,
  cell: (x: number, y: number, color: string) => void,
) => {
  const point = stairPoint(field.cols, field.ground, field.climb);
  const index = Math.floor(field.time / CLIMB_FRAME) % ROSETTA_CLIMB.length;
  const sprite = scaleSprite(ROSETTA_CLIMB, index, Math.max(3, point.width * CLIMB_SCALE));
  const left = Math.round(point.x - sprite.width / 2 - point.width * CLIMB_LEAN);
  const top = Math.round(point.y) - sprite.height + 1;
  const fade =
    field.phase === "summit" ? Math.min(1, (field.time - field.phaseAt) / SUMMIT_FADE) : 0;
  const shown = sprite.cells.filter(([x, y]) => speck(x, y) >= fade);
  paint(cell, shown, left, top);
};

const SIDES = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const drawDropping = (
  field: RainField,
  cell: (x: number, y: number, color: string) => void,
) => {
  const since = field.time - field.phaseAt;
  const point = stairPoint(field.cols, field.ground, 1);
  const sprite = scaleSprite(ROSETTA_CLIMB, 0, Math.max(3, point.width * CLIMB_SCALE));
  const fall = since > DROP_DELAY ? 0.5 * DROP_PULL * (since - DROP_DELAY) ** 2 : 0;
  const left = Math.round(point.x - sprite.width / 2 - point.width * CLIMB_LEAN);
  const top = Math.round(point.y + fall) - sprite.height + 1;
  if (top > field.rows) return;
  paint(cell, sprite.cells, left, top);
};

const paint = (
  cell: (x: number, y: number, color: string) => void,
  shown: [number, number, number][],
  left: number,
  top: number,
  style: FigureStyle = "full",
) => {
  const key = (x: number, y: number) => (y + 500) * 2000 + x + 500;
  const filled = new Set(shown.map(([x, y]) => key(x, y)));
  if (style === "outline") {
    shown.forEach(([x, y]) => {
      if (SIDES.some(([dx, dy]) => !filled.has(key(x + dx, y + dy)))) {
        cell(left + x, top + y, LINE_TONE);
      }
    });
    return;
  }
  shown.forEach(([x, y]) => {
    SIDES.forEach(([dx, dy]) => {
      if (!filled.has(key(x + dx, y + dy))) {
        cell(left + x + dx, top + y + dy, style === "shadow" ? SHADOW_RIM : OUTLINE);
      }
    });
  });
  shown.forEach(([x, y, tone]) =>
    cell(left + x, top + y, style === "shadow" ? SHADOW_FILL : TONES[tone]),
  );
};

const drawStreaks = (
  field: RainField,
  cell: (x: number, y: number, color: string) => void,
  front: boolean,
) =>
  field.streaks.forEach((streak) => {
    if (streak.near !== front) return;
    const x = Math.round(streak.x);
    const y = Math.floor(streak.y);
    for (let k = 0; k < streak.length; k++) {
      const shade = streak.near
        ? k === 0
          ? 3
          : k < streak.length / 2
            ? 2
            : 1
        : k === 0
          ? 1
          : 0;
      cell(x, y + k, STREAK_TONES[shade]);
    }
  });

const drawFall = (
  field: RainField,
  cell: (x: number, y: number, color: string) => void,
) => {
  const streaks = (front: boolean) => drawStreaks(field, cell, front);
  streaks(false);
  if (field.phase !== "falling") {
    streaks(true);
    return;
  }
  const t = field.time - field.phaseAt;
  const pose = fallPose(field);
  const sprite = rotateSprite(pose.name, pose.frames, pose.index, pose.angle);
  const sinking = t > SPIN_END ? Math.min(1, (t - SPIN_END) / (SINK_END - SPIN_END)) : 0;
  const cx = Math.round(field.cols / 2 + Math.sin(t * 0.6) * 3 * (1 - sinking));
  const cy = Math.round(field.rows / 2 + Math.sin(t * 0.9) * 1.5 + sinking * 4);
  const fade = t > SINK_END ? Math.min(1, (t - SINK_END) / VANISH) : 0;
  paint(
    cell,
    sprite.cells.filter(([x, y]) => speck(x, y) >= fade),
    cx,
    cy,
    styleAt(t),
  );
  streaks(true);
};

export const drawRain = (ctx: CanvasRenderingContext2D, field: RainField) => {
  const size = RAIN_CELL - 1;
  ctx.clearRect(0, 0, field.cols * RAIN_CELL, field.rows * RAIN_CELL);
  const cell = (x: number, y: number, color: string) => {
    if (x < 0 || y < 0 || x >= field.cols || y >= field.rows) return;
    ctx.fillStyle = color;
    ctx.fillRect(x * RAIN_CELL, y * RAIN_CELL, size, size);
  };

  if (isFalling(field.phase)) {
    ctx.fillStyle = `rgba(10, 2, 8, ${VOID})`;
    ctx.fillRect(0, 0, field.cols * RAIN_CELL, field.rows * RAIN_CELL);
    drawFall(field, cell);
    return;
  }

  field.puddles.forEach((puddle) => {
    const fade = 1 - puddle.age / PUDDLE_LIFE;
    const half = Math.min(PUDDLE_MAX, Math.floor(puddle.age * PUDDLE_GROWTH));
    const body = `rgba(${PUDDLE_BODY}, ${(0.55 * fade).toFixed(3)})`;
    const edge = `rgba(${PUDDLE_EDGE}, ${(0.7 * fade).toFixed(3)})`;
    for (let dx = -half; dx <= half; dx++) {
      cell(puddle.x + dx, field.ground + 1, body);
    }
    cell(puddle.x - half - 1, field.ground, edge);
    cell(puddle.x + half + 1, field.ground, edge);
    if (half > 1) {
      for (let dx = -half + 1; dx < half; dx++) cell(puddle.x + dx, field.ground + 2, body);
    }
  });

  if (STAIR_PHASES.includes(field.phase)) {
    const breaking = field.phase === "breaking";
    const since = field.time - field.phaseAt;
    const shade = field.phase === "building" ? Math.min(1, since / 2) : 1;
    ctx.fillStyle = `rgba(10, 2, 8, ${(STAIR_DIM * shade).toFixed(3)})`;
    ctx.fillRect(0, 0, field.cols * RAIN_CELL, field.rows * RAIN_CELL);
    field.stairs.forEach((target, i) => {
      const at = field.stairSettled[i];
      if (at < 0) return;
      const warn = breaking && field.breakAt[i] - since < BREAK_WARN;
      const glow = field.time - at < SETTLE_GLOW * 0.6;
      cell(
        target.x,
        target.y,
        warn
          ? Math.floor(field.time * 18 + target.x) % 2
            ? CRACK
            : STAIR_TONES[target.tone]
          : glow
            ? DROP_BODY
            : STAIR_TONES[target.tone],
      );
    });
    field.debris.forEach((piece) => {
      cell(Math.round(piece.x), Math.round(piece.y), STAIR_TONES[piece.tone]);
    });
    if (field.phase === "climbing" || field.phase === "summit") drawClimber(field, cell);
    if (breaking) {
      drawDropping(field, cell);
      ctx.fillStyle = `rgba(10, 2, 8, ${(((VOID - STAIR_DIM) / (1 - STAIR_DIM)) * breakRise(field) ** 1.3).toFixed(3)})`;
      ctx.fillRect(0, 0, field.cols * RAIN_CELL, field.rows * RAIN_CELL);
      drawStreaks(field, cell, false);
      drawStreaks(field, cell, true);
    }
  } else if (field.phase === "forming") {
    field.figure.forEach((target, i) => {
      const at = field.settled[i];
      if (at < 0) return;
      cell(target.x, target.y, field.time - at < SETTLE_GLOW ? DROP_HEAD : TONES[target.tone]);
    });
  } else if (field.phase === "onward" || field.phase === "away" || field.phase === "returning") {
    field.walk[Math.floor(field.stride)].forEach((target) => {
      cell(target.x, target.y, TONES[target.tone]);
    });
  } else {
    const fresh = field.changedAt >= 0 && field.time - field.changedAt < SHIFT_GLOW;
    const before = field.occupied[field.previous];
    field.frames[field.shown].forEach((target) => {
      const appeared = fresh && !before.has(target.y * field.cols + target.x);
      cell(target.x, target.y, appeared ? DROP_HEAD : TONES[target.tone]);
    });
  }

  field.drops.forEach((drop) => {
    const x = Math.round(drop.x);
    const y = Math.floor(drop.y);
    for (let k = 0; k < drop.length; k++) {
      const shift =
        drop.target === undefined && drop.stair === undefined
          ? Math.floor((y - k) / SLANT) - Math.floor(y / SLANT)
          : 0;
      cell(x + shift, y - k, k === 0 ? DROP_HEAD : k === drop.length - 1 ? DROP_TAIL : DROP_BODY);
    }
  });
};
