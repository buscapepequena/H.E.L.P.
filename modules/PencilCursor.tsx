"use client";

import Image from "next/image";
import { PENCIL, usePencilCursor } from "@/hooks/usePencilCursor";

export default function PencilCursor() {
  const cursorRef = usePencilCursor();

  return (
    <div
      ref={cursorRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[70] flex opacity-0 will-change-transform"
      style={{
        width: PENCIL.display,
        height: (PENCIL.display * PENCIL.height) / PENCIL.width,
        transformOrigin: `${(PENCIL.tipX / PENCIL.width) * 100}% ${(PENCIL.tipY / PENCIL.height) * 100}%`,
        transition: "opacity 120ms ease",
      }}
    >
      <Image
        src={PENCIL.src}
        alt=""
        width={PENCIL.width}
        height={PENCIL.height}
        unoptimized
        loading="eager"
        draggable={false}
        className="relative flex h-full w-full select-none drop-shadow-[1px_2px_2px_rgba(40,20,80,0.35)]"
      />
    </div>
  );
}
