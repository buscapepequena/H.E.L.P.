"use client";

import { useEffect, useState } from "react";

export const LETTER_MS = 55;

export default function RosettaLine({
  text,
  fontSize,
}: {
  text: string;
  fontSize: string;
}) {
  const [shown, setShown] = useState<number>(0);
  const letters = Array.from(text);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setShown((count) => {
        if (count >= letters.length) {
          window.clearInterval(timer);
          return count;
        }
        return count + 1;
      });
    }, LETTER_MS);
    return () => window.clearInterval(timer);
  }, [letters.length]);

  return (
    <span
      className="relative flex flex-wrap items-center font-rosetta leading-[1.35] text-[#ffd9de]"
      style={{
        fontSize,
        textShadow: "0 0 6px rgba(248, 128, 136, 0.65), 0 0 14px rgba(242, 84, 94, 0.35)",
      }}
    >
      {letters.slice(0, shown).join("")}
      <span className="rosetta-caret relative ml-[0.2em] flex h-[0.42em] w-[0.42em] rounded-full bg-[#ffd9de]" />
    </span>
  );
}
