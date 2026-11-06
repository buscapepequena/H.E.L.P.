"use client";

import Image from "next/image";
import { useState } from "react";
import { MapLocation } from "@/types/map";

export default function MapLocationButton({
  place,
  label,
  onPress,
}: {
  place: MapLocation;
  label: string;
  onPress: () => void;
}) {
  const [hasImage, setHasImage] = useState<boolean>(true);
  const half = place.size / 2;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onPress}
      className="absolute flex items-center justify-center transition-transform duration-100 active:scale-95"
      style={{
        left: place.x - half,
        top: place.y - half,
        width: place.size,
        height: place.size,
      }}
    >
      {hasImage ? (
        <Image
          src={place.src}
          alt=""
          width={place.size}
          height={place.size}
          unoptimized
          draggable={false}
          onError={() => setHasImage(false)}
          className="pointer-events-none relative flex h-full w-full object-contain"
        />
      ) : (
        <div className="relative flex h-[42%] w-[42%] rounded-full bg-[#ffd7ec] shadow-[0_0_26px_10px_rgba(247,143,196,0.75)]" />
      )}
    </button>
  );
}
