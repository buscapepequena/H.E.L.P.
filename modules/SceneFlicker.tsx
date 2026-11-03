import Image from "next/image";
import { SceneLight } from "@/types/scene";

const FEATHER =
  "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%), linear-gradient(180deg, transparent 0%, #000 8%, #000 90%, transparent 100%)";

export default function SceneFlicker({ light }: { light: SceneLight }) {
  return (
    <div
      className="light-flicker pointer-events-none absolute flex"
      style={{
        left: light.x,
        top: light.y,
        width: light.width,
        height: light.height,
        maskImage: FEATHER,
        WebkitMaskImage: FEATHER,
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
      }}
    >
      <Image
        src={light.image}
        alt=""
        width={Math.round(light.width)}
        height={Math.round(light.height)}
        unoptimized
        loading="eager"
        draggable={false}
        className="relative flex h-full w-full"
      />
    </div>
  );
}
