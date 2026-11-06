"use client";

import Image from "next/image";
import { CSSProperties } from "react";
import { foldCamera, wallOrigins } from "@/hooks/sceneFold";
import { Scene, SceneFold, SceneTile, Size, ViewState } from "@/types/scene";

const SKIRT = 320;

function WallImage({ tile, style }: { tile: SceneTile; style: CSSProperties }) {
  return (
    <Image
      src={tile.src}
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
  width,
  transform,
}: {
  tile: SceneTile;
  width: number;
  transform: string;
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
        style={{ top: SKIRT - tile.height, transform: "scaleY(-1)" }}
      />
      <WallImage tile={tile} style={{ top: SKIRT }} />
      <WallImage
        tile={tile}
        style={{ top: SKIRT + tile.height, transform: "scaleY(-1)" }}
      />
    </div>
  );
}

export default function SceneCorner({
  scene,
  fold,
  view,
  scale,
  size,
  transition,
  ready,
}: {
  scene: Scene;
  fold: SceneFold;
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
              key={tile.src}
              tile={tile}
              width={end - start}
              transform={`translate3d(${x}px, 0, ${z}px) rotateY(${i * -90}deg)`}
            />
          );
        })}
      </div>
    </div>
  );
}
