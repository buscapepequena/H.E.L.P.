"use client";

import Image from "next/image";
import { DOWNLOAD_PLATFORMS } from "@/hooks/panelDownloads";
import { PanelDictionary } from "@/types/panel";

const pct = (value: number, total: number): string => `${(value / total) * 100}%`;

export default function DownloadScreen({ t }: { t: PanelDictionary }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-[6cqh] px-[6cqw] pt-[6cqh]">
      <div className="pixel-crisp relative flex flex-col items-center gap-[1.6cqh] text-center font-pixel12 text-[3.4cqw] leading-none tracking-[0.06em]">
        <span className="text-[#c9b8ef]">{t.localHere}</span>
        <span className="text-[#f7a3d0]">{t.localYours}</span>
      </div>
      <div className="relative flex flex-row items-center justify-center gap-[8cqw]">
        {DOWNLOAD_PLATFORMS.map(({ id, name, icon, visible, scale, href }, i) => (
          <a
            key={id}
            href={href}
            aria-label={name}
            className="sim-tile relative flex overflow-hidden transition-transform duration-100 active:scale-[0.94]"
            style={{
              height: `calc(min(38cqh, 20cqw) * ${scale})`,
              aspectRatio: `${visible.width} / ${visible.height}`,
              animationDelay: `${120 + i * 70}ms`,
            }}
          >
            <Image
              src={icon.src}
              alt=""
              width={icon.width}
              height={icon.height}
              unoptimized
              loading="eager"
              draggable={false}
              className="pointer-events-none absolute flex max-w-none select-none"
              style={{
                left: pct(-visible.x, visible.width),
                top: pct(-visible.y, visible.height),
                width: pct(icon.width, visible.width),
                height: pct(icon.height, visible.height),
              }}
            />
          </a>
        ))}
      </div>
    </div>
  );
}
