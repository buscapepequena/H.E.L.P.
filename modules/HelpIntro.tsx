"use client";

import Image from "next/image";
import { CSSProperties, ReactNode, useEffect } from "react";
import { useHelpSequence } from "@/hooks/useHelpSequence";
import {
  EMOJI_IMAGES,
  INTRO_PHRASES,
  SLAM_PIECES,
  tokenize,
} from "@/hooks/introSequence";
import SlamRow from "@/modules/SlamRow";

const SHARD_COLORS = ["#ffd23f", "#ffb02e", "#FB4B6F", "#ffe58a", "#ff8a3d", "#3e3768"];
const SHARDS = Array.from({ length: 6 }, (_, i) => ({
  angle: (i / 6) * Math.PI * 2,
  reach: 700 + (i % 3) * 250,
  size: 14 + (i % 3) * 5,
  color: SHARD_COLORS[i % SHARD_COLORS.length],
  radius: i % 2 ? "45% 55% 40% 60%" : "50%",
}));

const noise = (seed: number): number => {
  const v = Math.sin(seed * 12.9898) * 43758.5453;
  return v - Math.floor(v) - 0.5;
};

export default function HelpIntro({ onDone }: { onDone: () => void }) {
  const frame = useHelpSequence(onDone);

  useEffect(() => {
    [...SLAM_PIECES.map((piece) => piece.src), ...EMOJI_IMAGES].forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
    void document.fonts?.load("16px 'Hiragino Local'");
  }, []);

  const tokens = tokenize(INTRO_PHRASES[frame.phrase]);
  const coreColor = frame.plain ? "#000000" : "#e0475f";
  const dotColor = frame.plain ? "#000000" : "#FB4B6F";

  const pieces: ReactNode[] = tokens.map((token, i) => {
    if (token.kind === "core") {
      return (
        <span key={i} style={{ color: coreColor }}>
          {token.text}
        </span>
      );
    }
    if (token.kind === "dot") {
      return token.index < frame.dots ? (
        <span key={i} style={{ color: dotColor }}>
          .
        </span>
      ) : null;
    }
    const visible = Math.max(
      0,
      Math.min(token.text.length, frame.extras - token.start),
    );
    return visible ? <span key={i}>{token.text.slice(0, visible)}</span> : null;
  });

  pieces.splice(
    frame.caret + 1,
    0,
    <span
      key="caret"
      className="intro-caret ml-[0.04em] inline-block h-[0.9em] w-[0.06em] translate-y-[0.12em]"
      style={{ background: coreColor }}
    />,
  );

  return (
    <div className="intro-fade-in absolute inset-0 flex cursor-default items-center justify-center overflow-hidden bg-white px-6">
      {frame.exploding && (
        <div className="explode-flash pointer-events-none absolute inset-0 z-10 flex bg-white" />
      )}
      {frame.slam !== null && (
        <SlamRow landed={frame.slam} impacts={frame.impacts} />
      )}

      <div
        className="relative flex max-w-[92vw] flex-row flex-wrap items-baseline justify-center text-center leading-[1.15] tracking-[-0.01em]"
        style={{
          color: frame.plain ? "#000000" : "#2a2440",
          fontFamily: frame.plain
            ? "'Hiragino Local', 'Hiragino Sans', 'Helvetica Neue', sans-serif"
            : "'Sketchy Notes', 'Comic Sans MS', cursive",
          fontWeight: 400,
          fontSize: "clamp(28px, 4.8vw, 64px)",
          opacity: frame.slam === null && !frame.hideText ? 1 : 0,
          transition: "opacity 200ms ease",
        }}
      >
        <span className="relative whitespace-pre-wrap">
          {pieces}
        </span>
      </div>

      <div
        className={`pointer-events-none absolute inset-0 flex ${frame.exploding ? "explode-shake is-exploding" : ""}`}
      >
        {frame.emojis.map((emoji) => (
          <div
            key={emoji.key}
            className="absolute flex"
            style={{
              left: `${emoji.x}%`,
              top: `${emoji.y}%`,
              width: emoji.size,
              height: emoji.size,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className="emoji-pop emoji-core relative flex h-full w-full select-none"
              style={
                {
                  "--r": `${emoji.rotation}deg`,
                  "--d": `${emoji.delay}ms`,
                } as CSSProperties
              }
            >
              <Image
                src={emoji.src}
                alt=""
                width={360}
                height={330}
                unoptimized
                loading="eager"
                draggable={false}
                className="pointer-events-none relative flex h-full w-full object-contain"
              />
            </div>
            {SHARDS.map((shard, i) => {
                const angle =
                  shard.angle + noise(emoji.key + i) * 0.6 + Math.atan2(emoji.dy, emoji.dx) * 0.15;
                const reach = shard.reach * (0.8 + noise(emoji.key * 3 + i) * 0.6);
                return (
                  <div
                    key={i}
                    className="shard absolute left-1/2 top-1/2 flex"
                    style={
                      {
                        width: `${shard.size}%`,
                        height: `${shard.size * (0.7 + noise(emoji.key + i * 7) * 0.5)}%`,
                        background: shard.color,
                        borderRadius: shard.radius,
                        "--sx": `${Math.cos(angle) * reach}%`,
                        "--sy": `${Math.sin(angle) * reach}%`,
                        "--sr": `${noise(emoji.key + i * 11) * 540}deg`,
                        "--d": `${emoji.delay + 85}ms`,
                      } as CSSProperties
                    }
                  />
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
