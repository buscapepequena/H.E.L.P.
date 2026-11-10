import { FigureCell, StairPoint, StairSet } from "@/types/rain";

const STAIR_TOP = 7;
const TREADS = 30;
const NARROW = 0.82;
const RISER = 0.3;
const LIP = 0.2;
const RAIL = 0.42;

const reach = (u: number) => -Math.log(1 - NARROW * u) / NARROW;

export const stairPoint = (cols: number, ground: number, u: number): StairPoint => {
  const base = Math.min(34, cols * 0.5);
  const width = base * (1 - NARROW * u);
  const x = cols / 2 + base * (0.4 * Math.sin(Math.PI * u) - 0.16 * u - 0.06);
  const y = ground - (ground - STAIR_TOP) * u;
  return { x, y, width, base };
};

export const buildStairs = (cols: number, ground: number): StairSet => {
  const cells = new Map<number, FigureCell>();
  const put = (x: number, y: number, tone: number) => {
    if (x < 0 || x >= cols || y < 0) return;
    cells.set(y * cols + x, { x, y, tone });
  };
  const span = ground - STAIR_TOP;
  const total = reach(1);
  let lastTread = -1;
  let lastRail: [number, number] | null = null;
  const rails: { y: number; left: number; width: number; tread: number }[] = [];

  for (let y = ground; y >= STAIR_TOP; y--) {
    const u = (ground - y) / span;
    const point = stairPoint(cols, ground, u);
    const left = Math.round(point.x - point.width / 2);
    const right = Math.round(point.x + point.width / 2);
    const step = (reach(u) / total) * TREADS;
    const tread = Math.floor(step);
    const part = step - tread;
    const tone = part < RISER ? 0 : part < RISER + LIP ? 3 : 2;
    for (let x = left; x <= right; x++) {
      put(x, y, x === left || x === right ? Math.min(tone, 1) : tone);
    }
    const side = Math.max(1, Math.round((point.width / point.base) * 3));
    for (let k = 1; k <= side; k++) put(right + k, y, k === side ? 0 : 1);
    rails.push({ y, left, width: point.width, tread });
  }

  for (const { y, left, width, tread } of rails) {
    const rail: [number, number] = [left - 1, Math.round(y - width * RAIL)];
    if (lastRail) {
      const from = Math.min(lastRail[1], rail[1]);
      const to = Math.max(lastRail[1], rail[1]);
      for (let ry = from; ry <= to; ry++) put(lastRail[0], ry, 3);
    }
    put(rail[0], rail[1], 3);
    put(rail[0], rail[1] + 1, 2);
    put(rail[0], y, 1);
    if (tread !== lastTread && tread % 2 === 0) {
      for (let by = rail[1] + 2; by < y; by++) put(rail[0], by, 2);
    }
    lastTread = tread;
    lastRail = rail;
  }

  if (lastRail) {
    const [rx, ry] = lastRail;
    [
      [0, -1],
      [0, -2],
      [0, -3],
      [1, -4],
      [2, -4],
      [3, -3],
      [2, -2],
    ].forEach(([dx, dy]) => put(rx + dx, ry + dy, 3));
  }

  return { cells: Array.from(cells.values()) };
};
