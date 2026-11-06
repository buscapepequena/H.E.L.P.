const isBorder = (data: Uint8ClampedArray, i: number): boolean => {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  return (r > 165 && r - g > 30) || (r + g + b) / 3 > 200;
};

const flood = (
  width: number,
  height: number,
  seeds: number[],
  canEnter: (index: number) => boolean,
): Uint8Array => {
  const seen = new Uint8Array(width * height);
  const stack = seeds.filter(canEnter);
  stack.forEach((index) => {
    seen[index] = 1;
  });
  while (stack.length) {
    const index = stack.pop() as number;
    const x = index % width;
    const neighbours = [
      x > 0 ? index - 1 : -1,
      x < width - 1 ? index + 1 : -1,
      index - width,
      index + width,
    ];
    neighbours.forEach((n) => {
      if (n < 0 || n >= seen.length || seen[n] || !canEnter(n)) return;
      seen[n] = 1;
      stack.push(n);
    });
  }
  return seen;
};

export const punchHole = (image: ImageData) => {
  const { width, height, data } = image;
  const center = Math.floor(height / 2) * width + Math.floor(width / 2);
  const inside = flood(width, height, [center], (n) => !isBorder(data, n * 4));

  const edges: number[] = [];
  for (let x = 0; x < width; x++) {
    edges.push(x, (height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    edges.push(y * width, y * width + width - 1);
  }
  const frame = flood(width, height, edges, (n) => !inside[n]);

  for (let n = 0; n < inside.length; n++) {
    if (!frame[n]) data[n * 4 + 3] = 0;
  }
};
