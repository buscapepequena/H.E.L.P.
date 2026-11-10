"use client";

import { playClick } from "@/hooks/soundEffects";
import PixelNeon from "@/modules/PixelNeon";

export default function PortalLine({
  text,
  label,
  delay,
  dotDelay,
  onNext,
  aside,
}: {
  text: string;
  label: string;
  delay: number;
  dotDelay: number;
  onNext?: () => void;
  aside?: boolean;
}) {
  const next = onNext
    ? () => {
        playClick(0.7);
        onNext();
      }
    : undefined;

  if (text) {
    return (
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-[8cqh]">
        <div className="pointer-events-auto relative flex">
          <PixelNeon text={text} delay={delay} label={label} onClick={next} />
        </div>
      </div>
    );
  }

  if (!next) return null;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={next}
      className={`portal-dot-in absolute left-1/2 flex h-[9cqh] w-[9cqh] -ml-[4.5cqh] cursor-pointer items-center justify-center ${aside ? "top-[1.5cqh]" : "bottom-[14cqh]"}`}
      style={{ animationDelay: `${dotDelay}ms` }}
    >
      <span
        className="portal-glimmer relative flex h-[1.6cqh] w-[1.6cqh] rounded-full bg-[#f88088]"
        style={{
          boxShadow: "0 0 1cqh 0.3cqh #f88088, 0 0 3cqh 1cqh rgba(248, 128, 136, 0.45)",
        }}
      />
    </button>
  );
}
