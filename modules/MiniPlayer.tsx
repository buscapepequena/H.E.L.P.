"use client";

import Image from "next/image";
import { PointerEvent, useEffect, useState } from "react";
import { formatTime, useMusic } from "@/hooks/musicContext";
import { readProfile } from "@/hooks/localProfile";
import { LANG_CHANGE_EVENT, PANEL_TEXT } from "@/hooks/panelI18n";
import { playClick } from "@/hooks/soundEffects";
import { PanelLang } from "@/types/panel";
import FrameButton from "@/modules/FrameButton";
import MusicSeek from "@/modules/MusicSeek";
import MusicSpectrum from "@/modules/MusicSpectrum";

const FRAME = { src: "/images/collapsable.png", width: 2138, height: 308 };
const HOLE = { x: 36, y: 41, width: 2067, height: 233 };
const VOLUME_CELLS = 5;

const glass =
  "relative flex aspect-square h-[46cqh] shrink-0 items-center justify-center rounded-[18%] border-2 border-white/80 bg-[#2a3050] text-[20cqh] leading-none text-white transition-transform duration-100 active:scale-[0.93]";

export default function MiniPlayer() {
  const music = useMusic();
  const [lang, setLang] = useState<PanelLang>("en");
  const t = PANEL_TEXT[lang];

  useEffect(() => {
    const read = () => {
      void readProfile().then((profile) => {
        if (profile.lang) setLang(profile.lang);
      });
    };
    read();
    window.addEventListener(LANG_CHANGE_EVENT, read);
    return () => window.removeEventListener(LANG_CHANGE_EVENT, read);
  }, []);

  const pickVolume = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    music.setVolume(Math.ceil(((event.clientX - rect.left) / rect.width) * VOLUME_CELLS) / VOLUME_CELLS);
  };

  if (!music.popped) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center">
      <div
        className="pointer-events-auto relative flex w-[min(98vw,640px)] transition-transform duration-300 ease-out"
        style={{ transform: music.collapsed ? "translateY(100%)" : "none" }}
      >
        <FrameButton
          label={music.collapsed ? t.roomExpand : t.roomCollapse}
          shape="tab"
          onClick={() => {
            playClick(1);
            music.toggleCollapsed();
          }}
          className="absolute bottom-[calc(100%-3px)] right-[5%] h-6 w-16"
        >
          <svg
            viewBox="0 0 24 12"
            className="h-2.5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: music.collapsed ? "none" : "rotate(180deg)" }}
          >
            <path d="M4 10 L12 3 L20 10" />
          </svg>
        </FrameButton>
        <div
          className="relative flex w-full"
          style={{
            height: `calc(min(98vw, 640px) * ${FRAME.height / FRAME.width})`,
            containerType: "size",
          }}
        >
          <div
            className="absolute flex bg-[#141a36]"
            style={{
              left: `${(HOLE.x / FRAME.width) * 100}%`,
              top: `${(HOLE.y / FRAME.height) * 100}%`,
              width: `${(HOLE.width / FRAME.width) * 100}%`,
              height: `${(HOLE.height / FRAME.height) * 100}%`,
            }}
          />
          <Image
            src={FRAME.src}
            alt=""
            width={FRAME.width}
            height={FRAME.height}
            unoptimized
            draggable={false}
            className="pointer-events-none relative flex h-full w-full select-none"
          />
          <div
            className="pixel-crisp absolute flex flex-row items-center gap-[1.4cqw] font-pixel12 leading-none text-white"
            style={{
              left: `${((HOLE.x + 40) / FRAME.width) * 100}%`,
              top: `${(HOLE.y / FRAME.height) * 100}%`,
              width: `${((HOLE.width - 80) / FRAME.width) * 100}%`,
              height: `${(HOLE.height / FRAME.height) * 100}%`,
            }}
          >
            <MusicSpectrum
              bars={8}
              spread
              className="h-[60cqh] w-[9cqw] shrink-0 max-sm:hidden"
            />
            <button
              type="button"
              aria-label={t.prev}
              onClick={() => {
                playClick(0.9);
                music.prev();
              }}
              className={glass}
            >
              ◀◀
            </button>
            <button
              type="button"
              aria-label={music.playing ? t.musicPause : t.musicPlay}
              onClick={() => {
                playClick(1.1);
                music.toggle();
              }}
              className={`${glass} !bg-[#6fe3f7] !text-[#14203f]`}
            >
              {music.playing ? "❚❚" : "▶"}
            </button>
            <button
              type="button"
              aria-label={t.next}
              onClick={() => {
                playClick(1.1);
                music.next();
              }}
              className={glass}
            >
              ▶▶
            </button>
            <button
              type="button"
              aria-label={t.musicRepeat}
              aria-pressed={music.repeat}
              onClick={() => {
                playClick(1);
                music.toggleRepeat();
              }}
              className={`${glass} ${music.repeat ? "!bg-[#6fe3f7] !text-[#14203f] shadow-[0_0_10px_#35d4f5]" : ""}`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[56%] w-[56%]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 11 V9 a3 3 0 0 1 3 -3 H18 M15 3 L18 6 L15 9" />
                <path d="M20 13 V15 a3 3 0 0 1 -3 3 H6 M9 21 L6 18 L9 15" />
              </svg>
            </button>
            <div className="relative flex min-w-0 flex-1 flex-col justify-center gap-[6cqh]">
              <div className="relative truncate text-[17cqh] tracking-[0.04em]">
                {music.track ? t[music.track.titleKey] : t.noTracks}
              </div>
              <div className="relative flex flex-row items-center gap-[1.2cqw]">
                <MusicSeek label={t.musicSeek} className="h-[9cqh] flex-1" />
                <span className="text-[15cqh] max-sm:hidden">
                  {formatTime(music.time)} / {formatTime(music.duration)}
                </span>
                <div
                  role="slider"
                  aria-label={t.musicVolume}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(music.volume * 100)}
                  tabIndex={0}
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    pickVolume(event);
                  }}
                  onPointerMove={(event) => {
                    if (event.buttons) pickVolume(event);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                      event.preventDefault();
                      music.setVolume(music.volume + 1 / VOLUME_CELLS);
                    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                      event.preventDefault();
                      music.setVolume(music.volume - 1 / VOLUME_CELLS);
                    }
                  }}
                  className="relative flex h-[16cqh] w-[11cqw] shrink-0 touch-none flex-row items-end gap-[8%]"
                >
                  {Array.from({ length: VOLUME_CELLS }, (_, i) => (
                    <div
                      key={i}
                      className="relative flex flex-1 rounded-[1px]"
                      style={{
                        height: `${40 + (i * 60) / (VOLUME_CELLS - 1)}%`,
                        background:
                          (i + 1) / VOLUME_CELLS <= music.volume + 0.001
                            ? "#6fe3f7"
                            : "#3a4470",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <FrameButton
              label={t.roomBack}
              shape="square"
              onClick={() => {
                playClick(0.9);
                music.closePop();
              }}
              className="relative aspect-square h-[44cqh]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[46%] w-[46%]"
                fill="none"
                stroke="currentColor"
                strokeWidth={3.4}
                strokeLinecap="round"
              >
                <path d="M6 6 L18 18 M18 6 L6 18" />
              </svg>
            </FrameButton>
          </div>
        </div>
      </div>
    </div>
  );
}
