export interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  target?: number;
  stair?: number;
}

export interface RainPuddle {
  x: number;
  age: number;
}

export interface FigureCell {
  x: number;
  y: number;
  tone: number;
}

export interface StairPoint {
  x: number;
  y: number;
  width: number;
  base: number;
}

export interface StairSet {
  cells: FigureCell[];
}

export interface SpriteCells {
  width: number;
  height: number;
  cells: [number, number, number][];
}

export interface WalkFrame {
  dx: number;
  lift: number;
  rows: string[];
}

export type RainPhase =
  | "forming"
  | "rising"
  | "standing"
  | "asking"
  | "onward"
  | "away"
  | "returning"
  | "sitting"
  | "kneeling"
  | "rested"
  | "building"
  | "climbing"
  | "summit"
  | "gone"
  | "breaking"
  | "falling"
  | "deep";

export interface Streak {
  x: number;
  y: number;
  length: number;
  speed: number;
  near: boolean;
}

export interface Debris {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tone: number;
}

export type FigureStyle = "full" | "shadow" | "outline";

export interface Veil {
  at: number;
  half: number;
  power: number;
}

export interface RainControl {
  back: () => boolean;
  advance: () => void;
}

export interface RainField {
  cols: number;
  rows: number;
  ground: number;
  drops: RainDrop[];
  puddles: RainPuddle[];
  figure: FigureCell[];
  frames: FigureCell[][];
  occupied: Set<number>[];
  walk: FigureCell[][];
  stride: number;
  hold: boolean;
  stairs: FigureCell[];
  stairOrder: number[];
  stairSent: number;
  stairSettled: Float32Array;
  climb: number;
  streaks: Streak[];
  debris: Debris[];
  cues: number[];
  breakAt: Float32Array;
  order: number[];
  sent: number;
  settled: Float32Array;
  formedAt: number;
  formAt: number;
  formRamp: number;
  phase: RainPhase;
  phaseAt: number;
  frame: number;
  shown: number;
  previous: number;
  changedAt: number;
  time: number;
}
