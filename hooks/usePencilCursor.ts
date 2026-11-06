"use client";

import { useEffect, useRef } from "react";

export const PENCIL = {
  src: "/images/lapiz.png",
  width: 1025,
  height: 978,
  tipX: 2,
  tipY: 964,
  display: 46,
};

export const usePencilCursor = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;
    document.documentElement.setAttribute("data-pencil", "");
    const scale = PENCIL.display / PENCIL.width;
    const offsetX = PENCIL.tipX * scale;
    const offsetY = PENCIL.tipY * scale;
    let pressed = false;
    let x = -100;
    let y = -100;

    const draw = () => {
      el.style.transform = `translate3d(${x - offsetX}px, ${y - offsetY}px, 0) rotate(${pressed ? -6 : 0}deg) scale(${pressed ? 0.92 : 1})`;
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") {
        el.style.opacity = "0";
        return;
      }
      x = e.clientX;
      y = e.clientY;
      el.style.opacity = "1";
      draw();
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pressed = true;
      draw();
    };
    const up = () => {
      pressed = false;
      draw();
    };
    const leave = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      document.documentElement.removeAttribute("data-pencil");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return cursorRef;
};
