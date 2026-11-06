"use client";

import Image from "next/image";
import { CSSProperties, PointerEvent, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMusic } from "@/hooks/musicContext";
import { CHARMS, FRAME_CHARMS } from "@/hooks/panelCharms";
import { trackArt } from "@/hooks/trackArt";
import { CharmDrop, PanelLang } from "@/types/panel";

const LACE = "#ffb3c9";
const LINE = "#ff6f86";
const SPILL = 15;
const MAX_DROPS = 75;
const STEPS = Array.from({ length: 19 }, (_, i) => 5 + i * 5);
const SCALLOPS = STEPS.flatMap((p) => [
  [p, 3],
  [p, 97],
  [3, p],
  [97, p],
]);

export default function TrackArt({ lang }: { lang: PanelLang }) {
  const { track } = useMusic();
  const art = trackArt(track?.image, lang);
  const [drops, setDrops] = useState<CharmDrop[]>([]);
  const nextDrop = useRef<number>(0);

  const spill = (event: PointerEvent<HTMLDivElement>) => {
    const { clientX: x, clientY: y } = event;
    const fresh = Array.from({ length: SPILL }, (_, i) => ({
      id: nextDrop.current++,
      charm: CHARMS[i % CHARMS.length],
      x,
      y,
      size: 22 + Math.random() * 28,
      dx: (Math.random() - 0.5) * 520,
      rise: 40 + Math.random() * 110,
      fall: window.innerHeight - y + 90 + Math.random() * 60,
      spin: (Math.random() - 0.5) * 720,
      seconds: 1.5 + Math.random() * 1.2,
      delay: Math.random() * 0.25,
    }));
    setDrops((current) => [...current, ...fresh].slice(-MAX_DROPS));
  };

  return (
    <>
      <div
        key={track?.titleKey}
        onPointerDown={spill}
        className="screen-swap absolute inset-0 flex items-center justify-center bg-[url('/images/bosque.png')] bg-cover bg-center"
      >
        <div className="absolute inset-0 flex bg-[#0b0508]/70" />
        {art && (
          <div className="relative flex aspect-square h-[80%] drop-shadow-[0_0.6cqh_1.6cqh_rgba(0,0,0,0.7)]">
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 flex h-full w-full"
            >
              {SCALLOPS.map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r={2.7} fill={LACE} />
              ))}
              <rect x={3} y={3} width={94} height={94} fill={LACE} />
              <rect x={4.6} y={4.6} width={90.8} height={90.8} fill="#0b0508" />
              <rect
                x={5.8}
                y={5.8}
                width={88.4}
                height={88.4}
                fill="none"
                stroke={LINE}
                strokeWidth={0.45}
              />
            </svg>
            <Image
              src={art.src}
              alt=""
              width={art.width}
              height={art.height}
              unoptimized
              loading="eager"
              draggable={false}
              className="pointer-events-none absolute inset-[10%] flex h-[80%] w-[80%] select-none object-cover"
            />
            {FRAME_CHARMS.map(({ charm, x, y }) => (
              <Image
                key={`${x}-${y}`}
                src={charm.src}
                alt=""
                width={charm.width}
                height={charm.height}
                unoptimized
                loading="eager"
                draggable={false}
                className="pointer-events-none absolute flex h-auto w-[12%] -translate-x-1/2 -translate-y-1/2 select-none"
                style={{ left: `${x}%`, top: `${y}%` }}
              />
            ))}
          </div>
        )}
      </div>
      {drops.length > 0 &&
        createPortal(
          <div className="pointer-events-none fixed inset-0 z-[65] flex overflow-hidden">
            {drops.map((drop) => (
              <Image
                key={drop.id}
                src={drop.charm.src}
                alt=""
                width={drop.charm.width}
                height={drop.charm.height}
                unoptimized
                loading="eager"
                draggable={false}
                onAnimationEnd={() =>
                  setDrops((current) =>
                    current.filter((item) => item.id !== drop.id),
                  )
                }
                className="charm-drop absolute flex h-auto select-none"
                style={
                  {
                    left: drop.x,
                    top: drop.y,
                    width: drop.size,
                    "--dx": `${drop.dx}px`,
                    "--rise": `${drop.rise}px`,
                    "--fall": `${drop.fall}px`,
                    "--spin": `${drop.spin}deg`,
                    animationDuration: `${drop.seconds}s`,
                    animationDelay: `${drop.delay}s`,
                  } as CSSProperties
                }
              />
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
