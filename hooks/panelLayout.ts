import { CD_ICON, LANG_STRIP, PANEL_BUTTONS } from "@/hooks/panelButtons";
import { PanelButton, PanelLayout, PanelVariant } from "@/types/panel";

const byKind = (kind: PanelButton["kind"]): PanelButton[] =>
  PANEL_BUTTONS.filter((b) => b.kind === kind);

const placeButtons = ({
  navX,
  navWidth,
  navRows,
  iconCols,
  iconRows,
  prev,
  menu,
}: {
  navX: number;
  navWidth: number;
  navRows: [number, number][];
  iconCols: [number, number][];
  iconRows: [number, number][];
  prev: [number, number, number, number];
  menu: [number, number, number, number];
}): PanelButton[] => [
  ...byKind("nav").map((b, i) => ({
    ...b,
    x: navX,
    y: navRows[i][0],
    width: navWidth,
    height: navRows[i][1] - navRows[i][0],
  })),
  ...byKind("icon").map((b, i) => {
    const [left, right] = iconCols[i % iconCols.length];
    const [top, bottom] = iconRows[Math.floor(i / iconCols.length)];
    return {
      ...b,
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    };
  }),
  ...PANEL_BUTTONS.flatMap((b) => {
    const box = b.id === "prev" ? prev : b.id === "menu" ? menu : null;
    if (!box) return [];
    return [{ ...b, x: box[0], y: box[1], width: box[2], height: box[3] }];
  }),
];

const DESKTOP: PanelVariant = {
  image: { src: "/images/panel.png", width: 1449, height: 1087 },
  hole: { x: 60, y: 90, width: 904, height: 666 },
  lang: LANG_STRIP,
  avatar: { x: 46, y: 830, width: 199, height: 172 },
  buttons: PANEL_BUTTONS,
  iconUnits: 36,
  textUnits: 25,
  langUnits: LANG_STRIP.height * 0.62,
};

export const PANEL_VARIANTS: Record<PanelLayout, PanelVariant> = {
  desktop: DESKTOP,
  tabletLandscape: DESKTOP,
  tablet: {
    image: { src: "/images/panelipad.png", width: 1017, height: 1356 },
    hole: { x: 74, y: 213, width: 868, height: 358 },
    lang: { x: 167, y: 1262, width: 685, height: 48 },
    avatar: { x: 75, y: 952, width: 195, height: 183 },
    buttons: placeButtons({
      navX: 70,
      navWidth: 411,
      navRows: [
        [662, 703],
        [705, 747],
        [749, 789],
        [791, 833],
        [835, 876],
      ],
      iconCols: [
        [545, 672],
        [680, 810],
        [818, 948],
      ],
      iconRows: [
        [662, 762],
        [770, 875],
      ],
      prev: [58, 1262, 76, 48],
      menu: [885, 1262, 74, 48],
    }),
    iconUnits: 30,
    textUnits: 22,
    langUnits: 22,
  },
  mobile: {
    image: { src: "/images/panelmovil.png", width: 714, height: 2207 },
    hole: { x: 48, y: 174, width: 620, height: 500 },
    punch: [
      [58, 174],
      [657, 174],
      [667, 184],
      [667, 651],
      [645, 673],
      [70, 673],
      [48, 651],
      [48, 184],
    ],
    lang: { x: 108, y: 2153, width: 505, height: 41 },
    avatar: { x: 44, y: 1526, width: 627, height: 369 },
    buttons: placeButtons({
      navX: 46,
      navWidth: 622,
      navRows: [
        [747, 811],
        [817, 887],
        [894, 965],
        [971, 1043],
        [1050, 1122],
      ],
      iconCols: [
        [55, 342],
        [371, 657],
      ],
      iconRows: [
        [1181, 1275],
        [1285, 1372],
        [1383, 1474],
      ],
      prev: [34, 2153, 56, 41],
      menu: [622, 2153, 59, 41],
    }).map((b) => (b.view === "music" ? { ...b, icon: CD_ICON } : b)),
    iconUnits: 44,
    textUnits: 32,
    langUnits: 19,
  },
};
