import { PanelLang, PanelTextKey } from "@/types/panel";

export interface LocalProfile {
  lang?: PanelLang;
  volume?: number;
  repeat?: boolean;
  track?: PanelTextKey;
}

export interface ProfileFile {
  app: string;
  version: number;
  profile: LocalProfile;
}
