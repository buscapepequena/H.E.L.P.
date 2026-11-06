"use client";

import Image from "next/image";
import { PanelCrop, PanelIcon } from "@/types/panel";

const pct = (value: number, total: number): string => `${(value / total) * 100}%`;

export default function FramedGif({
  frame,
  box,
}: {
  frame: PanelIcon;
  box: PanelCrop;
}) {
  return (
    <Image
      src="/images/rosetta.gif"
      alt="Rosetta"
      width={357}
      height={358}
      unoptimized
      draggable={false}
      className="pointer-events-none absolute flex select-none object-cover object-[50%_22%]"
      style={{
        left: pct(box.x, frame.width),
        top: pct(box.y, frame.height),
        width: pct(box.width, frame.width),
        height: pct(box.height, frame.height),
      }}
    />
  );
}
