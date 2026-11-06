"use client";

import { ReactNode } from "react";
import { MusicContext } from "@/hooks/musicContext";
import { useMusicEngine } from "@/hooks/useMusicEngine";
import MiniPlayer from "@/modules/MiniPlayer";

export default function MusicProvider({ children }: { children: ReactNode }) {
  const music = useMusicEngine();

  return (
    <MusicContext.Provider value={music}>
      {children}
      <MiniPlayer />
    </MusicContext.Provider>
  );
}
