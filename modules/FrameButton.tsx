"use client";

import { ReactNode } from "react";

const SHAPES = {
  square:
    "polygon(24% 0, 76% 0, 100% 24%, 100% 76%, 76% 100%, 24% 100%, 0 76%, 0 24%)",
  tab: "polygon(22% 0, 78% 0, 100% 100%, 0 100%)",
};

export default function FrameButton({
  label,
  shape,
  className = "",
  onClick,
  children,
}: {
  label: string;
  shape: keyof typeof SHAPES;
  className?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const clipPath = SHAPES[shape];

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`group flex shrink-0 transition-transform duration-100 active:translate-y-px ${className}`}
    >
      <div
        className="absolute inset-0 flex bg-[#0b2a55]"
        style={{ clipPath }}
      />
      <div
        className={`absolute flex bg-[linear-gradient(180deg,#e4f8ff_0%,#8fdcf8_55%,#4fb6ea_100%)] ${
          shape === "tab" ? "inset-x-[2px] bottom-0 top-[2px]" : "inset-[2px]"
        }`}
        style={{ clipPath }}
      />
      <div
        className={`absolute flex items-center justify-center bg-[linear-gradient(180deg,#26386e_0%,#111a3c_100%)] text-[#8fe9ff] transition-[filter] duration-150 group-hover:brightness-125 ${
          shape === "tab" ? "inset-x-[5px] bottom-0 top-[5px]" : "inset-[5px]"
        }`}
        style={{ clipPath }}
      >
        {children}
      </div>
    </button>
  );
}
