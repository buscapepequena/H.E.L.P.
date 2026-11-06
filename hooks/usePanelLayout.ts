"use client";

import { useSyncExternalStore } from "react";
import { PanelLayout } from "@/types/panel";

const subscribe = (callback: () => void) => {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
};

const getLayout = (): PanelLayout => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const portrait = h >= w;
  if (!portrait && h < 500) return "tabletLandscape";
  if (w < 768) return "mobile";
  if (portrait && w < 1200) return "tablet";
  if (w < 1200) return "tabletLandscape";
  return "desktop";
};

const getServerLayout = (): PanelLayout => "desktop";

export const usePanelLayout = (): PanelLayout =>
  useSyncExternalStore(subscribe, getLayout, getServerLayout);
