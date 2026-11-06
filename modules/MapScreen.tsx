"use client";

import { ReactNode } from "react";

export default function MapScreen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <div
      className="screen-swap absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,#2a2152_0%,#0d0a1c_80%)]"
      style={{ containerType: "size" }}
    >
      <div className="pixel-crisp pointer-events-none absolute left-[3%] top-[3%] z-10 flex flex-row items-baseline gap-[0.6em] font-pixel12 text-[3.9cqw] uppercase leading-none tracking-[0.06em] text-[#f7a3d0]">
        <span>{title}</span>
        <span className="text-[#c9b8ef]">{subtitle}</span>
      </div>
      {children}
    </div>
  );
}
