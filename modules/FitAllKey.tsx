"use client";

import { playClick } from "@/hooks/soundEffects";

export default function FitAllKey({
  label,
  onFit,
}: {
  label: string;
  onFit: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        playClick(0.85);
        onFit();
      }}
      className="relative flex h-[78px] w-[168px] cursor-pointer items-center justify-center rounded-[26px] border-[5px] border-[#3b3264] bg-[linear-gradient(180deg,#f4effd_0%,#d9cff3_60%,#bfb1e8_100%)] text-[#3b3264] shadow-[inset_0_-6px_0_rgba(59,50,100,0.25),0_4px_10px_rgba(40,20,80,0.35)] transition-transform duration-100 active:translate-y-[3px] active:shadow-[inset_0_-2px_0_rgba(59,50,100,0.25)]"
    >
      <svg
        viewBox="0 0 48 48"
        className="relative flex h-[50px] w-[50px]"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx={24} cy={24} r={16} />
        <ellipse cx={24} cy={24} rx={7} ry={16} />
        <path d="M8 24h32M11 15h26M11 33h26" />
        <path d="M3 10V3h7M45 10V3h-7M3 38v7h7M45 38v7h-7" />
      </svg>
    </button>
  );
}
