"use client";

import {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  PanDirection,
  Scene,
  SceneFocusArea,
  SceneLink,
  Size,
  ViewState,
} from "@/types/scene";
import { playSwoosh } from "@/hooks/soundEffects";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.5;
const PAN_STEP = 180;
const NAV_ZOOM = 2.6;
const ZOOM_DURATION = 550;
const FADE_DURATION = 320;
const PANEL_STAGE = "panel";
const DIVE_DURATION = 750;
const DIVE_ZOOM = 12;
const DEFAULT_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const DIVE_EASING = "cubic-bezier(0.6, 0, 0.9, 0.3)";

const baseScale = (scene: Scene, size: Size): number =>
  Math.max(size.width / scene.width, size.height / scene.height);

const clampView = (view: ViewState, scene: Scene, size: Size): ViewState => {
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.zoom));
  const scale = baseScale(scene, size) * zoom;
  const minX = Math.min(0, size.width - scene.width * scale);
  const minY = Math.min(0, size.height - scene.height * scale);
  return {
    zoom,
    x: scene.fold ? view.x : Math.min(0, Math.max(minX, view.x)),
    y: Math.min(0, Math.max(minY, view.y)),
  };
};

const focusView = (
  scene: Scene,
  size: Size,
  zoom: number,
  fx: number,
  fy: number,
): ViewState => {
  const scale = baseScale(scene, size) * zoom;
  return clampView(
    {
      zoom,
      x: size.width / 2 - fx * scene.width * scale,
      y: size.height / 2 - fy * scene.height * scale,
    },
    scene,
    size,
  );
};

const isControl = (target: EventTarget): boolean =>
  target instanceof Element &&
  target.closest("button, [data-control]") !== null;

export const useStreetView = (
  scenes: Scene[],
  startId: string,
  onEnter?: () => void,
) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const [sceneId, setSceneId] = useState<string>(startId);
  const [view, setView] = useState<ViewState>({ zoom: 1, x: 0, y: 0 });
  const [animated, setAnimated] = useState<boolean>(false);
  const [fading, setFading] = useState<boolean>(false);
  const [dragging, setDragging] = useState<boolean>(false);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<number | null>(null);
  const navigating = useRef<boolean>(false);
  const initialized = useRef<boolean>(false);
  const sizeRef = useRef<Size>({ width: 0, height: 0 });
  const [focused, setFocused] = useState<SceneFocusArea | null>(null);
  const [overlayVisible, setOverlayVisible] = useState<boolean>(false);
  const overlayTimer = useRef<number | null>(null);
  const [motion, setMotion] = useState<{ ms: number; easing: string }>({
    ms: ZOOM_DURATION,
    easing: DEFAULT_EASING,
  });
  const [intro, setIntro] = useState<{ next?: string } | null>(null);
  const enterRef = useRef<(() => void) | undefined>(onEnter);

  useEffect(() => {
    enterRef.current = onEnter;
  }, [onEnter]);

  const clearFocus = useCallback(() => {
    if (overlayTimer.current !== null) {
      window.clearTimeout(overlayTimer.current);
      overlayTimer.current = null;
    }
    setFocused(null);
    setOverlayVisible(false);
  }, []);

  const scene = useMemo<Scene>(
    () => scenes.find((s) => s.id === sceneId) ?? scenes[0],
    [scenes, sceneId],
  );
  const sceneRef = useRef<Scene>(scene);

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const next = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      };
      if (!next.width || !next.height) return;
      const first = !initialized.current;
      initialized.current = true;
      const current = sceneRef.current;
      const prev = sizeRef.current;
      sizeRef.current = next;
      setAnimated(false);
      setSize(next);
      setView((v) => {
        if (first) {
          return focusView(current, next, 1, current.focus.x, current.focus.y);
        }
        const prevScale = baseScale(current, prev) * v.zoom;
        const nextScale = baseScale(current, next) * v.zoom;
        const cx = (prev.width / 2 - v.x) / prevScale;
        const cy = (prev.height / 2 - v.y) / prevScale;
        return clampView(
          {
            zoom: v.zoom,
            x: next.width / 2 - cx * nextScale,
            y: next.height / 2 - cy * nextScale,
          },
          current,
          next,
        );
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    scene.links.forEach((link) => {
      const target = scenes.find((s) => s.id === link.to);
      if (!target) return;
      target.tiles.forEach((tile) => {
        const img = new window.Image();
        img.src = tile.src;
      });
    });
  }, [scene, scenes]);

  const scale = size.width ? baseScale(scene, size) * view.zoom : 0;

  const zoomAt = useCallback(
    (factor: number, cx: number, cy: number, animate: boolean) => {
      if (!size.width || navigating.current) return;
      clearFocus();
      setAnimated(animate);
      setView((v) => {
        const s = baseScale(scene, size);
        const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.zoom * factor));
        const ix = (cx - v.x) / (s * v.zoom);
        const iy = (cy - v.y) / (s * v.zoom);
        return clampView(
          { zoom, x: cx - ix * s * zoom, y: cy - iy * s * zoom },
          scene,
          size,
        );
      });
    },
    [scene, size, clearFocus],
  );

  const focusOn = useCallback(
    (area: SceneFocusArea) => {
      if (!size.width || navigating.current) return;
      clearFocus();
      const s = baseScale(scene, size);
      const zoom = Math.min(
        MAX_ZOOM,
        Math.max(
          MIN_ZOOM,
          area.fill *
            Math.min(
              size.width / (area.width * s),
              size.height / (area.height * s),
            ),
        ),
      );
      setAnimated(true);
      setView(
        focusView(
          scene,
          size,
          zoom,
          (area.x + area.width / 2) / scene.width,
          (area.y + area.height / 2) / scene.height,
        ),
      );
      setFocused(area);
      overlayTimer.current = window.setTimeout(() => {
        overlayTimer.current = null;
        setOverlayVisible(true);
      }, ZOOM_DURATION);
    },
    [scene, size, clearFocus],
  );

  const zoomIn = useCallback(
    () => zoomAt(ZOOM_STEP, size.width / 2, size.height / 2, true),
    [zoomAt, size],
  );

  const zoomOut = useCallback(
    () => zoomAt(1 / ZOOM_STEP, size.width / 2, size.height / 2, true),
    [zoomAt, size],
  );

  const pan = useCallback(
    (direction: PanDirection) => {
      if (!size.width || navigating.current) return;
      const dx =
        direction === "left" ? PAN_STEP : direction === "right" ? -PAN_STEP : 0;
      const dy =
        direction === "up" ? PAN_STEP : direction === "down" ? -PAN_STEP : 0;
      clearFocus();
      setAnimated(true);
      setView((v) => clampView({ ...v, x: v.x + dx, y: v.y + dy }, scene, size));
    },
    [scene, size, clearFocus],
  );

  const reset = useCallback(() => {
    if (!size.width || navigating.current) return;
    clearFocus();
    setAnimated(true);
    setView(focusView(scene, size, 1, scene.focus.x, scene.focus.y));
  }, [scene, size, clearFocus]);

  const navigate = useCallback(
    (link: SceneLink) => {
      const target = scenes.find((s) => s.id === link.to);
      if (!target || !size.width || navigating.current) return;
      clearFocus();
      navigating.current = true;
      setAnimated(true);
      setView(focusView(scene, size, NAV_ZOOM, link.x, link.y));
      window.setTimeout(
        () => setFading(true),
        ZOOM_DURATION - FADE_DURATION / 2,
      );
      window.setTimeout(() => {
        setAnimated(false);
        setSceneId(target.id);
        setView(focusView(target, size, 1, target.focus.x, target.focus.y));
        setFading(false);
        navigating.current = false;
      }, ZOOM_DURATION + FADE_DURATION / 2);
    },
    [scenes, scene, size, clearFocus],
  );

  const goTo = useCallback(
    (targetId?: string) => {
      if (!size.width || navigating.current) return;
      const target = scenes.find((s) => s.id === targetId);
      navigating.current = true;
      setFading(true);
      window.setTimeout(() => {
        if (!target) console.log(`escena "${targetId}" no existe todavía`);
        const destination = target ?? scene;
        clearFocus();
        setAnimated(false);
        setSceneId(destination.id);
        setView(
          focusView(destination, size, 1, destination.focus.x, destination.focus.y),
        );
        setFading(false);
        navigating.current = false;
      }, FADE_DURATION);
    },
    [scenes, scene, size, clearFocus],
  );

  const diveInto = useCallback(
    (area: SceneFocusArea, next?: string) => {
      if (!size.width || navigating.current) return;
      navigating.current = true;
      if (overlayTimer.current !== null) {
        window.clearTimeout(overlayTimer.current);
        overlayTimer.current = null;
      }
      setOverlayVisible(false);
      playSwoosh(DIVE_DURATION / 1000);
      const s = baseScale(scene, size) * DIVE_ZOOM;
      const cx = area.x + area.width / 2;
      const cy = area.y + area.height * 0.45;
      setMotion({ ms: DIVE_DURATION, easing: DIVE_EASING });
      setAnimated(true);
      setView({
        zoom: DIVE_ZOOM,
        x: size.width / 2 - cx * s,
        y: size.height / 2 - cy * s,
      });
      window.setTimeout(() => setFading(true), DIVE_DURATION * 0.55);
      window.setTimeout(() => setIntro({ next }), DIVE_DURATION);
    },
    [scene, size],
  );

  const finishIntro = useCallback(() => {
    if (intro?.next === PANEL_STAGE) {
      enterRef.current?.();
      return;
    }
    const target = scenes.find((s) => s.id === intro?.next);
    if (!target) {
      console.log(`escena "${intro?.next}" no existe todavía`);
      return;
    }
    clearFocus();
    setAnimated(false);
    setMotion({ ms: ZOOM_DURATION, easing: DEFAULT_EASING });
    setSceneId(target.id);
    setView(focusView(target, size, 1, target.focus.x, target.focus.y));
    setIntro(null);
    window.setTimeout(() => {
      setFading(false);
      navigating.current = false;
    }, 60);
  }, [scenes, intro, size, clearFocus]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(
        Math.exp(-e.deltaY * 0.0015),
        e.clientX - rect.left,
        e.clientY - rect.top,
        false,
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") pan("left");
      else if (e.key === "ArrowRight") pan("right");
      else if (e.key === "ArrowUp") pan("up");
      else if (e.key === "ArrowDown") pan("down");
      else if (e.key === "+" || e.key === "=") zoomIn();
      else if (e.key === "-" || e.key === "_") zoomOut();
      else if (e.key === "0" || e.key === "Escape") reset();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pan, zoomIn, zoomOut, reset]);

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (navigating.current || isControl(e.target)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    pinch.current = null;
    setAnimated(false);
    setDragging(true);
  }, []);

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const prev = pointers.current.get(e.pointerId);
      if (!prev) return;
      const next = { x: e.clientX, y: e.clientY };
      pointers.current.set(e.pointerId, next);
      if (pointers.current.size >= 2) {
        const [a, b] = Array.from(pointers.current.values());
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        const rect = e.currentTarget.getBoundingClientRect();
        if (pinch.current) {
          zoomAt(
            distance / pinch.current,
            (a.x + b.x) / 2 - rect.left,
            (a.y + b.y) / 2 - rect.top,
            false,
          );
        }
        pinch.current = distance;
        return;
      }
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      if (!dx && !dy) return;
      clearFocus();
      setView((v) => clampView({ ...v, x: v.x + dx, y: v.y + dy }, scene, size));
    },
    [scene, size, zoomAt, clearFocus],
  );

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    pinch.current = null;
    if (!pointers.current.size) setDragging(false);
  }, []);

  const onDoubleClick = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (isControl(e.target)) return;
      const rect = e.currentTarget.getBoundingClientRect();
      zoomAt(2, e.clientX - rect.left, e.clientY - rect.top, true);
    },
    [zoomAt],
  );

  const hotspots = scene.links.map((link) => ({
    link,
    left: view.x + link.x * scene.width * scale,
    top: view.y + link.y * scene.height * scale,
  }));

  return {
    containerRef,
    scene,
    ready: size.width > 0,
    size,
    view,
    scale,
    animated,
    fading,
    dragging,
    hotspots,
    focused,
    overlayVisible,
    focusOn,
    goTo,
    diveInto,
    intro,
    finishIntro,
    transition: animated ? `transform ${motion.ms}ms ${motion.easing}` : "none",
    duration: ZOOM_DURATION,
    fadeDuration: FADE_DURATION,
    canZoomIn: view.zoom < MAX_ZOOM - 0.001,
    canZoomOut: view.zoom > MIN_ZOOM + 0.001,
    zoomIn,
    zoomOut,
    pan,
    reset,
    navigate,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onDoubleClick,
  };
};
