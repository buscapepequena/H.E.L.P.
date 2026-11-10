"use client";

import { useEffect, useRef } from "react";
import { TEXT_DOT, TEXT_ROWS, drawPixelText, pixelTextWidth } from "@/hooks/pixelText";

export default function PixelText({
  text,
  unit,
  color,
  shadow,
  className,
}: {
  text: string;
  unit: number;
  color: string;
  shadow: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dots = pixelTextWidth(text);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = dots * TEXT_DOT + 2;
    canvas.height = TEXT_ROWS * TEXT_DOT + 2;
    drawPixelText(ctx, text, color, shadow);
  }, [text, color, shadow, dots]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`relative flex shrink-0 [image-rendering:pixelated] ${className ?? ""}`}
      style={{
        width: (dots + 2 / TEXT_DOT) * unit,
        height: (TEXT_ROWS + 2 / TEXT_DOT) * unit,
      }}
    />
  );
}
