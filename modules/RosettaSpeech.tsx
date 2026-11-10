"use client";

import { PanelCrop, PanelIcon } from "@/types/panel";
import RosettaLine from "@/modules/RosettaLine";

const pct = (value: number, total: number): string => `${(value / total) * 100}%`;

export default function RosettaSpeech({
  text,
  box,
  image,
}: {
  text: string;
  box: PanelCrop;
  image: PanelIcon;
}) {
  return (
    <div
      className="pointer-events-none absolute z-10 flex flex-col justify-center px-[1.4cqw]"
      style={{
        left: pct(box.x, image.width),
        top: pct(box.y, image.height),
        width: pct(box.width, image.width),
        height: pct(box.height, image.height),
      }}
    >
      <RosettaLine
        text={text}
        fontSize={`${((box.height * 0.2) / image.height) * 100}cqh`}
      />
    </div>
  );
}
