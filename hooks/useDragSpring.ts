"use client";

import { MouseEvent, PointerEvent, useRef } from "react";

const SPRING = "transform 320ms cubic-bezier(0.34, 1.4, 0.64, 1)";
const MAX_TILT = 14;
const THRESHOLD = 4;

export const useDragSpring = () => {
  const pieceRef = useRef<HTMLDivElement | null>(null);
  const startRef = useRef<{
    x: number;
    y: number;
    id: number;
    dragging: boolean;
  } | null>(null);
  const suppressClick = useRef<boolean>(false);

  const place = (x: number, y: number, lifted: boolean) => {
    const piece = pieceRef.current;
    if (!piece) return;
    const tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, x * 0.06));
    piece.style.transform = lifted
      ? `translate3d(${x}px, ${y}px, 0) rotate(${tilt}deg) scale(1.06)`
      : "translate3d(0, 0, 0) rotate(0deg) scale(1)";
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    startRef.current = {
      x: event.clientX,
      y: event.clientY,
      id: event.pointerId,
      dragging: false,
    };
    suppressClick.current = false;
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = startRef.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.dragging) {
      if (Math.hypot(dx, dy) < THRESHOLD) return;
      start.dragging = true;
      suppressClick.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      if (pieceRef.current) {
        pieceRef.current.style.transition = "transform 120ms ease-out";
        pieceRef.current.style.cursor = "grabbing";
      }
      place(dx, dy, true);
      return;
    }
    if (pieceRef.current) pieceRef.current.style.transition = "none";
    place(dx, dy, true);
  };

  const release = (event: PointerEvent<HTMLDivElement>) => {
    const start = startRef.current;
    if (!start || start.id !== event.pointerId) return;
    startRef.current = null;
    if (!start.dragging) return;
    if (pieceRef.current) {
      pieceRef.current.style.transition = SPRING;
      pieceRef.current.style.cursor = "grab";
    }
    place(0, 0, false);
  };

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return {
    pieceRef,
    spring: SPRING,
    onPointerDown,
    onPointerMove,
    onPointerUp: release,
    onPointerCancel: release,
    onClickCapture,
  };
};
