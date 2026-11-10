"use client";

import { useEffect, useRef, useState } from "react";
import PixelText from "@/modules/PixelText";

const LIGHT = "#ffd3e8";
const DIM = "#9c5a7c";
const ARROW = "#f2549a";
const SHADOW = "rgba(30, 4, 18, 0.85)";

export default function RainChoice({
  question,
  yes,
  no,
  unit,
  onAnswer,
}: {
  question: string;
  yes: string;
  no: string;
  unit: number;
  onAnswer: (yes: boolean) => void;
}) {
  const [pick, setPick] = useState<boolean>(true);
  const pickRef = useRef<boolean>(true);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
        setPick((value) => !value);
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onAnswer(pickRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onAnswer]);

  useEffect(() => {
    pickRef.current = pick;
  }, [pick]);

  const option = (value: boolean, label: string) => (
    <button
      type="button"
      aria-label={label}
      onMouseEnter={() => setPick(value)}
      onFocus={() => setPick(value)}
      onClick={() => onAnswer(value)}
      className="relative flex flex-row items-center cursor-pointer"
      style={{ gap: unit * 3 }}
    >
      <PixelText
        text="▶"
        unit={unit}
        color={ARROW}
        shadow={SHADOW}
        className={pick === value ? "intro-caret" : "opacity-0"}
      />
      <PixelText text={label} unit={unit} color={pick === value ? LIGHT : DIM} shadow={SHADOW} />
    </button>
  );

  return (
    <div
      className="intro-fade-in pointer-events-auto absolute flex flex-col rounded-[2px] border border-[#ffb4d6]/80 bg-[#2a0a1c]/70"
      style={{
        left: "5%",
        top: "50%",
        transform: "translateY(-50%)",
        padding: `${unit * 4}px ${unit * 5}px`,
        gap: unit * 4,
      }}
    >
      <div className="relative flex flex-row items-end" style={{ gap: unit }}>
        <PixelText text={question} unit={unit} color={LIGHT} shadow={SHADOW} />
        <PixelText text="_" unit={unit} color={LIGHT} shadow={SHADOW} className="intro-caret" />
      </div>
      <div className="relative flex flex-row" style={{ gap: unit * 10 }}>
        {option(true, yes)}
        {option(false, no)}
      </div>
    </div>
  );
}
