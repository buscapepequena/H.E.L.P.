"use client";

import Image from "next/image";
import { CSSProperties } from "react";
import { PANEL_BUTTONS } from "@/hooks/panelButtons";
import { PanelButton, PanelDictionary } from "@/types/panel";

const ICON_RATIO = 1.5;
const ICON_HEIGHT = 36;
const TEXT_SIZE = 25;

export default function PanelButtons({
  panelWidth,
  panelHeight,
  selectedNav,
  activeIcon,
  onPress,
  t,
  buttons = PANEL_BUTTONS,
  iconUnits = ICON_HEIGHT,
  textUnits = TEXT_SIZE,
}: {
  panelWidth: number;
  panelHeight: number;
  selectedNav: string;
  activeIcon: string | null;
  onPress: (button: PanelButton) => void;
  t: PanelDictionary;
  buttons?: PanelButton[];
  iconUnits?: number;
  textUnits?: number;
}) {
  const place = (b: PanelButton): CSSProperties => ({
    left: `${(b.x / panelWidth) * 100}%`,
    top: `${(b.y / panelHeight) * 100}%`,
    width: `${(b.width / panelWidth) * 100}%`,
    height: `${(b.height / panelHeight) * 100}%`,
    borderRadius: b.radius,
  });

  return (
    <>
      {buttons.map((b) => {
        const iconHeight = (iconUnits / panelHeight) * 100;
        return (
          <button
            key={b.id}
            type="button"
            aria-label={t[b.labelKey]}
            aria-pressed={
              b.kind === "small"
                ? undefined
                : b.id === selectedNav || b.id === activeIcon
            }
            onClick={() => onPress(b)}
            className="pointer-events-auto absolute flex items-center overflow-hidden transition-transform duration-100 active:scale-[0.97]"
            style={place(b)}
          >
            {b.icon && (
              <div
                className="pointer-events-none absolute left-[5%] top-1/2 flex -translate-y-1/2"
                style={{
                  height: `${iconHeight}cqh`,
                  width: `${iconHeight * ICON_RATIO}cqh`,
                }}
              >
                <Image
                  src={b.icon.src}
                  alt=""
                  width={b.icon.width}
                  height={b.icon.height}
                  unoptimized
                  draggable={false}
                  className="relative flex h-full w-full object-contain"
                />
              </div>
            )}
            {b.textKey && (
              <div
                className={`pixel-crisp pointer-events-none absolute inset-0 flex justify-center font-pixel12 uppercase leading-none tracking-[0.08em] text-[#3e3768] ${
                  b.kind === "icon" && !b.icon
                    ? "items-end pb-[6%]"
                    : "items-center"
                }`}
                style={{
                  fontSize: `${(textUnits / panelHeight) * 100}cqh`,
                }}
              >
                {t[b.textKey]}
              </div>
            )}
          </button>
        );
      })}
    </>
  );
}
