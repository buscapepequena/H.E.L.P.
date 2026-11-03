"use client";

import Image from "next/image";
import { CSSProperties, useEffect, useRef } from "react";
import { SLAM_PIECES } from "@/hooks/introSequence";

const LETTER_HEIGHT = "min(14.5vw, 30vh, 240px)";
const ROTATIONS = [-3, 2, 2.5, -2, -2, 3, 3.5, -1.5];

export default function SlamRow({
  landed,
  impacts,
}: {
  landed: number;
  impacts: number;
}) {
  const shakeRef = useRef<HTMLDivElement | null>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!impacts) return;
    const piece = SLAM_PIECES[(impacts - 1) % SLAM_PIECES.length];
    const power = piece.kind === "dot" ? 8 : 26;
    const jolt = () => (Math.random() - 0.5) * 2 * power;
    shakeRef.current?.animate(
      [
        { transform: "translate(0, 0)" },
        { transform: `translate(${jolt()}px, ${power}px)` },
        { transform: `translate(${jolt()}px, ${-power * 0.6}px)` },
        { transform: `translate(${jolt() * 0.5}px, ${power * 0.3}px)` },
        { transform: "translate(0, 0)" },
      ],
      { duration: 380, easing: "ease-out" },
    );
    flashRef.current?.animate(
      [{ opacity: piece.kind === "dot" ? 0.06 : 0.14 }, { opacity: 0 }],
      { duration: 220, easing: "ease-out" },
    );
  }, [impacts]);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div
        ref={flashRef}
        className="absolute inset-0 flex bg-[#2a2440] opacity-0"
      />
      <div
        ref={shakeRef}
        className="relative flex flex-row items-end justify-center gap-[1vw]"
      >
        {SLAM_PIECES.map((piece, i) => {
          const isDot = piece.kind === "dot";
          const height = isDot
            ? `calc(${LETTER_HEIGHT} * 0.3)`
            : `calc(${LETTER_HEIGHT} * ${piece.height / 332})`;
          const down = i < landed;
          return (
            <div
              key={i}
              className="relative flex"
              style={{
                height,
                aspectRatio: `${piece.width} / ${piece.height}`,
                marginBottom: isDot ? `calc(${LETTER_HEIGHT} * 0.02)` : 0,
              }}
            >
              {down && (
                <div className="slam-ring absolute bottom-[-6%] left-1/2 flex h-[22%] w-[150%] rounded-[50%] border-[3px] border-[#FB4B6F]" />
              )}
              <div
                className={`relative flex h-full w-full origin-bottom ${down ? "slam-land" : "opacity-0"}`}
                style={{ "--r": `${ROTATIONS[i]}deg` } as CSSProperties}
              >
                <Image
                  src={piece.src}
                  alt=""
                  width={piece.width}
                  height={piece.height}
                  unoptimized
                  loading="eager"
                  draggable={false}
                  className="pointer-events-none relative flex h-full w-full drop-shadow-[0_10px_18px_rgba(10,5,30,0.55)]"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
