import { MapLocation, MapRoute } from "@/types/map";

type Point = { x: number; y: number };

const DIRECTIONS: Point[] = Array.from({ length: 8 }, (_, i) => ({
  x: Math.round(Math.cos((i * Math.PI) / 4) * 1000) / 1000,
  y: Math.round(Math.sin((i * Math.PI) / 4) * 1000) / 1000,
}));
const STUB = 46;
const RUN_GAP = 9;
const RUN_SHIFT = 14;
const MAX_SHIFTS = 60;
const CLEARANCE = 14;
const SAMPLE = 4;

const bearing = (from: MapLocation, to: MapLocation): number =>
  Math.atan2(to.y - from.y, to.x - from.x);

const SLOT_GAP = 12;
const SPARE_OFFSETS = [3, -3, 9, -9, 15, -15];

const wrap = (angle: number): number =>
  Math.atan2(Math.sin(angle), Math.cos(angle));

const stub = (
  place: MapLocation,
  direction: number,
  offset: number,
): [Point, Point] => {
  const d = DIRECTIONS[direction];
  const radius = place.size / 2;
  const px = -d.y * offset;
  const py = d.x * offset;
  return [
    { x: place.x + d.x * radius + px, y: place.y + d.y * radius + py },
    {
      x: place.x + d.x * (radius + STUB) + px,
      y: place.y + d.y * (radius + STUB) + py,
    },
  ];
};

const CANDIDATES = 3;

const anchors = (
  place: MapLocation,
  route: MapRoute,
  routes: MapRoute[],
  places: MapLocation[],
): [Point, Point][] => {
  const other = (r: MapRoute) =>
    places.find((p) => p.id === (r.from === place.id ? r.to : r.from));
  const far = (r: MapRoute) => {
    const target = other(r);
    return (
      !!target &&
      Math.hypot(target.x - place.x, target.y - place.y) >=
        place.size / 2 + target.size / 2 + STUB * 2
    );
  };
  const siblings = routes
    .filter((r) => (r.from === place.id || r.to === place.id) && far(r))
    .map((r) => ({ id: r.id, angle: bearing(place, other(r) as MapLocation) }));
  const mean = Math.atan2(
    siblings.reduce((s, r) => s + Math.sin(r.angle), 0),
    siblings.reduce((s, r) => s + Math.cos(r.angle), 0),
  );
  const neighbours = places.filter((p) => p.id !== place.id);
  const open = DIRECTIONS.map((_, i) => i).filter((i) => {
    const [edge] = stub(place, i, 0);
    const d = DIRECTIONS[i];
    const reach = STUB + CLEARANCE;
    return !blocked(
      [edge, { x: edge.x + d.x * reach, y: edge.y + d.y * reach }, edge],
      neighbours,
    );
  });
  const pool = open.length ? open : DIRECTIONS.map((_, i) => i);
  const relative = (direction: number) =>
    wrap((direction * Math.PI) / 4 - mean);
  const chosen = [...pool]
    .sort((a, b) => Math.abs(relative(a)) - Math.abs(relative(b)))
    .slice(0, Math.max(1, Math.min(siblings.length, pool.length)))
    .sort((a, b) => relative(a) - relative(b));
  const ordered = [...siblings].sort(
    (a, b) => wrap(a.angle - mean) - wrap(b.angle - mean),
  );
  const index = ordered.findIndex((r) => r.id === route.id);
  const bucket = (i: number) =>
    Math.floor((i * chosen.length) / Math.max(1, ordered.length));
  const mine = bucket(index);
  const sharing = ordered.map((_, i) => i).filter((i) => bucket(i) === mine);
  const slot = sharing.indexOf(index);
  const offset = (slot - (sharing.length - 1) / 2) * SLOT_GAP;
  const target = other(route);
  const toward = target ? bearing(place, target) : mean;
  const spares = pool
    .filter((direction) => direction !== chosen[mine])
    .sort(
      (a, b) =>
        Number(chosen.includes(a)) - Number(chosen.includes(b)) ||
        Math.abs(wrap((a * Math.PI) / 4 - toward)) -
          Math.abs(wrap((b * Math.PI) / 4 - toward)),
    )
    .slice(0, CANDIDATES - 1)
    .map((direction) => stub(place, direction, SPARE_OFFSETS[index % 6]));
  return [stub(place, chosen[mine], offset), ...spares];
};

const sign = (value: number): number => (value < 0 ? -1 : 1);

const LONG_ROUTE = 700;
const SWING_BASE = 110;
const SWING_STEP = 55;

const hash = (text: string): number =>
  Array.from(text).reduce(
    (h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0,
    2166136261,
  );

const trace = (
  start: Point,
  end: Point,
  horizontal: boolean,
  first: number,
  second: number,
) => {
  const flip = (p: Point): Point => (horizontal ? p : { x: p.y, y: p.x });
  const a = flip(start);
  const b = flip(end);
  const dir = sign(b.x - a.x);
  const middle = (a.x + b.x) / 2;
  const climb = Math.abs(second - first) / 2;
  const points = [
    { x: a.x + dir * Math.abs(first - a.y), y: first },
    { x: middle - dir * climb, y: first },
    { x: middle + dir * climb, y: second },
    { x: b.x - dir * Math.abs(b.y - second), y: second },
  ];
  const ordered = points
    .slice(1)
    .every((point, i) => (point.x - points[i].x) * dir >= -0.5);
  return ordered ? points.map(flip) : null;
};

const blocked = (points: Point[], places: MapLocation[]): boolean =>
  points.slice(1).some((to, i) => {
    const from = points[i];
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(length / SAMPLE));
    return Array.from({ length: steps - 1 }, (_, k) => k + 1).some((k) => {
      const x = from.x + ((to.x - from.x) * k) / steps;
      const y = from.y + ((to.y - from.y) * k) / steps;
      return places.some(
        (place) => Math.hypot(x - place.x, y - place.y) < place.size / 2 + CLEARANCE,
      );
    });
  });

const shift = (k: number): number => (k % 2 ? (k + 1) / 2 : -k / 2);

export const shapeRoute = (
  route: MapRoute,
  routes: MapRoute[],
  places: MapLocation[],
): Point[] => {
  const origin = places.find((place) => place.id === route.from);
  const destination = places.find((place) => place.id === route.to);
  if (!origin || !destination) return [];
  const gap = Math.hypot(destination.x - origin.x, destination.y - origin.y);
  if (gap < origin.size / 2 + destination.size / 2 + STUB * 2) {
    const angle = bearing(origin, destination);
    return [
      {
        x: origin.x + Math.cos(angle) * (origin.size / 2),
        y: origin.y + Math.sin(angle) * (origin.size / 2),
      },
      {
        x: destination.x - Math.cos(angle) * (destination.size / 2),
        y: destination.y - Math.sin(angle) * (destination.size / 2),
      },
    ];
  }
  const seed = hash(route.id);
  const side = seed % 2 ? 1 : -1;
  const swing = SWING_BASE + ((seed >>> 3) % 4) * SWING_STEP;
  let fallback: Point[] | null = null;
  const others = places.filter(
    (place) => place.id !== origin.id && place.id !== destination.id,
  );
  const search = (
    [start, startTip]: [Point, Point],
    [end, endTip]: [Point, Point],
  ): Point[] | null => {
    const span = Math.hypot(endTip.x - startTip.x, endTip.y - startTip.y);
    if (span < STUB) return null;
    const prefersHorizontal =
      Math.abs(endTip.x - startTip.x) >= Math.abs(endTip.y - startTip.y);
    const long = span > LONG_ROUTE;
    for (const scale of [1, 0.6, 0.3, 0]) {
      for (const horizontal of [prefersHorizontal, !prefersHorizontal]) {
        const base =
          (horizontal ? (startTip.y + endTip.y) / 2 : (startTip.x + endTip.x) / 2) +
          route.lane * RUN_GAP;
        const fitted = Math.min(swing, span / 5) * scale;
        const firstSwing = side * fitted * (long ? 1 : 0.6);
        const secondSwing = long ? -side * fitted * 0.7 : firstSwing;
        for (let k = 0; k < MAX_SHIFTS; k++) {
          const offset = shift(k) * RUN_SHIFT;
          const middle = trace(
            startTip,
            endTip,
            horizontal,
            base + firstSwing + offset,
            base + secondSwing + offset,
          );
          if (!middle) continue;
          const points = [start, startTip, ...middle, endTip, end];
          if (!fallback) fallback = points;
          if (
            !blocked([start, startTip, ...middle, endTip, end], others) &&
            !blocked([startTip, ...middle, endTip], places)
          ) {
            return points;
          }
        }
      }
    }
    return null;
  };
  const starts = anchors(origin, route, routes, places);
  const ends = anchors(destination, route, routes, places);
  for (const startStub of starts) {
    for (const endStub of ends) {
      const found = search(startStub, endStub);
      if (found) return found;
    }
  }
  return fallback ?? [starts[0][0], ends[0][0]];
};
