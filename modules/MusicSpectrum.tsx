"use client";

import { useEffect, useRef } from "react";
import { useMusic } from "@/hooks/musicContext";

const IDLE = 0.07;
const TILT = 1.2;

const linearBand = (data: Uint8Array, i: number, bars: number, usable: number) =>
  data[Math.floor((i / bars) * usable)] / 255;

const spreadBand = (data: Uint8Array, i: number, bars: number, usable: number) => {
  const from = Math.floor(usable ** (i / bars)) - 1;
  const to = Math.max(from + 1, Math.floor(usable ** ((i + 1) / bars)) - 1);
  const peak = Math.max(...data.subarray(from, to));
  return Math.min(1, (peak / 255) * (1 + (i / bars) * TILT));
};

export default function MusicSpectrum({
  bars,
  spread = false,
  className = "",
}: {
  bars: number;
  spread?: boolean;
  className?: string;
}) {
  const { analyserRef, playing } = useMusic();
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!playing) {
      barRefs.current.forEach((bar) => {
        if (bar) bar.style.height = `${IDLE * 100}%`;
      });
      return;
    }
    let frame = 0;
    const draw = () => {
      const analyser = analyserRef.current;
      if (analyser) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const usable = Math.floor(data.length * 0.7);
        const band = spread ? spreadBand : linearBand;
        barRefs.current.forEach((bar, i) => {
          if (!bar) return;
          const value = band(data, i, bars, usable);
          bar.style.height = `${Math.max(IDLE, value) * 100}%`;
        });
      }
      frame = window.requestAnimationFrame(draw);
    };
    frame = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(frame);
  }, [analyserRef, bars, playing, spread]);

  return (
    <div className={`relative flex flex-row items-end gap-[1.2%] ${className}`}>
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          ref={(el) => {
            barRefs.current[i] = el;
          }}
          className="relative flex flex-1 bg-[repeating-linear-gradient(0deg,#35d4f5_0px,#35d4f5_3px,transparent_3px,transparent_4px)]"
          style={{ height: `${IDLE * 100}%` }}
        />
      ))}
    </div>
  );
}
