"use client";

import Image from "next/image";
import RosettaLine from "@/modules/RosettaLine";

const FRAME =
  "radial-gradient(rgba(62, 36, 104, 0.2) 0.6px, transparent 0.9px) 0 0 / 3px 3px, linear-gradient(180deg, #efe1fa 0%, #d8c0ee 55%, #c7aae2 100%)";
const SCREEN =
  "repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.035) 0px, rgba(255, 255, 255, 0.035) 1px, transparent 1px, transparent 3px), radial-gradient(rgba(120, 140, 255, 0.12) 0.6px, transparent 0.9px) 0 0 / 3px 3px, linear-gradient(180deg, #1f2770 0%, #161c58 100%)";

export default function RosettaCard({ text }: { text: string }) {
  return (
    <div
      className="rosetta-card pointer-events-none fixed left-[3vmin] top-[3vmin] z-40 flex w-[min(calc(100vw-40vh),520px)] flex-row gap-[0.8vmin] rounded-[1vmin] border border-[#3e2f63] p-[0.7vmin] opacity-95"
      style={{
        background: FRAME,
        boxShadow:
          "inset 0 1px 0 rgba(255, 255, 255, 0.75), inset 0 -2px 0 rgba(70, 40, 110, 0.35), 0 0.6vmin 2.4vmin rgba(10, 4, 24, 0.55)",
      }}
    >
      <div className="relative flex aspect-square h-[9.5vmin] shrink-0 overflow-hidden rounded-[0.5vmin] border border-[#2b2050] bg-black shadow-[inset_0_0_0_1px_rgba(243,154,214,0.5)]">
        <Image
          src="/images/rosetta.gif"
          alt="Rosetta"
          width={357}
          height={358}
          unoptimized
          draggable={false}
          className="relative flex h-full w-full select-none object-cover object-[50%_22%]"
        />
      </div>
      <div className="relative flex min-w-0 flex-1 rounded-[0.6vmin] border border-[#5b2f70] p-[0.3vmin]" style={{ background: "#f39ad6" }}>
        <div
          className="relative flex min-w-0 flex-1 items-center rounded-[0.4vmin] px-[1.6vmin] py-[1vmin]"
          style={{
            background: SCREEN,
            boxShadow: "inset 0 0 1.4vmin rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(20, 16, 60, 0.9)",
          }}
        >
          <RosettaLine text={text} fontSize="2.3vmin" />
        </div>
      </div>
    </div>
  );
}
