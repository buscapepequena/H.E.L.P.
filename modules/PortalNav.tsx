"use client";

import { useId } from "react";
import { playClick } from "@/hooks/soundEffects";
import {
  PORTAL_FONT,
  PORTAL_INK,
  PORTAL_PINK,
  PORTAL_SHADE,
} from "@/hooks/portalStyle";
import { PanelDictionary } from "@/types/panel";
import { PanDirection } from "@/types/scene";
import PortalPlaque from "@/modules/PortalPlaque";

const ARROWS: {
  direction: PanDirection;
  x: number;
  y: number;
  rotation: number;
  labelKey: "portalUp" | "portalDown" | "portalLeft" | "portalRight";
}[] = [
  { direction: "up", x: 60, y: 19, rotation: 0, labelKey: "portalUp" },
  { direction: "right", x: 101, y: 60, rotation: 90, labelKey: "portalRight" },
  { direction: "down", x: 60, y: 101, rotation: 180, labelKey: "portalDown" },
  { direction: "left", x: 19, y: 60, rotation: 270, labelKey: "portalLeft" },
];
const BOX = 120;
const ARROW = 30;
const KNOB = 26;

const at = (x: number, y: number, size: number) => ({
  left: `${((x - size / 2) / BOX) * 100}%`,
  top: `${((y - size / 2) / BOX) * 100}%`,
  width: `${(size / BOX) * 100}%`,
  height: `${(size / BOX) * 100}%`,
});

const press =
  "absolute flex cursor-pointer items-center justify-center transition-[transform,filter] duration-150 hover:drop-shadow-[0_0_0.9cqh_rgba(248,128,136,0.9)] active:scale-[0.88]";

export default function PortalNav({
  t,
  onPan,
  onReset,
  onZoomIn,
  onZoomOut,
  canZoomIn,
  canZoomOut,
}: {
  t: PanelDictionary;
  onPan: (direction: PanDirection) => void;
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
}) {
  const dots = `portal-dots-${useId().replace(/:/g, "")}`;

  return (
    <div
      data-control
      className="relative flex flex-row items-end gap-[1.6cqh]"
      style={{ fontFamily: PORTAL_FONT }}
    >
      <div className="relative flex flex-col gap-[1.2cqh]">
        {[
          { sign: "+", label: t.portalZoomIn, run: onZoomIn, enabled: canZoomIn },
          { sign: "−", label: t.portalZoomOut, run: onZoomOut, enabled: canZoomOut },
        ].map((key) => (
          <button
            key={key.sign}
            type="button"
            aria-label={key.label}
            disabled={!key.enabled}
            onClick={() => {
              playClick(key.sign === "+" ? 1.15 : 0.9);
              key.run();
            }}
            className="relative flex cursor-pointer transition-[transform,filter,opacity] duration-150 hover:drop-shadow-[0_0_0.9cqh_rgba(248,128,136,0.9)] active:scale-[0.9] disabled:cursor-default disabled:opacity-40 disabled:hover:drop-shadow-none"
          >
            <PortalPlaque ratio={1.25} notch={0.26} className="h-[7.5cqh]">
              <span
                className="relative flex text-[6cqh] font-bold leading-none"
                style={{ color: PORTAL_PINK }}
              >
                {key.sign}
              </span>
            </PortalPlaque>
          </button>
        ))}
      </div>

      <div className="relative flex h-[22cqh] w-[22cqh] drop-shadow-[0_0.6cqh_1cqh_rgba(0,0,0,0.85)]">
        <svg
          viewBox={`0 0 ${BOX} ${BOX}`}
          className="pointer-events-none absolute inset-0 flex h-full w-full"
        >
          <defs>
            <pattern id={dots} width={3} height={3} patternUnits="userSpaceOnUse">
              <circle cx={1.5} cy={1.5} r={0.6} fill={PORTAL_PINK} opacity={0.5} />
            </pattern>
          </defs>
          <circle cx={60} cy={60} r={58} fill={PORTAL_INK} stroke={PORTAL_PINK} strokeWidth={2.5} />
          <circle
            cx={60}
            cy={60}
            r={53.5}
            fill="none"
            stroke={PORTAL_PINK}
            strokeWidth={5}
            strokeDasharray="1.1 2"
          />
          <circle cx={60} cy={60} r={49} fill={`url(#${dots})`} stroke={PORTAL_PINK} strokeWidth={1.6} />
          <rect x={55} y={11} width={10} height={98} fill={PORTAL_INK} stroke={PORTAL_PINK} strokeWidth={1.4} />
          <rect x={11} y={55} width={98} height={10} fill={PORTAL_INK} stroke={PORTAL_PINK} strokeWidth={1.4} />
          <rect x={56} y={56} width={8} height={8} fill={PORTAL_INK} />
        </svg>
        {ARROWS.map((arrow) => (
          <button
            key={arrow.direction}
            type="button"
            aria-label={t[arrow.labelKey]}
            onClick={() => {
              playClick();
              onPan(arrow.direction);
            }}
            className={press}
            style={at(arrow.x, arrow.y, ARROW)}
          >
            <svg
              viewBox="0 0 24 24"
              className="relative flex h-full w-full"
              style={{ transform: `rotate(${arrow.rotation}deg)` }}
            >
              <path
                d="M12 3 L21 19 H3 Z"
                fill={PORTAL_PINK}
                stroke={PORTAL_INK}
                strokeWidth={1.6}
                strokeLinejoin="round"
              />
              <path d="M12 8 L17 17 H7 Z" fill="none" stroke={PORTAL_SHADE} strokeWidth={1} />
              <path d="M9 15.5 H15 M10.4 13 H13.6" stroke={PORTAL_INK} strokeWidth={0.9} />
            </svg>
          </button>
        ))}
        <button
          type="button"
          aria-label={t.portalCenter}
          onClick={() => {
            playClick(0.8);
            onReset();
          }}
          className={press}
          style={at(60, 60, KNOB)}
        >
          <svg viewBox="0 0 24 24" className="relative flex h-full w-full">
            <circle cx={12} cy={12} r={10.5} fill={PORTAL_INK} stroke={PORTAL_PINK} strokeWidth={2} />
            <circle cx={12} cy={12} r={6.5} fill="none" stroke={PORTAL_PINK} strokeWidth={1} />
            <circle cx={12} cy={12} r={3} fill={PORTAL_PINK} />
          </svg>
        </button>
      </div>
    </div>
  );
}
