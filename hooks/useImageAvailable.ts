"use client";

import { useEffect, useState } from "react";

export const useImageAvailable = (src: string): boolean | null => {
  const [result, setResult] = useState<{ src: string; ok: boolean } | null>(
    null,
  );

  useEffect(() => {
    let alive = true;
    const img = new window.Image();
    img.onload = () => alive && setResult({ src, ok: true });
    img.onerror = () => alive && setResult({ src, ok: false });
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src]);

  return result && result.src === src ? result.ok : null;
};
