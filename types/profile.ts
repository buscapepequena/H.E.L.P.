import { PanelLang, PanelTextKey } from "@/types/panel";

export interface LocalProfile {
  lang?: PanelLang;
  volume?: number;
  repeat?: boolean;
  track?: PanelTextKey;
  portal?: PortalPosition;
}

export interface PortalPosition {
  sceneId: string;
  step: number;
}

export interface ProfileFile {
  app: string;
  version: number;
  profile: LocalProfile;
}
