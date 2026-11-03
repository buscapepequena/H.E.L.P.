"use client";

import { useEffect, useRef, useState } from "react";
import { IntroEmoji, IntroFrame } from "@/types/intro";
import {
  INTRO_PHRASES,
  INTRO_STEPS,
  INTRO_TIMING,
  SLAM_PIECES,
  caretAfterCore,
  caretAfterDot,
  caretAfterExtras,
  extrasLength,
} from "@/hooks/introSequence";
import {
  playBoom,
  playClash,
  playPop,
  playTick,
} from "@/hooks/soundEffects";

const DOTS = 4;
const POP_SYNC = 110;
const BOOM_SYNC = 90;
const EMOJI_SLOTS = [
  { x: 16, y: 22 },
  { x: 82, y: 20 },
  { x: 50, y: 15 },
  { x: 24, y: 76 },
  { x: 76, y: 78 },
  { x: 10, y: 50 },
  { x: 90, y: 50 },
  { x: 50, y: 84 },
];

const blast = (x: number, y: number) => {
  const vx = x - 50 + (Math.random() - 0.5) * 6;
  const vy = y - 50 + (Math.random() - 0.5) * 6;
  const length = Math.hypot(vx, vy) || 1;
  const distance = 90 + Math.random() * 70;
  return {
    dx: (vx / length) * distance,
    dy: (vy / length) * distance,
    spin: (Math.random() - 0.5) * 720,
    delay: Math.round(
      Math.min(1, Math.hypot(vx, vy) / 70) * 380 + Math.random() * 50,
    ),
  };
};

export const useHelpSequence = (onDone: () => void): IntroFrame => {
  const [frame, setFrame] = useState<IntroFrame>({
    phrase: 0,
    dots: DOTS,
    extras: 0,
    caret: caretAfterDot(DOTS - 1),
    emojis: [],
    exploding: false,
    hideText: false,
    plain: false,
    slam: null,
    impacts: 0,
    done: false,
  });

  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });
    const later = (fn: () => void, ms: number) => {
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) fn();
        }, ms),
      );
    };
    let phrase = 0;
    let dots = DOTS;
    let extras = 0;

    const run = async () => {
      for (const step of INTRO_STEPS) {
        if (cancelled) return;
        if (step.type === "hold") {
          await wait(step.ms);
        } else if (step.type === "expand") {
          phrase = step.phrase;
          setFrame((f) => ({ ...f, phrase, caret: caretAfterDot(dots - 1) }));
          while (dots > 0) {
            await wait(INTRO_TIMING.dot);
            if (cancelled) return;
            dots -= 1;
            playTick();
            setFrame((f) => ({ ...f, dots, caret: caretAfterCore(dots) }));
          }
          const total = extrasLength(INTRO_PHRASES[phrase]);
          while (extras < total) {
            await wait(INTRO_TIMING.type + Math.random() * 25);
            if (cancelled) return;
            extras += 1;
            playTick();
            setFrame((f) => ({
              ...f,
              extras,
              caret: caretAfterExtras(INTRO_PHRASES[phrase], extras),
            }));
          }
        } else if (step.type === "collapse") {
          while (extras > 0) {
            await wait(INTRO_TIMING.erase);
            if (cancelled) return;
            extras -= 1;
            if (extras % 3 === 0) playTick();
            setFrame((f) => ({
              ...f,
              extras,
              caret: caretAfterExtras(INTRO_PHRASES[phrase], extras),
            }));
          }
          while (dots < DOTS) {
            await wait(INTRO_TIMING.dot);
            if (cancelled) return;
            dots += 1;
            playTick();
            setFrame((f) => ({ ...f, dots, caret: caretAfterDot(dots - 1) }));
          }
        } else if (step.type === "emojis") {
          const slots = [...EMOJI_SLOTS].sort(() => Math.random() - 0.5);
          for (let i = 0; i < step.list.length; i++) {
            if (cancelled) return;
            later(playPop, POP_SYNC);
            const slot = slots[i % slots.length];
            const x = slot.x + (Math.random() - 0.5) * 6;
            const y = slot.y + (Math.random() - 0.5) * 6;
            const emoji: IntroEmoji = {
              src: step.list[i % step.list.length],
              key: Date.now() + i,
              rotation: (Math.random() - 0.5) * 50,
              x,
              y,
              size: "clamp(110px, 20vw, 260px)",
              ...blast(x, y),
            };
            setFrame((f) => ({ ...f, emojis: [...f.emojis, emoji] }));
            await wait(step.ms);
          }
        } else if (step.type === "cover") {
          const w = window.innerWidth;
          const h = window.innerHeight;
          const cell = Math.max(w, h) * 0.075;
          const size = cell * 2.3;
          const cols = Math.ceil(w / cell) + 2;
          const rows = Math.ceil(h / cell) + 2;
          const spots: { x: number; y: number }[] = [];
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              spots.push({
                x: ((c - 0.5 + (Math.random() - 0.5) * 0.5) * cell * 100) / w,
                y:
                  ((r - 0.5 + (c % 2 ? 0.5 : 0) + (Math.random() - 0.5) * 0.5) *
                    cell *
                    100) /
                  h,
              });
            }
          }
          for (let i = spots.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [spots[i], spots[j]] = [spots[j], spots[i]];
          }
          const batches = 45;
          let placed = 0;
          for (let b = 1; b <= batches; b++) {
            if (cancelled) return;
            const target = Math.round(spots.length * Math.pow(b / batches, 1.8));
            const batch: IntroEmoji[] = spots
              .slice(placed, target)
              .map((spot, k) => ({
                src: step.list[(placed + k) % step.list.length],
                key: Date.now() + 1000 + placed + k,
                rotation: (Math.random() - 0.5) * 70,
                x: spot.x,
                y: spot.y,
                size: `${size * (0.85 + Math.random() * 0.35)}px`,
                ...blast(spot.x, spot.y),
              }));
            placed = target;
            if (b % 2 === 0) later(playPop, POP_SYNC);
            setFrame((f) => ({ ...f, emojis: [...f.emojis, ...batch] }));
            await wait(step.ms / batches);
          }
          extras = 0;
          dots = DOTS;
          setFrame((f) => ({
            ...f,
            hideText: true,
            extras: 0,
            dots: DOTS,
            caret: caretAfterDot(DOTS - 1),
          }));
        } else if (step.type === "explode") {
          setFrame((f) => ({ ...f, exploding: true }));
          later(playBoom, BOOM_SYNC);
          await wait(step.ms);
          if (cancelled) return;
          setFrame((f) => ({ ...f, emojis: [], exploding: false }));
        } else if (step.type === "slam") {
          setFrame((f) => ({ ...f, slam: 0 }));
          for (let i = 0; i < SLAM_PIECES.length; i++) {
            if (cancelled) return;
            setFrame((f) => ({ ...f, slam: i + 1 }));
            await wait(step.impact);
            if (cancelled) return;
            playClash(SLAM_PIECES[i].kind === "dot" ? 0.6 : 1.4);
            setFrame((f) => ({ ...f, impacts: f.impacts + 1 }));
            await wait(
              (SLAM_PIECES[i].kind === "dot" ? step.interval * 0.6 : step.interval) -
                step.impact,
            );
          }
        } else if (step.type === "unslam") {
          setFrame((f) => ({ ...f, slam: null, hideText: false, plain: true }));
        }
      }
      if (cancelled) return;
      setFrame((f) => ({ ...f, done: true }));
      doneRef.current();
    };

    void run();
    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return frame;
};
