import { PanelIcon } from "@/types/panel";

const HEART: PanelIcon = { src: "/images/corazon.png", width: 564, height: 501 };
const LADYBUG: PanelIcon = {
  src: "/images/mariquita.png",
  width: 520,
  height: 435,
};
const BUTTERFLY: PanelIcon = {
  src: "/images/mariposa.png",
  width: 675,
  height: 517,
};

export const CHARMS: PanelIcon[] = [HEART, BUTTERFLY, LADYBUG];

export const FRAME_CHARMS: { charm: PanelIcon; x: number; y: number }[] = [
  { charm: HEART, x: 7.6, y: 7.6 },
  { charm: BUTTERFLY, x: 92.4, y: 7.6 },
  { charm: LADYBUG, x: 7.6, y: 92.4 },
  { charm: HEART, x: 92.4, y: 92.4 },
];
