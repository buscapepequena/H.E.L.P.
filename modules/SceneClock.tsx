"use client";

import { useClockTime } from "@/hooks/useClockTime";
import { SceneClock as SceneClockConfig } from "@/types/scene";

const TICKS = Array.from({ length: 12 }, (_, i) => i * 30);

export default function SceneClock({ clock }: { clock: SceneClockConfig }) {
  const time = useClockTime(clock.timeZone);
  if (!time) return null;

  const secondAngle = time.seconds * 6;
  const minuteAngle = time.minutes * 6 + time.seconds * 0.1;
  const hourAngle = (time.hours % 12) * 30 + time.minutes * 0.5;
  const size = clock.radius * 2;

  return (
    <div
      className="pointer-events-none absolute flex"
      style={{
        left: clock.x - clock.radius,
        top: clock.y - clock.radius,
        width: size,
        height: size,
      }}
      aria-label={`${String(time.hours).padStart(2, "0")}:${String(time.minutes).padStart(2, "0")} ${clock.timeZone}`}
    >
      <svg viewBox="-50 -50 100 100" className="relative flex h-full w-full">
        <circle r={48} fill="#2f2b45" />
        <circle r={41} fill="#f4f1ef" />
        {TICKS.map((angle) => (
          <line
            key={angle}
            x1={0}
            y1={-37}
            x2={0}
            y2={angle % 90 === 0 ? -29 : -32}
            stroke="#2f2b45"
            strokeWidth={angle % 90 === 0 ? 3.5 : 2.5}
            strokeLinecap="round"
            transform={`rotate(${angle})`}
          />
        ))}
        <line
          x1={0}
          y1={5}
          x2={0}
          y2={-20}
          stroke="#2f2b45"
          strokeWidth={5}
          strokeLinecap="round"
          transform={`rotate(${hourAngle})`}
        />
        <line
          x1={0}
          y1={6}
          x2={0}
          y2={-31}
          stroke="#2f2b45"
          strokeWidth={3.5}
          strokeLinecap="round"
          transform={`rotate(${minuteAngle})`}
        />
        <line
          x1={0}
          y1={8}
          x2={0}
          y2={-33}
          stroke="#d9546b"
          strokeWidth={1.6}
          strokeLinecap="round"
          transform={`rotate(${secondAngle})`}
        />
        <circle r={3.5} fill="#2f2b45" />
        <circle r={1.6} fill="#d9546b" />
      </svg>
    </div>
  );
}
