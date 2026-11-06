"use client";

import { PointerEvent } from "react";
import { useMusic } from "@/hooks/musicContext";

export default function MusicSeek({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  const { time, duration, seek } = useMusic();
  const progress = duration ? Math.min(1, time / duration) : 0;

  const fromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    seek((event.clientX - rect.left) / rect.width);
  };

  return (
    <div
      role="slider"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      tabIndex={0}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        fromPointer(event);
      }}
      onPointerMove={(event) => {
        if (event.buttons) fromPointer(event);
      }}
      className={`relative flex touch-none items-center rounded-full border border-[#7fd9f2]/70 bg-[#0a1230] ${className}`}
    >
      <div
        className="relative flex h-full rounded-full bg-[#35d4f5]"
        style={{ width: `${progress * 100}%` }}
      />
      <div
        className="absolute top-1/2 flex aspect-square h-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#35d4f5] bg-white"
        style={{ left: `${progress * 100}%` }}
      />
    </div>
  );
}
