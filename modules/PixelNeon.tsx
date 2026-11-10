"use client";

import { useEffect, useRef, useState } from "react";
import { NEON_SCALE, buildNeon } from "@/hooks/pixelNeon";
import { NeonSign } from "@/types/neon";

const CELL_CQH = 1.15 / NEON_SCALE;
const TICK_MS = 70;
const FLICKER_CHANCE = 0.035;

export default function PixelNeon({
  text,
  delay,
  onClick,
  label,
}: {
  text: string;
  delay: number;
  onClick?: () => void;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sign, setSign] = useState<NeonSign | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const frame = window.requestAnimationFrame(() => setSign(buildNeon(canvas, text)));
    return () => window.cancelAnimationFrame(frame);
  }, [text]);

  useEffect(() => {
    if (!sign?.letters) return;
    const faulty = new Map<number, number>();
    for (let letter = 0; letter < sign.letters; letter++) {
      faulty.set(letter, 3 + Math.floor(Math.random() * 14));
    }
    const timer = window.setInterval(() => {
      faulty.forEach((left, letter) => {
        if (left <= 1) faulty.delete(letter);
        else faulty.set(letter, left - 1);
      });
      if (Math.random() < FLICKER_CHANCE) {
        faulty.set(Math.floor(Math.random() * sign.letters), 2 + Math.floor(Math.random() * 7));
      }
      const dim = new Set<number>();
      faulty.forEach((left, letter) => {
        if (left % 2 === 0 || Math.random() < 0.35) dim.add(letter);
      });
      sign.draw(dim);
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [sign]);

  return (
    <div
      className="relative flex"
      style={{ perspective: "90cqh" }}
    >
      <button
        type="button"
        aria-label={onClick ? label : text}
        onClick={onClick}
        disabled={!onClick}
        className="portal-neon-on relative flex cursor-pointer disabled:cursor-default"
        style={{
          animationDelay: `${delay}ms`,
          width: sign ? `min(${sign.width * CELL_CQH}cqh, 94cqw)` : 0,
          aspectRatio: sign ? `${sign.width} / ${sign.height}` : undefined,
          visibility: sign ? "visible" : "hidden",
          transform: "rotateY(-17deg) rotateZ(-2.5deg)",
          transformOrigin: "50% 60%",
        }}
      >
        <canvas
          ref={canvasRef}
          className="relative flex h-full w-full [image-rendering:pixelated]"
        />
      </button>
    </div>
  );
}
