"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PanDirection } from "@/types/scene";
import { playClick } from "@/hooks/soundEffects";

const NAV = { src: "/images/nav.png", width: 853, height: 862 };
const RECENTER = {
  src: "/images/navrecentrar.png",
  width: 884,
  height: 868,
  offsetX: 15,
  offsetY: 0,
};
const HIT = 190;
const ARROWS: { direction: PanDirection; x: number; y: number; label: string }[] = [
  { direction: "up", x: 424, y: 191, label: "Mirar arriba" },
  { direction: "left", x: 198, y: 399, label: "Mirar a la izquierda" },
  { direction: "right", x: 648, y: 399, label: "Mirar a la derecha" },
  { direction: "down", x: 424, y: 609, label: "Mirar abajo" },
];
const CENTER = { x: 424, y: 405 };
const DISPLAY_WIDTH = 120;

export default function NavPad({
  onPan,
  onReset,
}: {
  onPan: (direction: PanDirection) => void;
  onReset: () => void;
}) {
  const [recentering, setRecentering] = useState<boolean>(false);
  const releaseTimer = useRef<number | null>(null);
  const s = DISPLAY_WIDTH / NAV.width;
  const displayHeight = NAV.height * s;

  useEffect(
    () => () => {
      if (releaseTimer.current !== null) window.clearTimeout(releaseTimer.current);
    },
    [],
  );

  const press = () => {
    if (releaseTimer.current !== null) window.clearTimeout(releaseTimer.current);
    setRecentering(true);
  };

  const release = () => {
    if (releaseTimer.current !== null) window.clearTimeout(releaseTimer.current);
    releaseTimer.current = window.setTimeout(() => setRecentering(false), 140);
  };

  const hit = (x: number, y: number, size: number) => ({
    left: (x - size / 2) * s,
    top: (y - size / 2) * s,
    width: size * s,
    height: size * s,
  });

  return (
    <div
      className="relative flex drop-shadow-[0_4px_10px_rgba(40,20,80,0.35)]"
      style={{ width: DISPLAY_WIDTH, height: displayHeight }}
    >
      <Image
        src={NAV.src}
        alt=""
        width={NAV.width}
        height={NAV.height}
        unoptimized
        loading="eager"
        draggable={false}
        className="pointer-events-none absolute inset-0 flex h-full w-full"
        style={{ opacity: recentering ? 0 : 1 }}
      />
      <div
        className="pointer-events-none absolute inset-0 flex overflow-hidden"
        style={{
          opacity: recentering ? 1 : 0,
          maskImage: `url(${NAV.src})`,
          WebkitMaskImage: `url(${NAV.src})`,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
        }}
      >
        <Image
          src={RECENTER.src}
          alt=""
          width={RECENTER.width}
          height={RECENTER.height}
          unoptimized
          loading="eager"
          draggable={false}
          className="pointer-events-none absolute flex max-w-none"
          style={{
            left: -RECENTER.offsetX * s,
            top: -RECENTER.offsetY * s,
            width: RECENTER.width * s,
            height: RECENTER.height * s,
          }}
        />
      </div>
      {ARROWS.map((a) => (
        <button
          key={a.direction}
          type="button"
          aria-label={a.label}
          onClick={() => {
            playClick();
            onPan(a.direction);
          }}
          className="absolute flex cursor-pointer rounded-full"
          style={hit(a.x, a.y, HIT)}
        />
      ))}
      <button
        type="button"
        aria-label="Centrar vista"
        onPointerDown={press}
        onPointerUp={release}
        onPointerLeave={release}
        onClick={() => {
          press();
          release();
          playClick(0.8);
          onReset();
        }}
        className="absolute flex cursor-pointer rounded-full"
        style={hit(CENTER.x, CENTER.y, 130)}
      />
    </div>
  );
}
