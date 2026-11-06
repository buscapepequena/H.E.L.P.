"use client";

import Image from "next/image";
import { PointerEvent, useRef, useState } from "react";
import { formatTime } from "@/hooks/musicContext";
import { SIM_BORDER } from "@/hooks/panelSims";
import { playClick } from "@/hooks/soundEffects";
import { PanelDictionary, SimSlot } from "@/types/panel";

const HEART =
  "M12 21s-7.5-4.7-10-9.3C.3 8.2 2.2 4.5 6 4.5c2.4 0 4.3 1.3 6 3.5 1.7-2.2 3.6-3.5 6-3.5 3.8 0 5.7 3.7 4 7.2-2.5 4.6-10 9.3-10 9.3z";

const pct = (value: number, total: number): string => `${(value / total) * 100}%`;

const cute =
  "relative flex aspect-square h-[9cqh] shrink-0 items-center justify-center rounded-full border-[0.35cqw] border-[#8b6fc9] bg-[linear-gradient(180deg,#fff4fb_0%,#f7b7dd_100%)] text-[#6d4fb3] shadow-[0_0.3cqw_0_#c9b8ef] transition-transform duration-100 active:translate-y-[0.2cqw] disabled:opacity-60";

export default function SimViewer({
  slot,
  t,
  onClose,
}: {
  slot: SimSlot;
  t: PanelDictionary;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const progress = duration ? Math.min(1, time / duration) : 0;
  const { hole } = SIM_BORDER;

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    playClick(1.1);
    if (video.paused) void video.play();
    else video.pause();
  };

  const toggleMuted = () => {
    const video = videoRef.current;
    if (!video) return;
    playClick(1);
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const seek = (event: PointerEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const fraction = (event.clientX - rect.left) / rect.width;
    video.currentTime = Math.max(0, Math.min(1, fraction)) * duration;
  };

  return (
    <div
      className="screen-swap absolute inset-0 z-20 flex items-center justify-center bg-[#0d0a1c]"
      style={{ containerType: "size" }}
    >
      <div
        className="relative flex"
        style={{
          width: `min(98cqw, calc(98cqh * ${SIM_BORDER.width / SIM_BORDER.height}))`,
          aspectRatio: `${SIM_BORDER.width} / ${SIM_BORDER.height}`,
        }}
      >
        <div
          className="absolute flex overflow-hidden bg-[#120e26]"
          style={{
            left: pct(hole.x, SIM_BORDER.width),
            top: pct(hole.y, SIM_BORDER.height),
            width: pct(hole.width, SIM_BORDER.width),
            height: pct(hole.height, SIM_BORDER.height),
          }}
        >
          {slot.video && (
            <video
              ref={videoRef}
              src={slot.video}
              poster={slot.poster?.src}
              playsInline
              onClick={toggle}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
              onLoadedMetadata={(event) =>
                setDuration(event.currentTarget.duration)
              }
              className="relative flex h-full w-full object-cover"
            />
          )}
          {!slot.video && slot.poster && (
            <Image
              src={slot.poster.src}
              alt=""
              width={slot.poster.width}
              height={slot.poster.height}
              unoptimized
              draggable={false}
              className="pointer-events-none relative flex h-full w-full select-none object-cover"
            />
          )}
        </div>

        <Image
          src={SIM_BORDER.src}
          alt=""
          width={SIM_BORDER.width}
          height={SIM_BORDER.height}
          unoptimized
          loading="eager"
          draggable={false}
          className="pointer-events-none relative flex h-full w-full select-none mix-blend-screen"
        />

        <div
          className="pointer-events-none absolute flex flex-col justify-between p-[2cqh]"
          style={{
            left: pct(hole.x, SIM_BORDER.width),
            top: pct(hole.y, SIM_BORDER.height),
            width: pct(hole.width, SIM_BORDER.width),
            height: pct(hole.height, SIM_BORDER.height),
          }}
        >
          <div className="relative flex flex-row justify-end pr-[6cqw]">
            <button
              type="button"
              aria-label={t.roomBack}
              onClick={() => {
                playClick(0.9);
                onClose();
              }}
              className={`${cute} pointer-events-auto`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[46%] w-[46%]"
                fill="none"
                stroke="currentColor"
                strokeWidth={4}
                strokeLinecap="round"
              >
                <path d="M6 6 L18 18 M18 6 L6 18" />
              </svg>
            </button>
          </div>

          <div className="pixel-crisp pointer-events-auto relative flex flex-row items-center gap-[1.4cqw] rounded-full border-[0.35cqw] border-[#8b6fc9] bg-[linear-gradient(180deg,#fff4fb_0%,#e6dcff_100%)] px-[1.4cqw] py-[1cqh] font-pixel12 text-[3.4cqh] leading-none text-[#6d4fb3]">
            <button
              type="button"
              aria-label={playing ? t.musicPause : t.musicPlay}
              disabled={!slot.video}
              onClick={toggle}
              className={cute}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[50%] w-[50%]"
                fill="currentColor"
              >
                {playing ? (
                  <path d="M6 4h4v16H6z M14 4h4v16h-4z" />
                ) : (
                  <path d="M7 4l13 8-13 8z" />
                )}
              </svg>
            </button>
            <span>{formatTime(time)}</span>
            <div
              role="slider"
              aria-label={t.musicSeek}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              tabIndex={0}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                seek(event);
              }}
              onPointerMove={(event) => {
                if (event.buttons) seek(event);
              }}
              className="relative flex h-[3cqh] min-w-0 flex-1 touch-none rounded-full border-[0.25cqw] border-[#8b6fc9] bg-[repeating-linear-gradient(115deg,#f7b7dd_0_8px,#d9ccf7_8px_16px)]"
            >
              <div
                className="relative flex h-full rounded-full bg-[#ff8fc7]"
                style={{ width: `${progress * 100}%` }}
              />
              <svg
                viewBox="0 0 24 24"
                className="absolute top-1/2 flex h-[220%] w-auto -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_1px_0_#8b6fc9]"
                style={{ left: `${progress * 100}%` }}
                fill="#ff6fb5"
                stroke="#fff4fb"
                strokeWidth={2}
              >
                <path d={HEART} />
              </svg>
            </div>
            <span>{formatTime(duration)}</span>
            <button
              type="button"
              aria-label={t.musicVolume}
              aria-pressed={muted}
              disabled={!slot.video}
              onClick={toggleMuted}
              className={cute}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[54%] w-[54%]"
                fill="currentColor"
                opacity={muted ? 0.4 : 1}
              >
                <path d={HEART} />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
