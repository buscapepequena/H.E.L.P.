"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ScreenRect } from "@/types/panel";

export const useScreenRect = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const screenRef = useRef<HTMLDivElement | null>(null);
  const [rect, setRect] = useState<ScreenRect | null>(null);

  const measure = useCallback(() => {
    const scroller = scrollRef.current;
    const root = rootRef.current;
    const screen = screenRef.current;
    if (!scroller || !root || !screen) return;
    const r = root.getBoundingClientRect();
    const s = screen.getBoundingClientRect();
    setRect({
      left: s.left - r.left,
      top: s.top - r.top,
      width: s.width,
      height: s.height,
      rootWidth: scroller.clientWidth,
      rootHeight: scroller.clientHeight,
      viewTop: scroller.scrollTop,
    });
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    document.addEventListener("animationend", measure, true);
    return () => {
      observer.disconnect();
      document.removeEventListener("animationend", measure, true);
    };
  }, [measure]);

  return { scrollRef, rootRef, screenRef, rect, measure };
};
