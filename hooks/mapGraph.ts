import { MapGraph } from "@/types/map";

export const MAP_MAX_DEPTH = 13;

const DIRECTIONS: [number, number][] = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

const random = (seed: number): number => {
  let h = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};

export const buildGraph = (
  seed: number,
  originX: number,
  originY: number,
  [minSteps, maxSteps]: [number, number],
): MapGraph => {
  const graph: MapGraph = { segments: [], nodes: [] };
  const prefix = `g${seed}`;
  let counter = seed;
  const next = () => random(++counter);

  const walk = (
    startX: number,
    startY: number,
    startDirection: number,
    startDepth: number,
    steps: number,
  ) => {
    let x = startX;
    let y = startY;
    let direction = startDirection;
    let depth = startDepth;
    for (let i = 0; i < steps && depth < MAP_MAX_DEPTH; i++) {
      const turn = next();
      if (turn < 0.25) direction = (direction + 7) % 8;
      else if (turn > 0.75) direction = (direction + 1) % 8;
      const [dx, dy] = DIRECTIONS[direction];
      const length = 30 + next() * 42;
      const scale = dx && dy ? 0.72 : 1;
      const x2 = Math.round(x + dx * length * scale);
      const y2 = Math.round(y + dy * length * scale);
      depth += 1;
      graph.segments.push({
        id: `${prefix}-s-${graph.segments.length}`,
        x1: x,
        y1: y,
        x2,
        y2,
        depth,
      });
      x = x2;
      y = y2;
      if (next() < 0.3) {
        walk(x, y, (direction + (next() < 0.5 ? 2 : 6)) % 8, depth, steps - i - 1);
      }
    }
    graph.nodes.push({
      id: `${prefix}-n-${graph.nodes.length}`,
      x,
      y,
      depth,
      unlocked: false,
    });
  };

  DIRECTIONS.forEach((_, direction) => {
    walk(
      originX,
      originY,
      direction,
      0,
      minSteps + Math.floor(next() * (maxSteps - minSteps + 1)),
    );
  });

  return graph;
};

export const graphReach = (graph: MapGraph, cx: number, cy: number): number =>
  Math.max(
    1,
    ...graph.segments.map((s) => Math.hypot(s.x2 - cx, s.y2 - cy)),
  );

export const scaleGraph = (
  graph: MapGraph,
  cx: number,
  cy: number,
  factor: number,
): MapGraph => ({
  segments: graph.segments.map((s) => ({
    ...s,
    x1: Math.round(cx + (s.x1 - cx) * factor),
    y1: Math.round(cy + (s.y1 - cy) * factor),
    x2: Math.round(cx + (s.x2 - cx) * factor),
    y2: Math.round(cy + (s.y2 - cy) * factor),
  })),
  nodes: graph.nodes.map((n) => ({
    ...n,
    x: Math.round(cx + (n.x - cx) * factor),
    y: Math.round(cy + (n.y - cy) * factor),
  })),
});

export const mapFade = (depth: number): number =>
  Math.max(0.05, Math.pow(1 - depth / (MAP_MAX_DEPTH + 1), 1.7));
