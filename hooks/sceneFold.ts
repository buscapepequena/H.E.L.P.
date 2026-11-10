import { FoldCamera, SceneFold } from "@/types/scene";

const DIRECTIONS: [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

const degrees = (radians: number): number => (radians * 180) / Math.PI;

const direction = (wall: number): [number, number] =>
  DIRECTIONS[wall % DIRECTIONS.length];

export const wallOrigins = ({ seams }: SceneFold): [number, number][] => {
  const origins: [number, number][] = [[0, 0]];
  seams.forEach((seam, i) => {
    const [x, z] = origins[i];
    const [dx, dz] = direction(i);
    const length = seam - (seams[i - 1] ?? 0);
    origins.push([x + dx * length, z + dz * length]);
  });
  return origins;
};

export const foldCamera = (fold: SceneFold, center: number): FoldCamera => {
  const { seams, depth, open } = fold;
  const total = seams[seams.length - 1];
  const origins = wallOrigins(fold);
  const lap = open ? 0 : Math.floor((center - depth) / total);
  const position = center - lap * total;
  const turn = lap * 360;
  const corners = open ? seams.slice(0, -1) : seams;
  const turning = corners.findIndex((seam) => Math.abs(position - seam) < depth);
  if (turning >= 0) {
    const seam = seams[turning];
    const [cornerX, cornerZ] = origins[turning + 1];
    const [dx, dz] = direction(turning);
    const [nx, nz] = direction(turning + 1);
    const angle =
      position <= seam
        ? degrees(Math.atan((position - seam + depth) / depth))
        : 90 - degrees(Math.atan((seam + depth - position) / depth));
    return {
      x: cornerX - dx * depth + nx * depth,
      z: cornerZ - dz * depth + nz * depth,
      yaw: turn + turning * 90 + angle,
    };
  }
  const wall = seams.filter((seam) => seam <= position).length;
  const [originX, originZ] = origins[wall];
  const [dx, dz] = direction(wall);
  const [nx, nz] = direction(wall + 1);
  const along = position - (seams[wall - 1] ?? 0);
  return {
    x: originX + dx * along + nx * depth,
    z: originZ + dz * along + nz * depth,
    yaw: turn + wall * 90,
  };
};
