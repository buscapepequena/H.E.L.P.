"use client";

import Image from "next/image";
import { SIM_BORDER } from "@/hooks/panelSims";
import { SimSlot } from "@/types/panel";

const pct = (value: number, total: number): string => `${(value / total) * 100}%`;

export default function SimsGrid({
  slots,
  label,
  onOpen,
}: {
  slots: SimSlot[];
  label: string;
  onOpen: (slot: SimSlot) => void;
}) {
  return (
    <div
      className="screen-scroll absolute inset-x-[2%] bottom-[3%] flex overflow-y-auto overflow-x-hidden overscroll-contain"
      style={{ top: "calc(3cqh + 5.6cqw)" }}
    >
      <div className="relative flex h-max w-full flex-row flex-wrap content-start justify-center gap-x-[3.5%] gap-y-[4cqh] px-[1%] py-[2cqh]">
        {slots.map((slot, i) => (
          <button
            key={slot.id}
            type="button"
            aria-label={`${label} ${i + 1}`}
            onClick={() => onOpen(slot)}
            className="sim-tile relative flex w-[46%] transition-transform duration-100 active:scale-[0.96]"
            style={{
              aspectRatio: `${SIM_BORDER.width} / ${SIM_BORDER.height}`,
              animationDelay: `${120 + i * 50}ms`,
            }}
          >
            <div
              className="absolute flex overflow-hidden bg-[#120e26]"
              style={{
                left: pct(SIM_BORDER.hole.x, SIM_BORDER.width),
                top: pct(SIM_BORDER.hole.y, SIM_BORDER.height),
                width: pct(SIM_BORDER.hole.width, SIM_BORDER.width),
                height: pct(SIM_BORDER.hole.height, SIM_BORDER.height),
              }}
            >
              {slot.poster && (
                <Image
                  src={slot.poster.src}
                  alt=""
                  width={slot.poster.width}
                  height={slot.poster.height}
                  unoptimized
                  draggable={false}
                  className="pointer-events-none relative flex h-full w-full select-none object-cover"
                />
              )}
            </div>
            <Image
              src={SIM_BORDER.src}
              alt=""
              width={SIM_BORDER.width}
              height={SIM_BORDER.height}
              unoptimized
              loading="eager"
              draggable={false}
              className="pointer-events-none relative flex h-full w-full select-none mix-blend-screen"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
