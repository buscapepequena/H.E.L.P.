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
