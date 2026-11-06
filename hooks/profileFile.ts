import { PANEL_LANGS } from "@/hooks/panelI18n";
import { LocalProfile, ProfileFile } from "@/types/profile";

const FILE_APP = "h.e.l.p.";
const FILE_VERSION = 1;

export const PROFILE_FILE_NAME = "help-save.json";

export const cleanProfile = (raw: LocalProfile): LocalProfile => ({
  ...(raw.lang && PANEL_LANGS.includes(raw.lang) ? { lang: raw.lang } : {}),
  ...(typeof raw.volume === "number" && raw.volume >= 0 && raw.volume <= 1
    ? { volume: raw.volume }
    : {}),
  ...(typeof raw.repeat === "boolean" ? { repeat: raw.repeat } : {}),
  ...(typeof raw.track === "string" ? { track: raw.track } : {}),
});

export const packProfile = (profile: LocalProfile): string => {
  const file: ProfileFile = {
    app: FILE_APP,
    version: FILE_VERSION,
    profile,
  };
  return JSON.stringify(file, null, 2);
};

export const unpackProfile = (text: string): LocalProfile | null => {
  try {
    const file = JSON.parse(text) as ProfileFile;
    if (file.app !== FILE_APP || file.version > FILE_VERSION || !file.profile) {
      return null;
    }
    return cleanProfile(file.profile);
  } catch {
    return null;
  }
};
