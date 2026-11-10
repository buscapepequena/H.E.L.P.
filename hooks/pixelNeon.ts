import { GLYPH_TOP, glyphFor } from "@/hooks/neonGlyphs";
import { Glyph, NeonSign } from "@/types/neon";

export const NEON_SCALE = 3;
const ROW = 12;
const PAD = 40;
const LEGS = 34;
const SPLAY = 10;
const ROW_CHARS = 9;
const GLOW_RADIUS = 12;
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

type Rgb = [number, number, number];

const FILL: Rgb = [255, 206, 232];
const LIGHT: Rgb = [255, 238, 247];
const SHADE: Rgb = [236, 110, 170];
const DIM_FILL: Rgb = [128, 52, 92];
const DIM_SHADE: Rgb = [96, 34, 70];
const OUTLINE: Rgb = [56, 10, 40];
const SHADOW: Rgb = [116, 20, 74];
const FRAME_CORE: Rgb = [255, 128, 104];
const FRAME_TUBE: Rgb = [214, 30, 46];
const HALO: Rgb = [212, 36, 70];

export const neonRows = (text: string): string[] => {
  const rows: string[] = [];
  text
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean)
    .forEach((word) => {
      const last = rows[rows.length - 1];
      if (last && last.length + 1 + word.length <= ROW_CHARS) {
        rows[rows.length - 1] = `${last} ${word}`;
      } else {
        rows.push(word);
      }
    });
  return rows;
};

const blur = (field: Float32Array, w: number, h: number, r: number) => {
  const tmp = new Float32Array(field.length);
  for (let y = 0; y < h; y++) {
    let sum = 0;
    for (let x = -r; x < w + r; x++) {
      sum += (x + r < w ? field[y * w + x + r] : 0) - (x - r - 1 >= 0 ? field[y * w + x - r - 1] : 0);
      if (x >= 0 && x < w) tmp[y * w + x] = sum / (2 * r + 1);
    }
  }
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = -r; y < h + r; y++) {
      sum += (y + r < h ? tmp[(y + r) * w + x] : 0) - (y - r - 1 >= 0 ? tmp[(y - r - 1) * w + x] : 0);
      if (y >= 0 && y < h) field[y * w + x] = sum / (2 * r + 1);
    }
  }
};

const wobble = (letter: number): number => [0, -1, 1, 0, 1, -1, 0][(letter * 5 + 3) % 7];

const cellMask = (rows: string[]) => {
  const glyphRows = rows.map((row) => Array.from(row).map(glyphFor));
  const rowWidth = (glyphs: Glyph[]) =>
    glyphs.reduce((sum, glyph) => sum + glyph.width + 2, 0) - 1;
  const width = Math.max(1, ...glyphRows.map(rowWidth));
  const cw = width + 2;
  const ch = Math.max(1, rows.length) * ROW;
  const owner = new Int16Array(cw * ch).fill(-1);
  let letter = 0;
  glyphRows.forEach((glyphs, i) => {
    let x = 1 + Math.round((width - rowWidth(glyphs)) / 2);
    glyphs.forEach((glyph) => {
      if (glyph.cells.length) {
        const dy = wobble(letter);
        glyph.cells.forEach(([gx, gy]) => {
          [0, 1].forEach((bold) => {
            const cx = x + gx + bold;
            const cy = i * ROW + gy + dy;
            if (cx < 0 || cy < 0 || cx >= cw || cy >= ch) return;
            owner[cy * cw + cx] = letter;
          });
        });
        letter++;
      }
      x += glyph.width + 2;
    });
  });
  return { owner, letters: letter, cw, ch };
};

export const buildNeon = (canvas: HTMLCanvasElement, text: string): NeonSign | null => {
  const { owner, letters, cw, ch } = cellMask(neonRows(text));
  const S = NEON_SCALE;
  const w = cw * S + PAD * 2;
  const h = ch * S + PAD * 2 + LEGS;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const ink = new Int16Array(w * h).fill(-1);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const id = owner[y * cw + x];
      if (id < 0) continue;
      for (let py = 0; py < S; py++) {
        for (let px = 0; px < S; px++) {
          ink[(PAD + y * S + py) * w + PAD + x * S + px] = id;
        }
      }
    }
  }

  const left = PAD + Math.round(cw * S * 0.06);
  const right = PAD + cw * S - Math.round(cw * S * 0.06);
  const top = PAD + (GLYPH_TOP + 3) * S;
  const bottom = PAD + (ch - ROW + GLYPH_TOP + 9) * S;
  const postA = left + 16;
  const postB = right - 16;
  const foot = bottom + LEGS;

  const frame = new Uint8Array(w * h);
  const line = (x0: number, y0: number, x1: number, y1: number) => {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let s = 0; s <= steps; s++) {
      const x = Math.round(x0 + ((x1 - x0) * s) / steps);
      const y = Math.round(y0 + ((y1 - y0) * s) / steps);
      if (x >= 0 && y >= 0 && x < w && y < h) frame[y * w + x] = 1;
    }
  };
  line(left, top, right, top);
  line(left, bottom, right, bottom);
  line(left, top, left, bottom);
  line(right, top, right, bottom);
  line(postA, bottom, postA - SPLAY, foot);
  line(postB, bottom, postB + SPLAY, foot);
  line(postA - Math.round(SPLAY * 0.55), bottom + Math.round(LEGS * 0.55), postA + 22, bottom);
  line(postB + Math.round(SPLAY * 0.55), bottom + Math.round(LEGS * 0.55), postB - 22, bottom);

  const at = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < w && y < h ? ink[y * w + x] : -1;
  const outline = new Uint8Array(w * h);
  const shadow = new Uint8Array(w * h);
  const frameRing = new Uint8Array(w * h);
  const glow = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (ink[i] >= 0) {
        glow[i] = 1;
        continue;
      }
      let edge = false;
      for (let dy = -1; dy <= 1 && !edge; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (at(x + dx, y + dy) >= 0) {
            edge = true;
            break;
          }
        }
      }
      if (edge) {
        outline[i] = 1;
        continue;
      }
      if (at(x - 2, y - 2) >= 0 || at(x - 3, y - 3) >= 0 || at(x - 2, y - 3) >= 0) {
        shadow[i] = 1;
        continue;
      }
      if (frame[i]) {
        glow[i] = 0.8;
        continue;
      }
      if (
        (x > 0 && frame[i - 1]) || (x < w - 1 && frame[i + 1]) ||
        (y > 0 && frame[i - w]) || (y < h - 1 && frame[i + w])
      ) {
        frameRing[i] = 1;
        glow[i] = 0.6;
      }
    }
  }
  blur(glow, w, h, GLOW_RADIUS);
  blur(glow, w, h, GLOW_RADIUS);
  let peak = 0.0001;
  for (let i = 0; i < glow.length; i++) peak = Math.max(peak, glow[i]);

  const base = new Uint8ClampedArray(w * h * 4);
  const put = (i: number, [r, g, b]: Rgb, a = 255) => {
    base[i * 4] = r;
    base[i * 4 + 1] = g;
    base[i * 4 + 2] = b;
    base[i * 4 + 3] = a;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (ink[i] >= 0) continue;
      if (outline[i]) {
        put(i, OUTLINE);
        continue;
      }
      if (shadow[i]) {
        put(i, SHADOW);
        continue;
      }
      if (frame[i]) {
        put(i, FRAME_CORE);
        continue;
      }
      if (frameRing[i]) {
        put(i, FRAME_TUBE);
        continue;
      }
      const g = Math.min(1, (glow[i] / peak) * 1.8);
      if (g > BAYER[y % 4][x % 4] / 16 + 0.06) put(i, HALO, Math.round(110 + g * 145));
    }
  }

  const image = ctx.createImageData(w, h);
  const draw = (dim: Set<number>) => {
    image.data.set(base);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const id = ink[i];
        if (id < 0) continue;
        const off = dim.has(id);
        const lower = at(x, y + 1) < 0 || at(x + 1, y) < 0;
        const upper = at(x, y - 1) < 0 || at(x - 1, y) < 0;
        const [r, g, b] = off
          ? lower
            ? DIM_SHADE
            : DIM_FILL
          : lower
            ? SHADE
            : upper
              ? LIGHT
              : FILL;
        image.data[i * 4] = r;
        image.data[i * 4 + 1] = g;
        image.data[i * 4 + 2] = b;
        image.data[i * 4 + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
  };
  draw(new Set());
  return { width: w, height: h, letters, draw };
};
