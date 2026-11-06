"use client";

import { useEffect, useRef } from "react";
import { useMusic } from "@/hooks/musicContext";

const IDLE = 0.07;

export default function MusicSpectrum({
  bars,
  className = "",
}: {
  bars: number;
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
        barRefs.current.forEach((bar, i) => {
          if (!bar) return;
          const value = data[Math.floor((i / bars) * usable)] / 255;
          bar.style.height = `${Math.max(IDLE, value) * 100}%`;
        });
      }
      frame = window.requestAnimationFrame(draw);
    };
    frame = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(frame);
  }, [analyserRef, bars, playing]);

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
