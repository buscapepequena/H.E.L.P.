export type PanelButtonKind = "nav" | "icon" | "small";

export type PanelLang = "en" | "es" | "jam" | "ht";

export type PanelView =
  | "map"
  | "rooms"
  | "portals"
  | "mirrors"
  | "sims"
  | "music";

export type PanelTextKey =
  | "map"
  | "rooms"
  | "mapTitle"
  | "roomsTitle"
  | "portals"
  | "portalsTitle"
  | "mirrors"
  | "mirrorsTitle"
  | "sims"
  | "simsTitle"
  | "roomOutside"
  | "roomElevator"
  | "roomDorm"
  | "roomBathroom"
  | "roomSecurity"
  | "roomCafeteria"
  | "roomExpand"
  | "roomCollapse"
  | "roomBack"
  | "mapHome"
  | "tunes"
  | "tunesTitle"
  | "noTracks"
  | "songJourney"
  | "songJourneyLong"
  | "songDeparture"
  | "songTerms"
  | "songAlone"
  | "songDawn"
  | "songMirrors"
  | "songMirrorsPulse"
  | "songMirrorsChamber"
  | "songDepths"
  | "popOut"
  | "musicPlay"
  | "musicPause"
  | "musicRepeat"
  | "musicVolume"
  | "musicSeek"
  | "tools"
  | "computer"
  | "messages"
  | "disc"
  | "cart"
  | "settings"
  | "prev"
  | "next"
  | "language"
  | "menu"
  | "langStatus";

export type PanelDictionary = Record<PanelTextKey, string>;

export interface PanelIcon {
  src: string;
  width: number;
  height: number;
}

export interface FramedImage extends PanelIcon {
  hole: { x: number; y: number; width: number; height: number };
}

export interface RoomTile {
  id: string;
  labelKey: PanelTextKey;
  image?: PanelIcon;
  sceneId?: string;
}

export type PanelLayout = "desktop" | "tabletLandscape" | "tablet" | "mobile";

export interface PanelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PanelVariant {
  image: PanelIcon;
  hole: PanelCrop;
  lang: PanelCrop;
  avatar: PanelCrop;
  punch?: [number, number][];
  buttons: PanelButton[];
  iconUnits: number;
  textUnits: number;
  langUnits: number;
}

export interface ScreenRect {
  left: number;
  top: number;
  width: number;
  height: number;
  rootWidth: number;
  rootHeight: number;
  viewTop: number;
}

export interface PanelButton {
  id: string;
  labelKey: PanelTextKey;
  kind: PanelButtonKind;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: string;
  icon?: PanelIcon;
  textKey?: PanelTextKey;
  view?: PanelView;
}
