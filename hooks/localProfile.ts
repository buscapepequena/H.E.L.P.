import { LANG_STORAGE_KEY } from "@/hooks/panelI18n";
import {
  PROFILE_FILE_NAME,
  cleanProfile,
  packProfile,
} from "@/hooks/profileFile";
import { PanelLang } from "@/types/panel";
import { LocalProfile } from "@/types/profile";

const PROFILE_KEY = "help-profile";

const readStored = (): LocalProfile => {
  try {
    const lang = window.localStorage.getItem(LANG_STORAGE_KEY) as PanelLang | null;
    const stored = window.localStorage.getItem(PROFILE_KEY);
    return cleanProfile({
      ...(lang ? { lang } : {}),
      ...(stored ? (JSON.parse(stored) as LocalProfile) : {}),
    });
  } catch {
    return {};
  }
};

export const readProfile = async (): Promise<LocalProfile> => readStored();

export const saveProfile = async (patch: LocalProfile): Promise<void> => {
  try {
    window.localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify({ ...readStored(), ...patch }),
    );
  } catch {
    return;
  }
};

export const exportProfile = async (): Promise<void> => {
  const blob = new Blob([packProfile(readStored())], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = PROFILE_FILE_NAME;
  link.click();
  URL.revokeObjectURL(url);
};
