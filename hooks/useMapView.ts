"use client";

import {
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { MAP_LOCATIONS } from "@/hooks/mapLocations";
import { MapViewState } from "@/types/map";
import { PanDirection } from "@/types/scene";

const MIN_ZOOM = 0.1;
const FIT_PADDING = 90;
const CONTROLS_GUTTER = 90;
const MAX_ZOOM = 3;
const ZOOM_STEP = 1.4;
const PAN_STEP = 80;
const LIMIT = Math.max(
  650,
  ...MAP_LOCATIONS.map((place) => Math.max(Math.abs(place.x), Math.abs(place.y)) + 400),
);
const HOME_ZOOM = 2.6;

const isControl = (target: EventTarget): boolean =>
  target instanceof Element &&
  target.closest("button, [data-control]") !== null;

const clamp = (view: MapViewState): MapViewState => {
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.zoom));
  const limit = LIMIT * zoom;
  return {
    zoom,
    x: Math.min(limit, Math.max(-limit, view.x)),
    y: Math.min(limit, Math.max(-limit, view.y)),
  };
};

export const useMapView = (centerX = 0, centerY = 0) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<number | null>(null);
  const [view, setView] = useState<MapViewState>({
    x: -centerX,
    y: -centerY,
    zoom: 1,
  });
  const [animated, setAnimated] = useState<boolean>(false);
  const [dragging, setDragging] = useState<boolean>(false);

  const zoomAt = useCallback(
    (factor: number, cx: number, cy: number, animate: boolean) => {
      setAnimated(animate);
      setView((v) => {
        const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.zoom * factor));
        const ratio = zoom / v.zoom;
        return clamp({
          zoom,
          x: cx - (cx - v.x) * ratio,
          y: cy - (cy - v.y) * ratio,
        });
      });
    },
    [],
  );

  const fromCenter = (el: HTMLElement, clientX: number, clientY: number) => {
    const rect = el.getBoundingClientRect();
    return {
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2,
    };
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const point = fromCenter(el, e.clientX, e.clientY);
      zoomAt(Math.exp(-e.deltaY * 0.0015), point.x, point.y, false);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const pan = useCallback((direction: PanDirection) => {
    const dx =
      direction === "left" ? PAN_STEP : direction === "right" ? -PAN_STEP : 0;
    const dy =
      direction === "up" ? PAN_STEP : direction === "down" ? -PAN_STEP : 0;
    setAnimated(true);
    setView((v) => clamp({ ...v, x: v.x + dx, y: v.y + dy }));
  }, []);

  const reset = useCallback(() => {
    setAnimated(true);
    setView({ x: -centerX, y: -centerY, zoom: 1 });
  }, [centerX, centerY]);

  const fitAll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const xs = MAP_LOCATIONS.map((place) => place.x);
    const ys = MAP_LOCATIONS.map((place) => place.y);
    const left = Math.min(...xs) - FIT_PADDING;
    const right = Math.max(...xs) + FIT_PADDING;
    const top = Math.min(...ys) - FIT_PADDING;
    const bottom = Math.max(...ys) + FIT_PADDING;
    const zoom = Math.min(
      MAX_ZOOM,
      Math.max(
        MIN_ZOOM,
        Math.min(
          (el.clientWidth - CONTROLS_GUTTER) / (right - left),
          el.clientHeight / (bottom - top),
        ),
      ),
    );
    setAnimated(true);
    setView(
      clamp({
        zoom,
        x: (-(left + right) / 2) * zoom - CONTROLS_GUTTER / 2,
        y: (-(top + bottom) / 2) * zoom,
      }),
    );
  }, []);

  const focusOn = useCallback((x: number, y: number) => {
    setAnimated(true);
    setView({ x: -x * HOME_ZOOM, y: -y * HOME_ZOOM, zoom: HOME_ZOOM });
  }, []);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (isControl(e.target)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    pinch.current = null;
    setAnimated(false);
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const next = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, next);
    if (pointers.current.size >= 2) {
      const [a, b] = Array.from(pointers.current.values());
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.current) {
        const point = fromCenter(
          e.currentTarget,
          (a.x + b.x) / 2,
          (a.y + b.y) / 2,
        );
        zoomAt(distance / pinch.current, point.x, point.y, false);
      }
      pinch.current = distance;
      return;
    }
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    setView((v) => clamp({ ...v, x: v.x + dx, y: v.y + dy }));
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    pinch.current = null;
    if (!pointers.current.size) setDragging(false);
  };

  return {
    containerRef,
    view,
    animated,
    dragging,
    pan,
    reset,
    fitAll,
    focusOn,
    zoomIn: () => zoomAt(ZOOM_STEP, 0, 0, true),
    zoomOut: () => zoomAt(1 / ZOOM_STEP, 0, 0, true),
    canZoomIn: view.zoom < MAX_ZOOM - 0.001,
    canZoomOut: view.zoom > MIN_ZOOM + 0.001,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
};
