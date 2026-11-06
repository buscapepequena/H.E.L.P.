import { Scene } from "@/types/scene";

export const START_SCENE = "afuera";

const room = (
  id: string,
  title: string,
  src: string,
  width: number,
  height: number,
): Scene => ({
  id,
  title,
  width,
  height,
  tiles: [{ src, x: 0, y: 0, width, height }],
  focus: { x: 0.5, y: 0.5 },
  links: [],
});

export const SCENES: Scene[] = [
  room("security", "Security", "/images/security.png", 1586, 992),
  room("cafeteria", "Cafeteria", "/images/cafeteria.png", 1586, 992),
  room("ascensor", "Elevator", "/images/ascensor.png", 1585, 992),
  room("dormitorio", "Dorms", "/images/dormitorio.png", 1585, 992),
  room("bano", "Baño", "/images/bano.png", 1585, 992),
  {
    id: "afuera",
    title: "H.E.L.P.",
    width: 3095,
    height: 810,
    tiles: [
      {
        src: "/images/afuera/edificioizquierdofinal.png",
        x: 0,
        y: 0,
        width: 1105,
        height: 810,
      },
      {
        src: "/images/afuera/edificioizquierdo.png",
        x: 1105,
        y: 0,
        width: 695,
        height: 810,
      },
      {
        src: "/images/afuera/edificiofrente.png",
        x: 1800,
        y: 0,
        width: 1295,
        height: 810,
      },
    ],
    focus: { x: 0.7903, y: 0.55 },
    links: [],
    stitches: [
      { x: 1105, top: 0, bottom: 810, spacing: 11, opacity: 0.5 },
      { x: 1800, top: 0, bottom: 810, spacing: 11, opacity: 0.5 },
    ],
    clocks: [
      { x: 2409.5, y: 423.8, radius: 14.7, timeZone: "America/New_York" },
    ],
    focusAreas: [
      {
        id: "puerta",
        label: "Puerta",
        x: 2332.7,
        y: 353.6,
        width: 228.8,
        height: 210.7,
        fill: 0.8,
        panel: {
          neutral: "/images/doorneutral.png",
          active: "/images/dooractivated.png",
          sound: "/sounds/doorbuzz.mp3",
          buzzDuration: 1500,
          activeDuration: 1500,
          next: "panel",
        },
      },
    ],
    flickers: [
      {
        image: "/images/afuera/luzapagada.png",
        x: 2233.8,
        y: 341.3,
        width: 76.8,
        height: 138,
      },
    ],
    glass: [
      { x: 2336.8, y: 360.1, width: 219, height: 23.7 },
      { x: 2337.6, y: 388.7, width: 108.7, height: 91.4 },
      { x: 2452.8, y: 388.7, width: 102.9, height: 91.4 },
      { x: 2337.6, y: 481.7, width: 108.7, height: 80, frosted: true },
      { x: 2452.8, y: 481.7, width: 102.9, height: 80, frosted: true },
    ],
  },
];
