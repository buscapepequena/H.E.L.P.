"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { playClick } from "@/hooks/soundEffects";

const SOURCE = { width: 1318, height: 696 };
const CROP = { x: 0, y: 0, width: 1318, height: 696 };
const KEYS = {
  out: {
    image: "/images/zoomoutpresionado.png",
    x: 75,
    y: 80,
    width: 549,
    height: 485,
    label: "Alejar",
  },
  in: {
    image: "/images/zoominpresionado.png",
    x: 696,
    y: 77,
    width: 547,
    height: 486,
    label: "Acercar",
  },
} as const;
const DISPLAY_WIDTH = 168;

type ZoomKey = keyof typeof KEYS;

export default function ZoomKeys({
  onZoomIn,
  onZoomOut,
  canZoomIn,
  canZoomOut,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
}) {
  const [pressed, setPressed] = useState<ZoomKey | null>(null);
  const releaseTimer = useRef<number | null>(null);
  const s = DISPLAY_WIDTH / CROP.width;

  const press = (key: ZoomKey) => {
    if (releaseTimer.current !== null) window.clearTimeout(releaseTimer.current);
    setPressed(key);
  };

  const release = () => {
    if (releaseTimer.current !== null) window.clearTimeout(releaseTimer.current);
    releaseTimer.current = window.setTimeout(() => setPressed(null), 110);
  };

  const keyButton = (key: ZoomKey) => {
    const k = KEYS[key];
    const enabled = key === "in" ? canZoomIn : canZoomOut;
    return (
      <button
        type="button"
        aria-label={k.label}
        disabled={!enabled}
        onPointerDown={() => enabled && press(key)}
        onPointerUp={release}
        onPointerLeave={release}
        onClick={() => {
          playClick(key === "in" ? 1.1 : 0.9);
          if (key === "in") onZoomIn();
          else onZoomOut();
        }}
        className="absolute flex cursor-pointer disabled:cursor-default"
        style={{
          left: (k.x - CROP.x) * s,
          top: (k.y - CROP.y) * s,
          width: k.width * s,
          height: k.height * s,
        }}
      >
        <Image
          src={k.image}
          alt=""
          width={k.width}
          height={k.height}
          unoptimized
          loading="eager"
          draggable={false}
          className="pointer-events-none relative flex h-full w-full"
          style={{ opacity: pressed === key ? 1 : 0 }}
        />
      </button>
    );
  };

  return (
    <div
      className="relative flex overflow-hidden drop-shadow-[0_4px_10px_rgba(40,20,80,0.35)]"
      style={{ width: DISPLAY_WIDTH, height: CROP.height * s }}
    >
      <Image
        src="/images/zoom.png"
        alt=""
        width={SOURCE.width}
        height={SOURCE.height}
        unoptimized
        loading="eager"
        draggable={false}
        className="pointer-events-none absolute flex max-w-none"
        style={{
          left: -CROP.x * s,
          top: -CROP.y * s,
          width: SOURCE.width * s,
          height: SOURCE.height * s,
        }}
      />
      {keyButton("out")}
      {keyButton("in")}
    </div>
  );
}
