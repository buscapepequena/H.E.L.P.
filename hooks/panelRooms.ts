import { FramedImage, RoomTile } from "@/types/panel";

export const BOX_BORDER: FramedImage = {
  src: "/images/boxborder.png",
  width: 1477,
  height: 946,
  hole: { x: 68, y: 82, width: 1342, height: 792 },
};

export const WS1_ROOMS: RoomTile[] = [
  {
    id: "ws1-afuera",
    labelKey: "roomOutside",
    sceneId: "ws1-afuera",
    image: {
      src: "/images/ws1/edificiofrente.png",
      width: 1295,
      height: 810,
    },
  },
  {
    id: "ws1-cafeteria",
    labelKey: "roomCafeteria",
    sceneId: "ws1-cafeteria",
    image: { src: "/images/ws1/cafeteria.png", width: 1586, height: 992 },
  },
  {
    id: "ws1-dormitorio",
    labelKey: "roomDorm",
    sceneId: "ws1-dormitorio",
    image: { src: "/images/ws1/dormitorio.png", width: 1586, height: 992 },
  },
  {
    id: "ws1-bano",
    labelKey: "roomBathroom",
    sceneId: "ws1-bano",
    image: { src: "/images/ws1/bano.png", width: 1586, height: 992 },
  },
];

export const WS2_ROOMS: RoomTile[] = [
  {
    id: "ws2-security",
    labelKey: "roomSecurity",
    sceneId: "ws2-security",
    image: {
      src: "/images/ws2/security-en.png",
      srcEs: "/images/ws2/security-es.png",
      srcPat: "/images/ws2/security-pat.png",
      srcKre: "/images/ws2/security-kre.png",
      width: 1586,
      height: 992,
    },
  },
  {
    id: "ws2-ascensor",
    labelKey: "roomElevator",
    sceneId: "ws2-ascensor",
    image: { src: "/images/ws2/ascensor.png", width: 1586, height: 992 },
  },
];
