"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { readProfile, saveProfile } from "@/hooks/localProfile";
import { useMusic } from "@/hooks/musicContext";
import { portalPlace } from "@/hooks/portalPlace";
import { PORTAL_FONT, PORTAL_INK, PORTAL_PINK } from "@/hooks/portalStyle";
import { canAdvanceRain, isFalling } from "@/hooks/pixelRain";
import { playGlimmer, playPsychic } from "@/hooks/psychicSound";
import { localizedSrc } from "@/hooks/trackArt";
import { useStreetView } from "@/hooks/useStreetView";
import { PanelDictionary, PanelLang } from "@/types/panel";
import { RainControl, RainPhase } from "@/types/rain";
import { Scene } from "@/types/scene";
import PixelRain from "@/modules/PixelRain";
import PortalLine from "@/modules/PortalLine";
import { LETTER_MS } from "@/modules/RosettaLine";
import PortalNav from "@/modules/PortalNav";
import PortalPlaque from "@/modules/PortalPlaque";

const GLIMMER_MS = 1600;
const BACK_MS = 1100;
const DIALOGUE_SONG = "songWhoAreYou";
const DIALOGUE_AMBIENT = "songWhoAreYouAmbient";
const MELODY_CUE = "psychicPuzzled";
const MELODY_FADE_MS = 14000;
const FALL_SONG = "songWeightless";
const FALL_FADE_MS = 5000;
const QUIET_PHASES: RainPhase[] = ["forming", "rising", "standing", "asking", "returning"];
const AMBIENT_FADE_MS = 6000;

const DUST = [
  { radius: 1.6, size: 0.22, spin: 7, phase: 0, reverse: false },
  { radius: 2.3, size: 0.16, spin: 11, phase: 0.3, reverse: true },
  { radius: 1.9, size: 0.2, spin: 9, phase: 0.55, reverse: false },
  { radius: 2.8, size: 0.14, spin: 14, phase: 0.15, reverse: false },
  { radius: 1.4, size: 0.18, spin: 6, phase: 0.8, reverse: true },
  { radius: 2.5, size: 0.12, spin: 12, phase: 0.45, reverse: true },
  { radius: 3.2, size: 0.1, spin: 17, phase: 0.7, reverse: false },
];

export default function PortalScreen({
  scenes,
  t,
  lang,
  expanded,
  onToggle,
  onSpeak,
}: {
  scenes: Scene[];
  t: PanelDictionary;
  lang: PanelLang;
  expanded: boolean;
  onToggle: () => void;
  onSpeak: (text: string | null) => void;
}) {
  const sv = useStreetView(scenes, scenes[0].id);
  const music = useMusic();
  const parent = sv.scene.parent;
  const [trail, setTrail] = useState<{ sceneId: string; step: number }>({
    sceneId: "",
    step: 0,
  });
  const step = trail.sceneId === sv.scene.id ? trail.step : 0;
  if (step > 0 && sv.view.zoom <= 1.02) {
    setTrail({ sceneId: "", step: 0 });
  }
  const glimmers = sv.scene.glimmers ?? [];
  const glimmer = glimmers[step];
  const pixel = 1 / (sv.scale || 1);
  const glow = (glimmer?.size ?? 0) * pixel;
  const lines = sv.scene.dialogue ?? [];
  const talk = glimmers.length ? step - glimmers.length : -1;
  const line = talk >= 0 ? lines[talk] : undefined;
  const spoken = line?.speaker === "rosetta" ? t[line.key] : null;
  const rainRef = useRef<RainControl | null>(null);
  const [rainPhase, setRainPhase] = useState<RainPhase>("forming");
  const [rainSays, setRainSays] = useState<"rainStay" | "rainGo" | null>(null);
  const reply =
    rainSays && !QUIET_PHASES.includes(rainPhase) ? t[rainSays] : null;
  const speech = reply ?? spoken;
  const neonDelay = talk ? 0 : GLIMMER_MS;
  const dotDelay = spoken
    ? Array.from(spoken).length * LETTER_MS + 600
    : neonDelay + 1900;

  useEffect(() => {
    onSpeak(speech);
  }, [speech, onSpeak]);

  useEffect(() => () => onSpeak(null), [onSpeak]);

  const musicRef = useRef(music);
  const inDialogue = Boolean(line);

  useEffect(() => {
    musicRef.current = music;
  });

  const melodyAt = lines.findIndex((l) => l.key === MELODY_CUE);
  const melodic = melodyAt >= 0 && talk >= melodyAt;

  const falling = isFalling(rainPhase);

  useEffect(() => {
    if (!inDialogue) return;
    if (falling) {
      musicRef.current.crossfadeTo(FALL_SONG, FALL_FADE_MS);
      return;
    }
    musicRef.current.crossfadeTo(
      melodic ? DIALOGUE_SONG : DIALOGUE_AMBIENT,
      melodic ? MELODY_FADE_MS : AMBIENT_FADE_MS,
    );
  }, [inDialogue, melodic, falling]);

  useEffect(() => {
    if (!inDialogue) return;
    return () => {
      musicRef.current.pauseTrack(DIALOGUE_SONG);
      musicRef.current.pauseTrack(DIALOGUE_AMBIENT);
      musicRef.current.pauseTrack(FALL_SONG);
    };
  }, [inDialogue]);

  const restored = useRef<boolean>(false);
  const { ready, jumpTo } = sv;

  useEffect(() => {
    if (!ready || restored.current) return;
    void readProfile().then((profile) => {
      const saved = profile.portal;
      const target = scenes.find((scene) => scene.id === saved?.sceneId);
      if (saved && target) {
        const place = portalPlace(target, saved.step);
        jumpTo(target.id, place.zoom, place.x, place.y);
        setTrail({ sceneId: target.id, step: saved.step });
      }
      restored.current = true;
    });
  }, [ready, jumpTo, scenes]);

  useEffect(() => {
    if (!restored.current) return;
    void saveProfile({ portal: { sceneId: sv.scene.id, step } });
  }, [sv.scene.id, step]);

  const follow = () => {
    const place = portalPlace(sv.scene, step + 1);
    playGlimmer(step);
    setTrail({ sceneId: sv.scene.id, step: step + 1 });
    sv.lookAt(place.zoom, place.x, place.y, GLIMMER_MS);
  };

  const recenter = () => {
    if (!step) {
      sv.reset();
      return;
    }
    const place = portalPlace(sv.scene, step);
    sv.lookAt(place.zoom, place.x, place.y, BACK_MS);
  };

  const back = () => {
    setRainSays(null);
    if (rainRef.current?.back()) return;
    if (step > 0) {
      const previous = step - 1;
      setTrail({ sceneId: sv.scene.id, step: previous });
      if (previous >= glimmers.length) return;
      const place = portalPlace(sv.scene, previous);
      sv.lookAt(place.zoom, place.x, place.y, BACK_MS);
      return;
    }
    if (!parent) return;
    setTrail({ sceneId: "", step: 0 });
    sv.retreat(parent);
  };

  return (
    <div
      ref={sv.containerRef}
      className="absolute inset-0 flex touch-none select-none overflow-clip"
      style={{
        background: PORTAL_INK,
        cursor: sv.dragging ? "grabbing" : "grab",
        fontFamily: PORTAL_FONT,
      }}
      onPointerDown={sv.onPointerDown}
      onPointerMove={sv.onPointerMove}
      onPointerUp={sv.onPointerUp}
      onPointerCancel={sv.onPointerUp}
      onDoubleClick={sv.onDoubleClick}
    >
      <div
        className="absolute left-0 top-0 flex origin-top-left will-change-transform"
        style={{
          width: sv.scene.width,
          height: sv.scene.height,
          transform: `translate3d(${sv.view.x}px, ${sv.view.y}px, 0) scale(${sv.scale})`,
          transition: sv.transition,
          opacity: sv.ready ? 1 : 0,
        }}
      >
        {sv.scene.tiles.map((tile) => (
          <Image
            key={`${sv.scene.id}-${tile.src}`}
            src={localizedSrc(tile, lang) ?? tile.src}
            alt={sv.scene.title}
            width={tile.width}
            height={tile.height}
            unoptimized
            loading="eager"
            fetchPriority="high"
            draggable={false}
            className="pointer-events-none absolute flex max-w-none"
            style={{
              left: tile.x,
              top: tile.y,
              width: tile.width,
              height: tile.height,
            }}
          />
        ))}
        {glimmer && (
          <button
            key={`${sv.scene.id}-glimmer-${step}`}
            type="button"
            aria-label={t.portalLight}
            onClick={follow}
            className="absolute flex cursor-pointer items-center justify-center rounded-full"
            style={{
              left: glimmer.x * sv.scene.width - 14 * pixel - glow,
              top: glimmer.y * sv.scene.height - 14 * pixel - glow,
              width: 28 * pixel + glow * 2,
              height: 28 * pixel + glow * 2,
            }}
          >
            <span
              className="portal-glimmer relative flex"
              style={{
                width: glow,
                height: glow,
                animationDelay: step ? `${GLIMMER_MS}ms` : "0ms",
              }}
            >
              <span
                className="absolute inset-0 flex rounded-full"
                style={{
                  background: PORTAL_PINK,
                  boxShadow: `0 0 ${glow * 0.9}px ${glow * 0.3}px ${PORTAL_PINK}, 0 0 ${glow * 2.6}px ${glow * 0.85}px rgba(248, 128, 136, 0.45)`,
                }}
              />
              {DUST.map((mote, i) => (
                <span
                  key={i}
                  className="portal-orbit absolute left-1/2 top-1/2 flex h-0 w-0"
                  style={{
                    animationDuration: `${mote.spin}s`,
                    animationDirection: mote.reverse ? "reverse" : "normal",
                    animationDelay: `${-mote.spin * mote.phase}s`,
                  }}
                >
                  <span
                    className="portal-twinkle absolute flex rounded-full"
                    style={{
                      left: glow * mote.radius,
                      top: 0,
                      width: Math.max(glow * mote.size, pixel * 0.8),
                      height: Math.max(glow * mote.size, pixel * 0.8),
                      background: PORTAL_PINK,
                      boxShadow: `0 0 ${glow * 0.35}px ${PORTAL_PINK}`,
                      animationDelay: `${mote.phase * 2}s`,
                    }}
                  />
                </span>
              ))}
            </span>
          </button>
        )}
      </div>

      <div className="portal-shadow pointer-events-none absolute inset-[-12%] flex bg-[radial-gradient(ellipse_at_50%_50%,transparent_48%,rgba(8,2,4,0.55)_100%)] mix-blend-multiply" />

      {line && talk === lines.length - 1 && (
        <PixelRain
          key={`${sv.scene.id}-rain`}
          delay={dotDelay}
          question={t.rainContinue}
          yes={t.rainYes}
          no={t.rainNo}
          controlRef={rainRef}
          onPhase={setRainPhase}
          onChoice={(yes) => setRainSays(yes ? "rainGo" : "rainStay")}
        />
      )}

      {line && (
        <PortalLine
          key={`${sv.scene.id}-line-${talk}`}
          text={line.speaker === "sign" ? t[line.key] : ""}
          label={t.portalNext}
          delay={neonDelay}
          dotDelay={dotDelay}
          onNext={
            talk < lines.length - 1
              ? () => setTrail({ sceneId: sv.scene.id, step: step + 1 })
              : canAdvanceRain(rainPhase)
                ? () => rainRef.current?.advance()
                : undefined
          }
          aside={talk === lines.length - 1}
        />
      )}

      {sv.hotspots.map(({ link, left, top }) => (
        <button
          key={`${sv.scene.id}-${link.to}`}
          type="button"
          aria-label={link.labelKey ? t[link.labelKey] : link.label}
          onClick={() => {
            playPsychic();
            sv.navigate(link);
          }}
          className="group absolute left-0 top-0 flex cursor-pointer flex-col items-center"
          style={{
            transform: `translate3d(${left}px, ${top}px, 0) translate(-50%, calc(-100% + 2.6cqh))`,
            transition: sv.transition,
            opacity: sv.fading ? 0 : 1,
          }}
        >
          <div className="relative flex h-[1.8cqh] w-[1.8cqh] rotate-45 rounded-[0.3cqh] border-[0.35cqh] border-[#f88088] bg-[#120607]" />
          <PortalPlaque
            ratio={3.4}
            className="h-[7cqh] transition-[transform,filter] duration-200 group-hover:scale-[1.06] group-hover:drop-shadow-[0_0_1.2cqh_rgba(248,128,136,0.9)]"
          >
            <span
              className="relative flex whitespace-nowrap text-[3cqh] font-bold uppercase leading-none tracking-[0.08em]"
              style={{ color: PORTAL_PINK }}
            >
              {link.labelKey ? t[link.labelKey] : link.label}
            </span>
          </PortalPlaque>
          <div
            className="relative flex h-[5cqh] w-[0.7cqh] border-x-[0.2cqh]"
            style={{ background: PORTAL_PINK, borderColor: PORTAL_INK }}
          />
          <div className="relative flex h-[5.2cqh] w-[5.2cqh] items-center justify-center">
            <div className="portal-beacon absolute inset-0 flex rounded-full border-[0.35cqh] border-dashed border-[#f88088]" />
            <div
              className="relative flex h-[2.4cqh] w-[2.4cqh] rounded-full border-[0.35cqh]"
              style={{ background: PORTAL_PINK, borderColor: PORTAL_INK }}
            />
          </div>
        </button>
      ))}

      {(parent || step > 0) && (
        <button
          type="button"
          aria-label={t.portalBack}
          onClick={back}
          className="absolute bottom-[2.4cqh] left-[2.4cqh] flex cursor-pointer transition-[transform,filter] duration-150 hover:drop-shadow-[0_0_1.2cqh_rgba(248,128,136,0.9)] active:scale-[0.94]"
        >
          <PortalPlaque ratio={4.4} className="h-[6.4cqh]">
            <span
              className="relative flex flex-row items-center gap-[1cqh] whitespace-nowrap text-[2.7cqh] font-bold uppercase leading-none tracking-[0.08em]"
              style={{ color: PORTAL_PINK }}
            >
              <svg viewBox="0 0 24 24" className="relative flex h-[1em] w-[1em]">
                <path
                  d="M3 12 L13 4 V9 H21 V15 H13 V20 Z"
                  fill={PORTAL_PINK}
                  stroke={PORTAL_INK}
                  strokeWidth={1}
                  strokeLinejoin="round"
                />
              </svg>
              {t.portalBack}
            </span>
          </PortalPlaque>
        </button>
      )}

      <button
        type="button"
        aria-label={expanded ? t.roomCollapse : t.roomExpand}
        onClick={onToggle}
        className="absolute right-[2.4cqh] top-[2.4cqh] flex cursor-pointer transition-[transform,filter] duration-150 hover:drop-shadow-[0_0_1.2cqh_rgba(248,128,136,0.9)] active:scale-[0.94]"
      >
        <PortalPlaque ratio={4.2} className="h-[6.4cqh]">
          <span
            className="relative flex flex-row items-center gap-[1cqh] whitespace-nowrap text-[2.7cqh] font-bold uppercase leading-none tracking-[0.08em]"
            style={{ color: PORTAL_PINK }}
          >
            <svg
              viewBox="0 0 24 24"
              className="relative flex h-[0.7em] w-[0.7em]"
              fill="none"
              stroke={PORTAL_PINK}
              strokeWidth={2.6}
              strokeLinecap="square"
            >
              {expanded ? (
                <path d="M9 3 V9 H3 M15 3 V9 H21 M9 21 V15 H3 M15 21 V15 H21" />
              ) : (
                <path d="M3 9 V3 H9 M21 9 V3 H15 M3 15 V21 H9 M21 15 V21 H15" />
              )}
            </svg>
            {expanded ? t.roomCollapse : t.roomExpand}
          </span>
        </PortalPlaque>
      </button>

      <div className="absolute bottom-[2.4cqh] right-[2.4cqh] flex">
        <PortalNav
          t={t}
          onPan={sv.pan}
          onReset={recenter}
          onZoomIn={sv.zoomIn}
          onZoomOut={sv.zoomOut}
          canZoomIn={sv.canZoomIn}
          canZoomOut={sv.canZoomOut}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 flex"
        style={{
          background: PORTAL_INK,
          opacity: sv.fading ? 1 : 0,
          transition: `opacity ${sv.fadeDuration}ms ease`,
        }}
      />
    </div>
  );
}
