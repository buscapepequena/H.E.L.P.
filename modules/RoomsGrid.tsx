"use client";

import Image from "next/image";
import { BOX_BORDER } from "@/hooks/panelRooms";
import { trackArt } from "@/hooks/trackArt";
import { PanelDictionary, PanelLang, RoomTile } from "@/types/panel";

const pct = (value: number, total: number): string => `${(value / total) * 100}%`;

export default function RoomsGrid({
  rooms,
  onOpen,
  t,
  lang,
}: {
  rooms: RoomTile[];
  onOpen: (room: RoomTile) => void;
  t: PanelDictionary;
  lang: PanelLang;
}) {
  return (
    <div
      className="screen-scroll absolute inset-x-[2%] bottom-[3%] flex overflow-y-auto overflow-x-hidden overscroll-contain"
      style={{ top: "calc(3cqh + 5.6cqw)" }}
    >
      <div className="relative flex h-max w-full flex-row flex-wrap content-start justify-center gap-x-[3%] gap-y-[2.4cqh] px-[2%] py-[1.5cqh]">
        {rooms.map((room, i) => {
          const cover = trackArt(room.image, lang);
          return (
          <button
            key={room.id}
            type="button"
            aria-label={t[room.labelKey]}
            onClick={() => onOpen(room)}
            className="room-tile relative flex w-[46%] transition-transform duration-100 active:scale-[0.96]"
            style={{
              aspectRatio: `${BOX_BORDER.width} / ${BOX_BORDER.height}`,
              animationDelay: `${120 + i * 60}ms`,
            }}
          >
            <div
              className="absolute flex overflow-hidden bg-[#120e26]"
              style={{
                left: pct(BOX_BORDER.hole.x, BOX_BORDER.width),
                top: pct(BOX_BORDER.hole.y, BOX_BORDER.height),
                width: pct(BOX_BORDER.hole.width, BOX_BORDER.width),
                height: pct(BOX_BORDER.hole.height, BOX_BORDER.height),
              }}
            >
              {cover && (
                <Image
                  src={cover.src}
                  alt=""
                  width={cover.width}
                  height={cover.height}
                  unoptimized
                  draggable={false}
                  className="pointer-events-none relative flex h-full w-full select-none object-cover"
                />
              )}
            </div>
            <Image
              src={BOX_BORDER.src}
              alt=""
              width={BOX_BORDER.width}
              height={BOX_BORDER.height}
              unoptimized
              loading="eager"
              draggable={false}
              className="pointer-events-none relative flex h-full w-full select-none"
            />
          </button>
          );
        })}
      </div>
    </div>
  );
}
