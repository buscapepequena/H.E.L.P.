import { LANG_STRIP, PANEL_BUTTONS } from "@/hooks/panelButtons";
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
  speech: { x: 262, y: 852, width: 700, height: 132 },
  online: { x: 105, y: 1045, width: 22, height: 22 },
  buttons: PANEL_BUTTONS,
  iconUnits: 36,
  textUnits: 25,
  langUnits: LANG_STRIP.height * 0.62,
};

export const PANEL_VARIANTS: Record<PanelLayout, PanelVariant> = {
  desktop: DESKTOP,
  tabletLandscape: DESKTOP,
  tablet: {
    image: { src: "/images/panelipad.png", width: 1086, height: 1448 },
    hole: { x: 81, y: 231, width: 924, height: 378 },
    lang: { x: 178, y: 1352, width: 733, height: 46 },
    avatar: { x: 84, y: 687, width: 204, height: 186 },
    speech: { x: 310, y: 708, width: 680, height: 150 },
    online: { x: 170, y: 1279, width: 20, height: 20 },
    buttons: placeButtons({
      navX: 75,
      navWidth: 440,
      navRows: [
        [961, 1001],
        [1008, 1048],
        [1054, 1093],
        [1100, 1139],
        [1146, 1186],
      ],
      iconCols: [
        [581, 716],
        [726, 866],
        [874, 1010],
      ],
      iconRows: [
        [962, 1068],
        [1077, 1186],
      ],
      prev: [64, 1345, 78, 58],
      menu: [944, 1345, 78, 58],
    }),
    iconUnits: 30,
    textUnits: 22,
    langUnits: 22,
  },
  mobile: {
    image: { src: "/images/panelmovil.png", width: 726, height: 2089 },
    hole: { x: 57, y: 177, width: 618, height: 483 },
    punch: [
      [69, 177],
      [663, 177],
      [675, 189],
      [675, 648],
      [663, 660],
      [69, 660],
      [57, 648],
      [57, 189],
    ],
    lang: { x: 112, y: 2030, width: 505, height: 38 },
    avatar: { x: 57, y: 936, width: 618, height: 282 },
    speech: { x: 72, y: 744, width: 588, height: 136 },
    online: { x: 104, y: 1983, width: 18, height: 18 },
    buttons: placeButtons({
      navX: 52,
      navWidth: 626,
      navRows: [
        [1266, 1325],
        [1332, 1387],
        [1392, 1445],
        [1451, 1505],
        [1511, 1567],
      ],
      iconCols: [
        [53, 257],
        [267, 462],
        [472, 673],
      ],
      iconRows: [
        [1612, 1770],
        [1780, 1945],
      ],
      prev: [40, 2022, 62, 50],
      menu: [625, 2022, 62, 50],
    }),
    iconUnits: 44,
    textUnits: 26,
    langUnits: 19,
  },
};
