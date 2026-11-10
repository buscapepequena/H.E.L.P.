"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useStreetView } from "@/hooks/useStreetView";
import { SCENES, START_SCENE } from "@/hooks/scenes";
import { localizedSrc } from "@/hooks/trackArt";
import { PanelLang } from "@/types/panel";
import SceneClock from "@/modules/SceneClock";
import SceneCorner from "@/modules/SceneCorner";
import SceneGlass from "@/modules/SceneGlass";
import SceneFlicker from "@/modules/SceneFlicker";
import ZoomKeys from "@/modules/ZoomKeys";
import NavPad from "@/modules/NavPad";
import HelpIntro from "@/modules/HelpIntro";import DraggableControl from "@/modules/DraggableControl";
import SceneStitches from "@/modules/SceneStitches";import DoorPanel from "@/modules/DoorPanel";

const Chevron = ({ rotation }: { rotation: number }) => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    style={{ transform: `rotate(${rotation}deg)` }}
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 15l6-6 6 6" />
  </svg>
);

export default function StreetView({
  startId = START_SCENE,
  embedded = false,
  compact = false,
  lang = "en",
  onEnter,
}: {
  startId?: string;
  embedded?: boolean;
  compact?: boolean;
  lang?: PanelLang;
  onEnter?: () => void;
}) {
  const sv = useStreetView(SCENES, startId, onEnter);
  const transition = sv.transition;
  const period = sv.scene.width * sv.scale;
  const first = sv.scene.wrap && period ? Math.floor(-sv.view.x / period) - 1 : 0;
  const last =
    sv.scene.wrap && period
      ? Math.floor((sv.size.width - sv.view.x) / period) + 1
      : 0;
  const copies = Array.from({ length: last - first + 1 }, (_, i) => first + i);

  return (
    <div
      ref={sv.containerRef}
      className={`relative flex w-full touch-none select-none overflow-hidden bg-[#2a2440] ${embedded ? "h-full" : "h-dvh"}`}
      style={{ cursor: sv.dragging ? "grabbing" : "grab" }}
      onPointerDown={sv.onPointerDown}
      onPointerMove={sv.onPointerMove}
      onPointerUp={sv.onPointerUp}
      onPointerCancel={sv.onPointerUp}
      onDoubleClick={sv.onDoubleClick}
    >
      {sv.scene.fold && (
        <SceneCorner
          scene={sv.scene}
          fold={sv.scene.fold}
          lang={lang}
          view={sv.view}
          scale={sv.scale}
          size={sv.size}
          transition={transition}
          ready={sv.ready}
        />
      )}
      <div
        className={`absolute left-0 top-0 origin-top-left will-change-transform ${sv.scene.fold ? "hidden" : "flex"}`}
        style={{
          width: sv.scene.width,
          height: sv.scene.height,
          transform: `translate3d(${sv.view.x}px, ${sv.view.y}px, 0) scale(${sv.scale})`,
          transition,
          opacity: sv.ready ? 1 : 0,
        }}
      >
        {copies.flatMap((copy) =>
          sv.scene.tiles.map((tile, index) => (
            <div
              key={`${sv.scene.id}-${tile.src}-${index}-${copy}`}
              className="pointer-events-none absolute flex overflow-hidden"
              style={{
                left: tile.x + copy * sv.scene.width,
                top: tile.y,
                width: tile.span ?? tile.width - (tile.cropLeft ?? 0),
                height: tile.height,
              }}
            >
              <Image
                src={localizedSrc(tile, lang) ?? tile.src}
                alt={sv.scene.title}
                width={Math.round(tile.width)}
                height={Math.round(tile.height)}
                unoptimized
                loading="eager"
                fetchPriority="high"
                draggable={false}
                className="pointer-events-none absolute top-0 flex max-w-none"
                style={{
                  left: -(tile.cropLeft ?? 0),
                  width: tile.width,
                  height: tile.height,
                  ...(tile.fadeRight
                    ? {
                        maskImage: `linear-gradient(to right, #000 calc(100% - ${tile.fadeRight}px), transparent 100%)`,
                        WebkitMaskImage: `linear-gradient(to right, #000 calc(100% - ${tile.fadeRight}px), transparent 100%)`,
                      }
                    : {}),
                }}
              />
            </div>
          )),
        )}
        {sv.scene.stitches?.map((seam) => (
          <SceneStitches key={`${sv.scene.id}-stitch-${seam.x}`} seam={seam} />
        ))}
        {sv.scene.clocks?.map((clock) => (
          <SceneClock key={`${sv.scene.id}-${clock.x}-${clock.y}`} clock={clock} />
        ))}
        {sv.scene.flickers?.map((light) => (
          <SceneFlicker
            key={`${sv.scene.id}-flicker-${light.x}-${light.y}`}
            light={light}
          />
        ))}
        {sv.scene.glass?.map((pane, index) => (
          <SceneGlass
            key={`${sv.scene.id}-glass-${pane.x}-${pane.y}`}
            pane={pane}
            index={index}
          />
        ))}
        {sv.scene.focusAreas?.map((area) => (
          <button
            key={`${sv.scene.id}-area-${area.id}`}
            type="button"
            aria-label={area.label}
            onClick={() => sv.focusOn(area)}
            className="absolute flex cursor-pointer"
            style={{
              left: area.x,
              top: area.y,
              width: area.width,
              height: area.height,
              pointerEvents: sv.focused?.id === area.id ? "none" : "auto",
            }}
          />
        ))}
      </div>

      {sv.hotspots.map(({ link, left, top }) => (
        <button
          key={`${link.to}-${link.x}-${link.y}`}
          type="button"
          aria-label={link.label}
          onClick={() => sv.navigate(link)}
          className="group absolute left-0 top-0 flex flex-col items-center gap-1.5"
          style={{
            transform: `translate3d(${left}px, ${top}px, 0) translate(-50%, -50%)`,
            transition,
          }}
        >
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/90 bg-[#3b2f63]/55 text-white shadow-[0_4px_18px_rgba(40,20,80,0.45)] backdrop-blur-sm transition-transform group-hover:scale-110 group-hover:bg-[#3b2f63]/75">
            <Chevron rotation={link.rotation} />
          </div>
          <div className="relative flex rounded-full bg-white/85 px-2.5 py-0.5 text-xs font-medium text-[#3b2f63] opacity-0 shadow transition-opacity group-hover:opacity-100">
            {link.label}
          </div>
        </button>
      ))}

      {sv.focused?.panel && (
        <DoorPanel
          key={sv.focused.id}
          panel={sv.focused.panel}
          visible={sv.overlayVisible}
          fadeDuration={sv.fadeDuration}
          onComplete={(next) => sv.focused && sv.diveInto(sv.focused, next)}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 flex bg-white"
        style={{
          opacity: sv.fading ? 1 : 0,
          transition: `opacity ${sv.fadeDuration}ms ease`,
        }}
      />

      <div
        className="absolute bottom-6 right-4 flex origin-bottom-right flex-col items-center gap-3"
        style={{
          transform: compact ? "scale(0.6)" : "scale(1)",
          transition: "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <DraggableControl>
          <NavPad onPan={sv.pan} onReset={sv.reset} />
        </DraggableControl>

        <DraggableControl>
          <ZoomKeys
            onZoomIn={sv.zoomIn}
            onZoomOut={sv.zoomOut}
            canZoomIn={sv.canZoomIn}
            canZoomOut={sv.canZoomOut}
          />
        </DraggableControl>
      </div>

      {sv.intro &&
        createPortal(
          <div className="fixed inset-0 z-[68] flex">
            <HelpIntro onDone={sv.finishIntro} />
          </div>,
          document.body,
        )}
    </div>
  );
}
