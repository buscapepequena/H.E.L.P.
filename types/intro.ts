export type IntroStep =
  | { type: "hold"; ms: number }
  | { type: "expand"; phrase: number }
  | { type: "collapse" }
  | { type: "emojis"; list: string[]; ms: number }
  | { type: "cover"; list: string[]; ms: number }
  | { type: "explode"; ms: number }
  | { type: "slam"; interval: number; impact: number }
  | { type: "unslam" };

export interface IntroEmoji {
  src: string;
  key: number;
  rotation: number;
  x: number;
  y: number;
  size: string;
  dx: number;
  dy: number;
  spin: number;
  delay: number;
}

export interface IntroFrame {
  phrase: number;
  dots: number;
  extras: number;
  caret: number;
  emojis: IntroEmoji[];
  exploding: boolean;
  hideText: boolean;
  plain: boolean;
  slam: number | null;
  impacts: number;
  done: boolean;
}

export interface SlamPiece {
  src: string;
  width: number;
  height: number;
  kind: "letter" | "dot";
}

export type IntroToken =
  | { kind: "core"; text: string }
  | { kind: "dot"; index: number }
  | { kind: "extra"; text: string; start: number };
