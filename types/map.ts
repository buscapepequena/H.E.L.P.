import {
  PanelIcon,
  PanelLang,
  PanelTextKey,
  RoomTile,
  SimSlot,
} from "@/types/panel";

export interface MapLocation {
  id: string;
  labelKey: PanelTextKey;
  src: string;
  size: number;
  x: number;
  y: number;
  rooms: RoomTile[];
  sims: SimSlot[];
  portal: Record<PanelLang, PanelIcon>;
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
