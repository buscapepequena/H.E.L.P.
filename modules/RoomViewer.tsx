"use client";

import { TransitionEvent } from "react";
import { PanelDictionary, ScreenRect } from "@/types/panel";
import StreetView from "@/modules/StreetView";

const toolButton =
  "pixel-crisp relative flex rounded bg-[#1b1530]/75 px-[0.7em] py-[0.45em] font-pixel12 text-[13px] uppercase leading-none tracking-[0.06em] text-[#f3e8f0] transition-transform duration-100 active:scale-[0.95]";

export default function RoomViewer({
  sceneId,
  rect,
  expanded,
  raised,
  onToggle,
  onBack,
  onSettled,
  onEnter,
  t,
}: {
  sceneId: string;
  rect: ScreenRect;
  expanded: boolean;
  raised: boolean;
  onToggle: () => void;
  onBack: () => void;
  onSettled: () => void;
  onEnter: () => void;
  t: PanelDictionary;
}) {
  const settle = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && event.propertyName === "width") {
      onSettled();
    }
  };

  return (
    <div
      onTransitionEnd={settle}
      className="absolute flex overflow-hidden"
      style={{
        left: expanded ? 0 : rect.left,
        top: expanded ? rect.viewTop : rect.top,
        width: expanded ? rect.rootWidth : rect.width,
        height: expanded ? rect.rootHeight : rect.height,
        zIndex: raised ? 30 : undefined,
        transition:
          "left 380ms cubic-bezier(0.22, 1, 0.36, 1), top 380ms cubic-bezier(0.22, 1, 0.36, 1), width 380ms cubic-bezier(0.22, 1, 0.36, 1), height 380ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div className="screen-swap relative flex h-full w-full">
        <StreetView
          startId={sceneId}
          embedded
          compact={!expanded}
          onEnter={onEnter}
        />
        <div className="absolute right-[3%] top-[4%] flex flex-row gap-2">
          <button type="button" onClick={onBack} className={toolButton}>
            {t.roomBack}
          </button>
          <button type="button" onClick={onToggle} className={toolButton}>
            {expanded ? t.roomCollapse : t.roomExpand}
          </button>
        </div>
      </div>
    </div>
  );
}
