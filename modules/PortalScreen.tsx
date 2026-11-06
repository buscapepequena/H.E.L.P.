"use client";

import Image from "next/image";
import { CSSProperties } from "react";
import { PORTAL_LIGHTS, PORTAL_STEAM } from "@/hooks/panelPortals";
import { PanelIcon } from "@/types/panel";

export default function PortalScreen({ image }: { image: PanelIcon }) {
  const ratio = image.width / image.height;

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="relative flex shrink-0 overflow-hidden"
        style={{
          width: `max(100cqw, calc(100cqh * ${ratio}))`,
          height: `max(100cqh, calc(100cqw / ${ratio}))`,
        }}
      >
        <Image
          src={image.src}
          alt=""
          width={image.width}
          height={image.height}
          unoptimized
          loading="eager"
          draggable={false}
          className="pointer-events-none relative flex h-full w-full select-none"
        />
        {PORTAL_LIGHTS.map((light) => (
          <div
            key={`${light.x}-${light.y}`}
            className={`pointer-events-none absolute flex mix-blend-screen ${
              light.flicker ? "portal-flicker" : "portal-breathe"
            }`}
            style={
              {
                left: `${light.x - light.width / 2}%`,
                top: `${light.y - light.height / 2}%`,
                width: `${light.width}%`,
                height: `${light.height}%`,
                background: `radial-gradient(ellipse at center, ${light.color} 0%, transparent 70%)`,
                animationDuration: `${light.seconds}s`,
                animationDelay: `${light.delay}s`,
                "--low": light.low,
                "--high": light.high,
              } as CSSProperties
            }
          />
        ))}
        {PORTAL_STEAM.map((wisp) => (
          <div
            key={wisp.x}
            className="portal-steam pointer-events-none absolute flex h-[17%] w-[5%] rounded-full bg-white/50 blur-[1cqw]"
            style={{
              left: `${wisp.x}%`,
              top: `${wisp.y}%`,
              animationDelay: `${wisp.delay}s`,
            }}
          />
        ))}
        <div className="portal-shadow pointer-events-none absolute inset-[-12%] flex bg-[radial-gradient(ellipse_at_45%_45%,transparent_42%,rgba(8,4,24,0.42)_100%)] mix-blend-multiply" />
      </div>
    </div>
  );
}
