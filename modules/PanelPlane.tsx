"use client";

import Image from "next/image";
import { CSSProperties, ReactNode } from "react";
import { PanelIcon } from "@/types/panel";

const holeMask = (image: PanelIcon, points: [number, number][]): string => {
  const hole = points.map(([x, y]) => `${x} ${y}`).join(" L");
  const path = `M0 0H${image.width}V${image.height}H0Z M${hole}Z`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${image.width} ${image.height}' preserveAspectRatio='none'><path fill-rule='evenodd' d='${path}'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

export default function PanelPlane({
  image,
  punch,
  className = "",
  style,
  behind,
  children,
}: {
  image: PanelIcon;
  punch?: [number, number][];
  className?: string;
  style?: CSSProperties;
  behind?: ReactNode;
  children?: ReactNode;
}) {
  const mask = punch ? holeMask(image, punch) : undefined;

  return (
    <div
      className={`relative flex overflow-hidden ${className}`}
      style={{
        aspectRatio: `${image.width} / ${image.height}`,
        containerType: "size",
        ...style,
      }}
    >
      {behind}
      <Image
        src={image.src}
        alt="H.E.L.P."
        width={image.width}
        height={image.height}
        unoptimized
        loading="eager"
        draggable={false}
        className="pointer-events-none relative flex h-full w-full select-none"
        style={
          mask
            ? {
                maskImage: mask,
                WebkitMaskImage: mask,
                maskSize: "100% 100%",
                WebkitMaskSize: "100% 100%",
              }
            : undefined
        }
      />
      {children}
    </div>
  );
}
