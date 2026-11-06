import { FramedImage, RoomTile } from "@/types/panel";

export const BOX_BORDER: FramedImage = {
  src: "/images/boxborder.png",
  width: 1477,
  height: 946,
  hole: { x: 68, y: 82, width: 1342, height: 792 },
};

export const ROOM_TILES: RoomTile[] = [
  {
    id: "afuera",
    labelKey: "roomOutside",
    sceneId: "afuera",
    image: {
      src: "/images/edificiofrente.png",
      width: 1295,
      height: 810,
    },
  },
  {
    id: "security",
    labelKey: "roomSecurity",
    sceneId: "security",
    image: { src: "/images/security.png", width: 1586, height: 992 },
  },
  {
    id: "room-3",
    labelKey: "roomCafeteria",
    sceneId: "cafeteria",
    image: { src: "/images/cafeteria.png", width: 1586, height: 992 },
  },
  {
    id: "room-4",
    labelKey: "roomElevator",
    sceneId: "ascensor",
    image: { src: "/images/ascensor.png", width: 1586, height: 992 },
  },
  {
    id: "room-5",
    labelKey: "roomDorm",
    sceneId: "dormitorio",
    image: { src: "/images/dormitorio.png", width: 1586, height: 992 },
  },
  {
    id: "room-6",
    labelKey: "roomBathroom",
    sceneId: "bano",
    image: { src: "/images/bano.png", width: 1586, height: 992 },
  },
];
