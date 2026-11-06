"use client";

import { createContext, useContext } from "react";
import { MusicContextValue } from "@/types/music";

export const MusicContext = createContext<MusicContextValue | null>(null);

export const useMusic = (): MusicContextValue => {
  const value = useContext(MusicContext);
  if (!value) throw new Error("useMusic must be used inside MusicProvider");
  return value;
};

export const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};
