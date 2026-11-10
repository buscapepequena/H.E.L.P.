import { glyphFor } from "@/hooks/neonGlyphs";
import { Glyph } from "@/types/neon";

export const TEXT_ROWS = 11;
export const TEXT_DOT = 4;

const EXTRA: Record<string, string[]> = {
  "▶": ["#...", "##..", "###.", "####", "###.", "##..", "#..."],
  _: ["....", "....", "....", "....", "....", "....", "....", "####"],
};

const extraGlyph = (bitmap: string[]): Glyph => {
  const cells: [number, number][] = [];
  bitmap.forEach((row, y) => {
    Array.from(row).forEach((dot, x) => {
      if (dot === "#") cells.push([x, y + 2]);
    });
  });
  return { width: bitmap[0].length, cells };
};

const glyphsOf = (text: string): Glyph[] =>
  Array.from(text.toUpperCase().normalize("NFC")).map((char) =>
    EXTRA[char] ? extraGlyph(EXTRA[char]) : glyphFor(char),
  );

export const pixelTextWidth = (text: string): number => {
  const glyphs = glyphsOf(text);
  return glyphs.reduce((sum, glyph) => sum + glyph.width, 0) + Math.max(0, glyphs.length - 1);
};

export const drawPixelText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  color: string,
  shadow: string,
) => {
  const size = TEXT_DOT - 1;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  let left = 0;
  glyphsOf(text).forEach((glyph) => {
    glyph.cells.forEach(([x, y]) => {
      ctx.fillStyle = shadow;
      ctx.fillRect((left + x) * TEXT_DOT + 1, (y + 1) * TEXT_DOT - 2, size, size);
    });
    glyph.cells.forEach(([x, y]) => {
      ctx.fillStyle = color;
      ctx.fillRect((left + x) * TEXT_DOT, y * TEXT_DOT, size, size);
    });
    left += glyph.width + 1;
  });
};
