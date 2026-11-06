"use client";

import { RefObject, useEffect } from "react";

const FRAME_MS = 50;
const DRIFT = 2;

const shift = (x: number, y: number, t: number): [number, number] => [
  DRIFT * (Math.sin(y * 0.021 + t * 0.7) + 0.5 * Math.sin(x * 0.013 - t * 0.45)),
  DRIFT * (Math.cos(x * 0.019 + t * 0.6) + 0.5 * Math.cos(y * 0.017 + t * 0.5)),
];

const point = (el: SVGElement, name: string): number =>
  Number(el.getAttribute(name));

export const useMapDrift = (svgRef: RefObject<SVGSVGElement | null>) => {
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lines = Array.from(svg.querySelectorAll("line")).map((el) => ({
      el,
      x1: point(el, "x1"),
      y1: point(el, "y1"),
      x2: point(el, "x2"),
      y2: point(el, "y2"),
    }));
    const circles = Array.from(svg.querySelectorAll("circle")).map((el) => ({
      el,
      x: point(el, "cx"),
      y: point(el, "cy"),
    }));
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      frame = window.requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      last = now;
      const t = now / 1000;
      lines.forEach(({ el, x1, y1, x2, y2 }) => {
        const [ax, ay] = shift(x1, y1, t);
        const [bx, by] = shift(x2, y2, t);
        el.setAttribute("x1", `${x1 + ax}`);
        el.setAttribute("y1", `${y1 + ay}`);
        el.setAttribute("x2", `${x2 + bx}`);
        el.setAttribute("y2", `${y2 + by}`);
      });
      circles.forEach(({ el, x, y }) => {
        const [dx, dy] = shift(x, y, t);
        el.setAttribute("cx", `${x + dx}`);
        el.setAttribute("cy", `${y + dy}`);
      });
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [svgRef]);
};
