export interface SceneLink {
  to: string;
  label: string;
  x: number;
  y: number;
  rotation: number;
}

export interface SceneClock {
  x: number;
  y: number;
  radius: number;
  timeZone: string;
}

export interface SceneGlass {
  x: number;
  y: number;
  width: number;
  height: number;
  frosted?: boolean;
}

export interface SceneLight {
  image: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SceneFocusArea {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: number;
  panel?: DoorPanelConfig;
}

export interface DoorPanelConfig {
  neutral: string;
  active: string;
  sound?: string;
  buzzDuration: number;
  activeDuration: number;
  next?: string;
}

export type DoorPanelStatus = "neutral" | "buzzing" | "active";

export interface ClockTime {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface SceneTile {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fadeRight?: number;
  cropLeft?: number;
}

export interface SceneStitch {
  x: number;
  top: number;
  bottom: number;
  spacing: number;
  opacity: number;
}

export interface ScenePipe {
  x: number;
  top: number;
  bottom: number;
  width: number;
}

export interface SceneFold {
  seams: number[];
  depth: number;
}

export interface FoldCamera {
  x: number;
  z: number;
  yaw: number;
}

export interface Scene {
  id: string;
  title: string;
  width: number;
  height: number;
  tiles: SceneTile[];
  focus: { x: number; y: number };
  links: SceneLink[];
  clocks?: SceneClock[];
  glass?: SceneGlass[];
  flickers?: SceneLight[];
  focusAreas?: SceneFocusArea[];
  pipes?: ScenePipe[];
  stitches?: SceneStitch[];
  fold?: SceneFold;
}

export interface ViewState {
  zoom: number;
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type PanDirection = "up" | "down" | "left" | "right";
