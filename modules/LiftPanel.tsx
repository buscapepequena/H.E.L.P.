"use client";

import { useLift } from "@/hooks/useLift";
import { SceneLift } from "@/types/scene";

export default function LiftPanel({
  lift,
  offsetX,
  offsetY,
  label,
}: {
  lift: SceneLift;
  offsetX: number;
  offsetY: number;
  label: string;
}) {
  const { label: floor, arrow, called, call } = useLift(lift);
  const { display, button } = lift;

  return (
    <>
      <div
        className="pointer-events-none absolute flex flex-row items-center justify-center gap-[3px] rounded-[2px] bg-[#1a0c0a] font-pixel12 leading-none text-[#ff7a36]"
        style={{
          left: display.x - offsetX,
          top: display.y + offsetY,
          width: display.width,
          height: display.height,
          fontSize: display.height * 0.72,
          textShadow: "0 0 4px #ff5a1f, 0 0 9px rgba(255, 90, 31, 0.55)",
          boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.9)",
        }}
      >
        <span className="relative flex">{floor}</span>
        {arrow && (
          <span className="lift-arrow relative flex text-[0.85em]">{arrow}</span>
        )}
      </div>
      <button
        type="button"
        aria-label={`${label} ${floor}`}
        aria-pressed={called}
        onClick={call}
        className="absolute flex items-center justify-center rounded-full border-[3px] border-[#b9bcc4] bg-[radial-gradient(circle_at_40%_35%,#f4f5f7,#9a9ea8)] shadow-[0_1px_2px_rgba(0,0,0,0.5)] transition-transform duration-100 active:scale-[0.9]"
        style={{
          left: button.x - offsetX - button.radius,
          top: button.y + offsetY - button.radius,
          width: button.radius * 2,
          height: button.radius * 2,
        }}
      >
        <span
          className={`relative flex h-[62%] w-[62%] rounded-full transition-all duration-200 ${
            called
              ? "bg-[radial-gradient(circle,#fff6d6,#ffb14a)] shadow-[0_0_8px_3px_rgba(255,190,90,0.85)]"
              : "bg-[radial-gradient(circle_at_40%_35%,#e9ebef,#a6aab3)]"
          }`}
        />
      </button>
    </>
  );
}
