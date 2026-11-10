"use client";

import Image from "next/image";
import { CSSProperties, ReactNode } from "react";
import { PANEL_TEXT } from "@/hooks/panelI18n";
import { foldCamera, wallOrigins } from "@/hooks/sceneFold";
import { localizedSrc } from "@/hooks/trackArt";
import { PanelLang } from "@/types/panel";
import { Scene, SceneFold, SceneTile, Size, ViewState } from "@/types/scene";
import LiftPanel from "@/modules/LiftPanel";

const SKIRT = 320;

function WallImage({
  tile,
  lang,
  style,
}: {
  tile: SceneTile;
  lang: PanelLang;
  style: CSSProperties;
}) {
  return (
    <Image
      src={localizedSrc(tile, lang) ?? tile.src}
      alt=""
      width={Math.round(tile.width)}
      height={Math.round(tile.height)}
      unoptimized
      loading="eager"
      fetchPriority="high"
      draggable={false}
      className="pointer-events-none absolute flex max-w-none"
      style={{
        left: -(tile.cropLeft ?? 0),
        width: tile.width,
        height: tile.height,
        ...style,
      }}
    />
  );
}

function Wall({
  tile,
  lang,
  width,
  transform,
  children,
}: {
  tile: SceneTile;
  lang: PanelLang;
  width: number;
  transform: string;
  children?: ReactNode;
}) {
  return (
    <div
      className="absolute left-0 flex origin-top-left overflow-hidden"
      style={{
        top: tile.y - SKIRT,
        width,
        height: tile.height + SKIRT * 2,
        transform,
      }}
    >
      <WallImage
        tile={tile}
        lang={lang}
        style={{ top: SKIRT - tile.height, transform: "scaleY(-1)" }}
      />
      <WallImage tile={tile} lang={lang} style={{ top: SKIRT }} />
      <WallImage
        tile={tile}
        lang={lang}
        style={{ top: SKIRT + tile.height, transform: "scaleY(-1)" }}
      />
      {children}
    </div>
  );
}

export default function SceneCorner({
  scene,
  fold,
  lang,
  view,
  scale,
  size,
  transition,
  ready,
}: {
  scene: Scene;
  fold: SceneFold;
  lang: PanelLang;
  view: ViewState;
  scale: number;
  size: Size;
  transition: string;
  ready: boolean;
}) {
  const safeScale = scale || 1;
  const centerX = (size.width / 2 - view.x) / safeScale;
  const centerY = (size.height / 2 - view.y) / safeScale;
  const camera = foldCamera(fold, centerX);
  const focal = fold.depth * safeScale;
  const origins = wallOrigins(fold);

  return (
    <div
      className="absolute inset-0 flex overflow-hidden"
      style={{ perspective: focal, opacity: ready ? 1 : 0 }}
    >
      <div
        className="absolute left-1/2 top-1/2 flex h-0 w-0 will-change-transform"
        style={{
          transformStyle: "preserve-3d",
          transform: `translateZ(${focal}px) rotateY(${camera.yaw}deg) scale3d(${safeScale}, ${safeScale}, ${safeScale}) translate3d(${-camera.x}px, ${-centerY}px, ${-camera.z}px)`,
          transition,
        }}
      >
        {scene.tiles.map((tile, i) => {
          const start = fold.seams[i - 1] ?? 0;
          const end = fold.seams[i] ?? scene.width;
          const [x, z] = origins[i];
          return (
            <Wall
              key={`${tile.src}-${i}`}
              tile={tile}
              lang={lang}
              width={end - start}
              transform={`translate3d(${x}px, 0, ${z}px) rotateY(${i * -90}deg)`}
            >
              {scene.lifts
                ?.filter((lift) => lift.wall === i)
                .map((lift) => (
                  <LiftPanel
                    key={lift.id}
                    lift={lift}
                    offsetX={tile.cropLeft ?? 0}
                    offsetY={SKIRT}
                    label={PANEL_TEXT[lang].roomElevator}
                  />
                ))}
            </Wall>
          );
        })}
      </div>
    </div>
  );
}
