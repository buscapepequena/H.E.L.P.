"use client";

import Image from "next/image";
import { PointerEvent } from "react";
import { formatTime, useMusic } from "@/hooks/musicContext";
import { playClick } from "@/hooks/soundEffects";
import { PanelDictionary } from "@/types/panel";
import MusicSeek from "@/modules/MusicSeek";
import MusicSpectrum from "@/modules/MusicSpectrum";

const PLAYER = { src: "/images/mp3.png", width: 1310, height: 938 };
const HOLE = { x: 85, y: 254, width: 1140, height: 321 };
const VOLUME = { x: 1015, y: 691, width: 200, height: 36 };
const VOLUME_CELLS = 9;
const REPEAT_LED = { x: 148, y: 756, width: 49, height: 22 };
const SPEAKER_WAVES = { x: 950, y: 685, width: 40, height: 48 };
const BUTTONS = {
  repeat: { x: 84, y: 648, width: 178, height: 137 },
  prev: { x: 282, y: 648, width: 174, height: 137 },
  play: { x: 461, y: 642, width: 215, height: 148 },
  next: { x: 681, y: 648, width: 173, height: 137 },
};

const box = (b: { x: number; y: number; width: number; height: number }) => ({
  left: `${(b.x / PLAYER.width) * 100}%`,
  top: `${(b.y / PLAYER.height) * 100}%`,
  width: `${(b.width / PLAYER.width) * 100}%`,
  height: `${(b.height / PLAYER.height) * 100}%`,
});

const pressable =
  "absolute flex items-center justify-center transition-transform duration-100 active:scale-[0.95]";

export default function Mp3Player({ t }: { t: PanelDictionary }) {
  const music = useMusic();

  const pickVolume = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    music.setVolume((event.clientX - rect.left) / rect.width);
  };

  return (
    <div
      className="screen-swap absolute inset-0 flex items-center justify-center bg-[url('/images/fondoazul.png')] bg-cover bg-center"
      style={{ containerType: "size" }}
    >
      <div
        className="relative flex"
        style={{
          width: `min(96cqw, calc(96cqh * ${PLAYER.width / PLAYER.height}))`,
          height: `min(96cqh, calc(96cqw * ${PLAYER.height / PLAYER.width}))`,
          containerType: "size",
        }}
      >
        <div
          className="pixel-crisp absolute flex flex-col justify-between bg-black p-[2.2cqh] font-pixel12 leading-none text-white"
          style={box(HOLE)}
        >
          <div className="relative flex min-h-0 flex-1 flex-row gap-[2.5cqw]">
            <div className="relative flex aspect-square h-full shrink-0 items-center justify-center rounded border border-[#7fd9f2]/70 bg-[#10245e] p-[1cqh]">
              <Image
                src="/images/cd.png"
                alt=""
                width={300}
                height={252}
                unoptimized
                draggable={false}
                className="relative flex h-full w-full object-contain"
              />
            </div>
            <div className="relative flex min-w-0 flex-1 flex-col gap-[1.2cqh]">
              <div className="relative flex flex-row items-start justify-between gap-[2cqw]">
                <div className="relative min-w-0 truncate text-[5.4cqh] tracking-[0.04em]">
                  {music.track ? t[music.track.titleKey] : t.noTracks}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playClick(1.2);
                    music.popOut();
                  }}
                  className="relative flex shrink-0 rounded-full border border-[#7fd9f2] px-[0.7em] py-[0.35em] text-[3cqh] uppercase tracking-[0.06em] text-[#7fe6fb] transition-transform duration-100 active:scale-[0.95]"
                >
                  {t.popOut}
                </button>
              </div>
              <MusicSpectrum bars={32} className="min-h-0 flex-1" />
            </div>
          </div>
          <div className="relative mt-[1.6cqh] flex flex-row items-center gap-[2cqw] text-[4cqh]">
            <span className="text-[#7fe6fb]">{music.playing ? "❚❚" : "▶"}</span>
            <span>{formatTime(music.time)}</span>
            <MusicSeek label={t.musicSeek} className="h-[2.2cqh] flex-1" />
            <span>{formatTime(music.duration)}</span>
          </div>
        </div>

        <Image
          src={PLAYER.src}
          alt="MP3"
          width={PLAYER.width}
          height={PLAYER.height}
          unoptimized
          draggable={false}
          className="pointer-events-none relative flex h-full w-full select-none"
        />

        <button
          type="button"
          aria-label={t.musicRepeat}
          aria-pressed={music.repeat}
          onClick={() => {
            playClick(1);
            music.toggleRepeat();
          }}
          className={pressable}
          style={box(BUTTONS.repeat)}
        />
        <button
          type="button"
          aria-label={t.prev}
          onClick={() => {
            playClick(0.9);
            music.prev();
          }}
          className={pressable}
          style={box(BUTTONS.prev)}
        />
        <button
          type="button"
          aria-label={music.playing ? t.musicPause : t.musicPlay}
          onClick={() => {
            playClick(1.1);
            music.toggle();
          }}
          className={pressable}
          style={box(BUTTONS.play)}
        >
          <div className="pointer-events-none absolute left-1/2 top-[46%] flex aspect-square h-[42%] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-[16%] drop-shadow-[0_2px_0_#1c3f9e]">
            {music.playing ? (
              <>
                <div className="relative flex h-full w-[28%] rounded-[3px] bg-white" />
                <div className="relative flex h-full w-[28%] rounded-[3px] bg-white" />
              </>
            ) : (
              <div
                className="relative flex h-full w-[86%] bg-white"
                style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }}
              />
            )}
          </div>
        </button>
        <button
          type="button"
          aria-label={t.next}
          onClick={() => {
            playClick(1.1);
            music.next();
          }}
          className={pressable}
          style={box(BUTTONS.next)}
        />

        {music.repeat && (
          <div
            className="pointer-events-none absolute flex rounded-full bg-[#5fe6fb] shadow-[0_0_8px_#35d4f5]"
            style={box(REPEAT_LED)}
          />
        )}

        <svg
          viewBox="0 0 40 48"
          className="pointer-events-none absolute flex"
          style={box(SPEAKER_WAVES)}
          fill="none"
          stroke="#17306f"
          strokeWidth={4}
          strokeLinecap="round"
        >
          {music.volume > 0 && <path d="M6 15 Q15 24 6 33" />}
          {music.volume > 0.5 && <path d="M18 7 Q33 24 18 41" />}
        </svg>

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
          className="absolute flex touch-none flex-row gap-[1.5%] overflow-hidden rounded-md border-2 border-[#17306f] bg-[#17306f]"
          style={box(VOLUME)}
        >
          {Array.from({ length: VOLUME_CELLS }, (_, i) => (
            <div
              key={i}
              className="relative flex flex-1"
              style={{
                background:
                  (i + 1) / VOLUME_CELLS <= music.volume + 0.001
                    ? "#35d4f5"
                    : "#31436f",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
