import { IntroStep, IntroToken, SlamPiece } from "@/types/intro";

const DOT: SlamPiece = {
  src: "/images/punto.png",
  width: 108,
  height: 109,
  kind: "dot",
};

export const SLAM_PIECES: SlamPiece[] = [
  { src: "/images/H.png", width: 393, height: 332, kind: "letter" },
  DOT,
  { src: "/images/E.png", width: 400, height: 332, kind: "letter" },
  DOT,
  { src: "/images/L.png", width: 295, height: 329, kind: "letter" },
  DOT,
  { src: "/images/P.png", width: 383, height: 333, kind: "letter" },
  DOT,
];

export const INTRO_PHRASES: string[][] = [
  ["Housing ", "Enterprise for the ", "Less ", "Privileged"],
  ["Human–", "Engineered ", "Language ", "Platform"],
  ["Here ", "Exist ", "Leverage ", "Primitives"],
  ["Here ", "Exists ", "Lift ", "Potential"],
  ["Here ", "Exists ", "Limited ", "Partnerships"],
  ["Here ", "Exists ", "Liquidity ", "Provisions"],
];

export const EMOJI_IMAGES: string[] = [
  "/images/emoji1.png",
  "/images/emoji2.png",
  "/images/emoji3.png",
  "/images/emoji4.png",
  "/images/emoji5.png",
  "/images/emoji6.png",
  "/images/emoji7.png",
];

export const INTRO_STEPS: IntroStep[] = [
  { type: "hold", ms: 1100 },
  { type: "expand", phrase: 0 },
  { type: "hold", ms: 700 },
  { type: "emojis", list: EMOJI_IMAGES, ms: 430 },
  { type: "hold", ms: 350 },
  { type: "cover", list: EMOJI_IMAGES, ms: 2000 },
  { type: "hold", ms: 600 },
  { type: "explode", ms: 1050 },
  { type: "hold", ms: 1000 },
  { type: "slam", interval: 480, impact: 230 },
  { type: "hold", ms: 1500 },
  { type: "unslam" },
  { type: "hold", ms: 500 },
  { type: "expand", phrase: 1 },
  { type: "hold", ms: 1500 },
  { type: "collapse" },
  { type: "hold", ms: 700 },
  { type: "expand", phrase: 2 },
  { type: "hold", ms: 1500 },
  { type: "retype", phrase: 3 },
  { type: "hold", ms: 1500 },
  { type: "retype", phrase: 4 },
  { type: "hold", ms: 1500 },
  { type: "retype", phrase: 5 },
  { type: "hold", ms: 2600 },
];

export const INTRO_TIMING = {
  dot: 85,
  type: 45,
  erase: 22,
  backspace: 38,
};

export const retypeKeep = (current: string, target: string): number => {
  let p = 0;
  while (p < current.length && p < target.length && current[p] === target[p]) p++;
  if (p < current.length && current[p] !== " ") {
    p = current.lastIndexOf(" ", p - 1) + 1;
  }
  return p;
};

export const tokenize = (parts: string[]): IntroToken[] => {
  let start = 0;
  return parts.flatMap((part, index) => {
    const extra: IntroToken = { kind: "extra", text: part.slice(1), start };
    start += part.length - 1;
    return [
      { kind: "core", text: part[0] } as IntroToken,
      { kind: "dot", index } as IntroToken,
      extra,
    ];
  });
};

export const extrasLength = (parts: string[]): number =>
  parts.reduce((sum, part) => sum + part.length - 1, 0);

export const caretAfterCore = (part: number): number => part * 3;

export const caretAfterDot = (part: number): number => part * 3 + 1;

export const caretAfterExtras = (parts: string[], extras: number): number => {
  if (extras <= 0) return caretAfterCore(0);
  const index = tokenize(parts).findIndex(
    (token) =>
      token.kind === "extra" &&
      token.start < extras &&
      extras <= token.start + token.text.length,
  );
  return index < 0 ? caretAfterDot(parts.length - 1) : index;
};
