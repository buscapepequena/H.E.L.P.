import { PanelTextKey, RoomTile, SimSlot } from "@/types/panel";
import { Scene } from "@/types/scene";

export interface MapLocation {
  id: string;
  labelKey: PanelTextKey;
  src: string;
  size: number;
  x: number;
  y: number;
  rooms: RoomTile[];
  sims: SimSlot[];
  portal?: Scene[];
  rain: string;
  sound: MapSound;
  network?: MapNetwork;
}

export type MapSound =
  | "journey"
  | "library"
  | "food"
  | "coffee"
  | "storage"
  | "languages";

export interface MapNetwork {
  seed: number;
  steps: [number, number];
  line: string;
  glow: string;
  pulse: string;
}

export interface MapRoute {
  id: string;
  from: string;
  to: string;
  lane: number;
}

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface MapSegment {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  depth: number;
}

export interface MapNode {
  id: string;
  x: number;
  y: number;
  depth: number;
  unlocked: boolean;
}

export interface MapGraph {
  segments: MapSegment[];
  nodes: MapNode[];
}

export interface MapViewState {
  x: number;
  y: number;
  zoom: number;
}
