import { Scene } from "@/types/scene";

export const portalPlace = (
  scene: Scene,
  step: number,
): { zoom: number; x: number; y: number } => {
  const glimmers = scene.glimmers ?? [];
  if (!step || !glimmers.length) {
    return { zoom: 1, x: scene.focus.x, y: scene.focus.y };
  }
  if (step < glimmers.length) return { zoom: glimmers[step].zoom, x: 0.5, y: 0.5 };
  const last = glimmers[glimmers.length - 1];
  return { zoom: scene.maxZoom ?? last.zoom, x: last.x, y: last.y };
};
