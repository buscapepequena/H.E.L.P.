import { ReactNode } from "react";
import { PORTAL_INK, PORTAL_PINK } from "@/hooks/portalStyle";

export default function PortalPlaque({
  ratio,
  notch = 0.22,
  className = "",
  children,
}: {
  ratio: number;
  notch?: number;
  className?: string;
  children: ReactNode;
}) {
  const h = 100;
  const w = h * ratio;
  const r = h * notch;
  const inset = 7;
  const ir = r - inset * 0.6;
  const frame = (o: number, n: number) =>
    `M ${o + n} ${o} H ${w - o - n} A ${n} ${n} 0 0 0 ${w - o} ${o + n} V ${h - o - n} A ${n} ${n} 0 0 0 ${w - o - n} ${h - o} H ${o + n} A ${n} ${n} 0 0 0 ${o} ${h - o - n} V ${o + n} A ${n} ${n} 0 0 0 ${o + n} ${o} Z`;

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="pointer-events-none absolute inset-0 flex h-full w-full overflow-visible drop-shadow-[0_0.4cqh_0.6cqh_rgba(0,0,0,0.85)]"
      >
        <path
          d={frame(2, r)}
          fill={PORTAL_INK}
          stroke={PORTAL_PINK}
          strokeWidth={4}
        />
        <path
          d={frame(inset + 2, ir)}
          fill="none"
          stroke={PORTAL_PINK}
          strokeWidth={1.6}
        />
      </svg>
      <div className="relative flex items-center justify-center">{children}</div>
    </div>
  );
}
