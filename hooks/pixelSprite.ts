import { SpriteCells } from "@/types/rain";

const cache = new Map<string, SpriteCells>();
const turned = new Map<string, SpriteCells>();

export const ANGLE_STEP = 6;

export const rotateSprite = (
  name: string,
  frames: string[][],
  index: number,
  angle: number,
): SpriteCells => {
  const step = (((Math.round(angle / ANGLE_STEP) * ANGLE_STEP) % 360) + 360) % 360;
  const key = `${name}:${index}:${step}`;
  const hit = turned.get(key);
  if (hit) return hit;
  const source = frames[index];
  const height = source.length;
  const width = source[0].length;
  const radians = (step * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  let mx = 0;
  let my = 0;
  let count = 0;
  source.forEach((row, y) => {
    Array.from(row).forEach((mark, x) => {
      if (mark === ".") return;
      mx += x + 0.5;
      my += y + 0.5;
      count++;
    });
  });
  const cx = count ? mx / count : width / 2;
  const cy = count ? my / count : height / 2;
  const reach =
    Math.ceil(Math.max(Math.hypot(cx, cy), Math.hypot(width - cx, cy), Math.hypot(cx, height - cy), Math.hypot(width - cx, height - cy))) + 1;
  const cells: [number, number, number][] = [];
  for (let dy = -reach; dy <= reach; dy++) {
    for (let dx = -reach; dx <= reach; dx++) {
      const sx = Math.floor(cos * (dx + 0.5) + sin * (dy + 0.5) + cx);
      const sy = Math.floor(-sin * (dx + 0.5) + cos * (dy + 0.5) + cy);
      if (sx < 0 || sy < 0 || sx >= width || sy >= height) continue;
      const mark = source[sy][sx];
      if (mark !== ".") cells.push([dx, dy, Number(mark) - 1]);
    }
  }
  const sprite = { width: reach * 2 + 1, height: reach * 2 + 1, cells };
  turned.set(key, sprite);
  return sprite;
};

export const scaleSprite = (frames: string[][], index: number, rows: number): SpriteCells => {
  const target = Math.max(2, Math.round(rows));
  const key = `${index}:${target}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const source = frames[index];
  const height = source.length;
  const width = source[0].length;
  const cols = Math.max(1, Math.round((width * target) / height));
  const cells: [number, number, number][] = [];
  for (let r = 0; r < target; r++) {
    const y0 = Math.floor((r * height) / target);
    const y1 = Math.max(y0 + 1, Math.floor(((r + 1) * height) / target));
    for (let c = 0; c < cols; c++) {
      const x0 = Math.floor((c * width) / cols);
      const x1 = Math.max(x0 + 1, Math.floor(((c + 1) * width) / cols));
      let filled = 0;
      let sum = 0;
      let count = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          count++;
          const mark = source[y][x];
          if (mark && mark !== ".") {
            filled++;
            sum += Number(mark) - 1;
          }
        }
      }
      if (filled / count >= 0.45) cells.push([c, r, Math.round(sum / filled)]);
    }
  }
  const sprite = { width: cols, height: target, cells };
  cache.set(key, sprite);
  return sprite;
};
