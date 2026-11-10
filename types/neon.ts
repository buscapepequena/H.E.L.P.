export interface Glyph {
  width: number;
  cells: [number, number][];
}

export interface NeonSign {
  width: number;
  height: number;
  letters: number;
  draw: (dim: Set<number>) => void;
}
