export type PanelButtonKind = "nav" | "icon" | "small";

export type PanelLang = "en" | "es" | "jam" | "ht";

export type LocationView = "map" | "rooms" | "portals" | "mirrors" | "sims";

export type PanelView = LocationView | "music" | "local" | "settings";

export type PanelTextKey =
  | "map"
  | "rooms"
  | "mapTitle"
  | "roomsTitle"
  | "portals"
  | "portalsTitle"
  | "portalApproach"
  | "portalOpen"
  | "portalEnter"
  | "portalBack"
  | "portalCenter"
  | "portalZoomIn"
  | "portalZoomOut"
  | "portalUp"
  | "portalDown"
  | "portalLeft"
  | "portalRight"
  | "portalLight"
  | "portalNext"
  | "psychicAsk"
  | "psychicReply"
  | "psychicInsist"
  | "psychicAskName"
  | "psychicPuzzled"
  | "rainContinue"
  | "rainYes"
  | "rainNo"
  | "rainStay"
  | "rainGo"
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
  | "mapHomeAtlantic"
  | "mapFitAll"
  | "mapLibrary"
  | "mapFood"
  | "mapCoffee"
  | "mapStorage"
  | "mapLanguages"
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
  | "songWhoAreYou"
  | "songWhoAreYouAmbient"
  | "songWeightless"
  | "songWeightlessLong"
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
  | "local"
  | "localHere"
  | "localYours"
  | "chat"
  | "r2ss"
  | "satchel"
  | "settingsSave"
  | "settingsLoad"
  | "settingsSaved"
  | "settingsBadFile"
  | "prev"
  | "next"
  | "language"
  | "menu"
  | "langStatus";

export type PanelDictionary = Record<PanelTextKey, string>;

export interface PanelContextValue {
  t: PanelDictionary;
  lang: PanelLang;
  openRoom: (room: RoomTile) => void;
  selectLocation: (id: string) => void;
}

export interface LocalizedSources {
  src?: string;
  srcEn?: string;
  srcEs?: string;
  srcPat?: string;
  srcKre?: string;
}

export interface LocalizedImage extends LocalizedSources {
  width: number;
  height: number;
}

export interface PanelIcon {
  src: string;
  width: number;
  height: number;
}

export interface FramedImage extends PanelIcon {
  hole: { x: number; y: number; width: number; height: number };
}

export interface CharmDrop {
  id: number;
  charm: PanelIcon;
  x: number;
  y: number;
  size: number;
  dx: number;
  rise: number;
  fall: number;
  spin: number;
  seconds: number;
  delay: number;
}

export interface DownloadPlatform {
  id: string;
  name: string;
  icon: PanelIcon;
  visible: PanelCrop;
  scale: number;
  href?: string;
}

export interface SimSlot {
  id: string;
  poster?: PanelIcon;
  video?: string;
}

export interface RoomTile {
  id: string;
  labelKey: PanelTextKey;
  image?: LocalizedImage;
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
  speech: PanelCrop;
  online: PanelCrop;
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
