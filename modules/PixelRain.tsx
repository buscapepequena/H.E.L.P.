"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import {
  RAIN_CELL,
  answerRain,
  createRain,
  drawRain,
  advanceRain,
  retreatRain,
  stepRain,
} from "@/hooks/pixelRain";
import { playSwoosh } from "@/hooks/psychicSound";
import { RainControl, RainField, RainPhase } from "@/types/rain";
import RainChoice from "@/modules/RainChoice";

const ROWS = 72;
const FRAME_MS = 55;

export default function PixelRain({
  delay,
  question,
  yes,
  no,
  controlRef,
  onPhase,
  onChoice,
}: {
  delay: number;
  question: string;
  yes: string;
  no: string;
  controlRef: RefObject<RainControl | null>;
  onPhase: (phase: RainPhase) => void;
  onChoice: (yes: boolean) => void;
}) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fieldRef = useRef<RainField | null>(null);
  const [phase, setPhase] = useState<RainPhase>("forming");
  const [unit, setUnit] = useState<number>(2);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!box || !canvas || !ctx) return;
    const width = box.offsetWidth;
    const height = box.offsetHeight;
    const cols = Math.min(
      ROWS * 3,
      Math.max(40, Math.round((ROWS * width) / Math.max(1, height))),
    );
    canvas.width = cols * RAIN_CELL;
    canvas.height = ROWS * RAIN_CELL;
    setUnit(Math.max(1.6, Math.min(3, height / 200)));
    const field = createRain(cols, ROWS);
    fieldRef.current = field;
    let timer: number | null = null;
    let seen: RainPhase = field.phase;
    const start = window.setTimeout(() => {
      timer = window.setInterval(() => {
        stepRain(field, FRAME_MS / 1000);
        drawRain(ctx, field);
        field.cues.splice(0).forEach((power) => playSwoosh(power));
        if (field.phase !== seen) {
          seen = field.phase;
          setPhase(seen);
        }
      }, FRAME_MS);
    }, delay);
    return () => {
      window.clearTimeout(start);
      if (timer !== null) window.clearInterval(timer);
    };
  }, [delay]);

  useEffect(() => {
    onPhase(phase);
  }, [phase, onPhase]);

  useEffect(() => {
    controlRef.current = {
      back: () => {
        const field = fieldRef.current;
        if (!field || !retreatRain(field)) return false;
        setPhase(field.phase);
        return true;
      },
      advance: () => {
        const field = fieldRef.current;
        if (!field) return;
        advanceRain(field);
        setPhase(field.phase);
      },
    };
    return () => {
      controlRef.current = null;
      onPhase("forming");
    };
  }, [controlRef, onPhase]);

  const answer = useCallback((value: boolean) => {
    const field = fieldRef.current;
    if (!field) return;
    answerRain(field, value);
    setPhase(field.phase);
    onChoice(value);
  }, [onChoice]);

  return (
    <div ref={boxRef} className="pointer-events-none absolute inset-0 flex">
      <canvas
        ref={canvasRef}
        className="relative flex h-full w-full object-cover [image-rendering:pixelated]"
      />
      {phase === "asking" && (
        <RainChoice question={question} yes={yes} no={no} unit={unit} onAnswer={answer} />
      )}
    </div>
  );
}
