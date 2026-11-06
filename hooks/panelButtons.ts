import {
  PanelButton,
  PanelIcon,
  PanelTextKey,
  PanelView,
} from "@/types/panel";

export const MAP_ICON: PanelIcon = {
  src: "/images/mapa.png",
  width: 953,
  height: 641,
};

export const ROOMS_ICON: PanelIcon = {
  src: "/images/quartos.png",
  width: 707,
  height: 464,
};

export const PORTALS_ICON: PanelIcon = {
  src: "/images/portals.png",
  width: 998,
  height: 707,
};

export const MIRRORS_ICON: PanelIcon = {
  src: "/images/mirror.png",
  width: 800,
  height: 654,
};

export const SIMS_ICON: PanelIcon = {
  src: "/images/replay.png",
  width: 817,
  height: 592,
};

const NAV_ROWS: [number, number][] = [
  [310, 359],
  [365, 424],
  [425, 483],
  [485, 543],
  [545, 603],
];

const NAV_CONTENT: {
  labelKey: PanelTextKey;
  icon?: PanelIcon;
  textKey?: PanelTextKey;
  view?: PanelView;
}[] = [
  { labelKey: "map", icon: MAP_ICON, textKey: "map", view: "map" },
  { labelKey: "rooms", icon: ROOMS_ICON, textKey: "rooms", view: "rooms" },
  { labelKey: "portals", icon: PORTALS_ICON, textKey: "portals", view: "portals" },
  { labelKey: "mirrors", icon: MIRRORS_ICON, textKey: "mirrors", view: "mirrors" },
  { labelKey: "sims", icon: SIMS_ICON, textKey: "sims", view: "sims" },
];

export const VIEW_SCREENS: Record<
  PanelView,
  { titleKey: PanelTextKey; subtitle: string }
> = {
  map: { titleKey: "mapTitle", subtitle: "マップ" },
  rooms: { titleKey: "roomsTitle", subtitle: "ルーム" },
  portals: { titleKey: "portalsTitle", subtitle: "ポータル" },
  mirrors: { titleKey: "mirrorsTitle", subtitle: "ミラー" },
  sims: { titleKey: "simsTitle", subtitle: "シム" },
  music: { titleKey: "tunesTitle", subtitle: "チューン" },
};

export const CD_ICON: PanelIcon = {
  src: "/images/cd.png",
  width: 300,
  height: 252,
};

const DISC_CONTENT: { textKey: PanelTextKey; view: PanelView } = {
  textKey: "tunes",
  view: "music",
};

const ICON_COLS: [number, number][] = [
  [1031, 1156],
  [1163, 1289],
  [1296, 1421],
];

const ICON_ROWS: [number, number][] = [
  [703, 830],
  [842, 968],
];

const ICON_LABELS: PanelTextKey[] = [
  "tools",
  "computer",
  "messages",
  "disc",
  "cart",
  "settings",
];

export const LANG_STRIP = { x: 1040, y: 1038, width: 312, height: 28 };

export const PANEL_BUTTONS: PanelButton[] = [
  ...NAV_ROWS.map(([top, bottom], i) => ({
    id: `nav-${i + 1}`,
    kind: "nav" as const,
    x: 1028,
    y: top,
    width: 370,
    height: bottom - top,
    radius: "10px",
    ...NAV_CONTENT[i],
  })),
  ...ICON_ROWS.flatMap(([top, bottom], r) =>
    ICON_COLS.map(([left, right], c) => ({
      id: `icon-${r * 3 + c + 1}`,
      labelKey: ICON_LABELS[r * 3 + c],
      kind: "icon" as const,
      ...(ICON_LABELS[r * 3 + c] === "disc" ? DISC_CONTENT : {}),
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
      radius: "10px",
    })),
  ),
  {
    id: "prev",
    labelKey: "prev",
    kind: "small",
    x: 942,
    y: 1036,
    width: 30,
    height: 32,
    radius: "6px",
  },
  {
    id: "next",
    labelKey: "next",
    kind: "small",
    x: 972,
    y: 1036,
    width: 31,
    height: 32,
    radius: "6px",
  },
  {
    id: "lang",
    labelKey: "language",
    kind: "small",
    x: 886,
    y: 1036,
    width: 32,
    height: 32,
    radius: "6px",
  },
  {
    id: "menu",
    labelKey: "menu",
    kind: "small",
    x: 1404,
    y: 1034,
    width: 32,
    height: 36,
    radius: "6px",
  },
];
