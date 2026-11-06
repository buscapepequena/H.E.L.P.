"use client";

import { ChangeEvent, useRef, useState } from "react";
import { exportProfile, saveProfile } from "@/hooks/localProfile";
import { PROFILE_FILE_NAME, unpackProfile } from "@/hooks/profileFile";
import { playClick } from "@/hooks/soundEffects";
import { PanelDictionary, PanelTextKey } from "@/types/panel";

const action =
  "pixel-crisp relative flex w-[46cqw] items-center justify-center rounded-[1.2cqw] border-2 border-[#f7a3d0] bg-[#2a2152]/70 py-[3.4cqh] font-pixel12 text-[3cqw] uppercase leading-none tracking-[0.06em] text-[#f7a3d0] transition-transform duration-100 active:scale-[0.96]";

export default function SettingsScreen({ t }: { t: PanelDictionary }) {
  const picker = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<PanelTextKey | null>(null);

  const save = async () => {
    playClick(1.1);
    await exportProfile();
    setStatus("settingsSaved");
  };

  const load = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const profile = unpackProfile(await file.text());
    if (!profile) {
      setStatus("settingsBadFile");
      return;
    }
    await saveProfile(profile);
    window.location.reload();
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-[4cqh]">
      <button type="button" onClick={save} className={action}>
        {t.settingsSave}
      </button>
      <button
        type="button"
        onClick={() => {
          playClick(1);
          picker.current?.click();
        }}
        className={action}
      >
        {t.settingsLoad}
      </button>
      <input
        ref={picker}
        type="file"
        accept=".json,application/json"
        aria-label={t.settingsLoad}
        onChange={load}
        className="hidden"
      />
      <div className="pixel-crisp relative flex h-[3cqw] flex-row items-center gap-[0.6em] font-pixel12 text-[2.2cqw] leading-none tracking-[0.06em] text-[#c9b8ef]">
        {status && <span>{t[status]}</span>}
        {status === "settingsSaved" && <span>{PROFILE_FILE_NAME}</span>}
      </div>
    </div>
  );
}
