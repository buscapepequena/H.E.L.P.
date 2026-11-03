"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { DoorPanelConfig, DoorPanelStatus } from "@/types/scene";
import { playBuzz, playLatch, playSound } from "@/hooks/soundEffects";

const SIZE = { width: 350, height: 177 };
const DISPLAY_WIDTH = 140;

export default function DoorPanel({
  panel,
  visible,
  fadeDuration,
  onComplete,
}: {
  panel: DoorPanelConfig;
  visible: boolean;
  fadeDuration: number;
  onComplete: (next?: string) => void;
}) {
  const [status, setStatus] = useState<DoorPanelStatus>("neutral");
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  const ring = () => {
    if (status !== "neutral") return;
    setStatus("buzzing");
    playSound(panel.sound, () => playBuzz(panel.buzzDuration / 1000));
    timers.current.push(
      window.setTimeout(() => {
        playLatch();
        setStatus("active");
      }, panel.buzzDuration),
      window.setTimeout(
        () => onComplete(panel.next),
        panel.buzzDuration + panel.activeDuration,
      ),
    );
  };

  const layer = (src: string, show: boolean) => (
    <Image
      src={src}
      alt=""
      width={SIZE.width}
      height={SIZE.height}
      unoptimized
      loading="eager"
      draggable={false}
      className="pointer-events-none absolute inset-0 flex h-full w-full"
      style={{ opacity: show ? 1 : 0 }}
    />
  );

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-row justify-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: `opacity ${fadeDuration}ms ease, transform ${fadeDuration}ms ease`,
      }}
    >
      <button
        type="button"
        aria-label="Abrir la puerta"
        onClick={ring}
        className="relative flex drop-shadow-[0_8px_18px_rgba(20,10,50,0.55)]"
        style={{
          width: DISPLAY_WIDTH,
          height: (DISPLAY_WIDTH * SIZE.height) / SIZE.width,
          cursor: status === "neutral" ? "pointer" : "default",
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        {layer(panel.neutral, status !== "active")}
        {layer(panel.active, status === "active")}
      </button>
    </div>
  );
}
