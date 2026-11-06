"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { playClick, playFairies, playSwoosh } from "@/hooks/soundEffects";
import { PANEL_BUTTONS, VIEW_SCREENS } from "@/hooks/panelButtons";
import {
  LANG_CHANGE_EVENT,
  LANG_STORAGE_KEY,
  PANEL_LANGS,
  PANEL_TEXT,
} from "@/hooks/panelI18n";
import { PANEL_VARIANTS } from "@/hooks/panelLayout";
import { PanelButton, PanelLang, PanelView, RoomTile } from "@/types/panel";
import { useScreenRect } from "@/hooks/useScreenRect";
import { usePanelLayout } from "@/hooks/usePanelLayout";
import { useMusic } from "@/hooks/musicContext";
import FramedGif from "@/modules/FramedGif";
import PanelPlane from "@/modules/PanelPlane";
import RoomsGrid from "@/modules/RoomsGrid";
import RoomViewer from "@/modules/RoomViewer";
import PanelButtons from "@/modules/PanelButtons";
import MapScreen from "@/modules/MapScreen";
import MapView from "@/modules/MapView";
import Mp3Player from "@/modules/Mp3Player";
import PencilCursor from "@/modules/PencilCursor";

const NAV_COUNT = PANEL_BUTTONS.filter((b) => b.kind === "nav").length;

const BACKDROP = { src: "/images/panelfondo.png", width: 1672, height: 941 };
const BUTTERFLIES_SRC = "/images/mariposas.gif";
const BUTTERFLIES_MS = 10000;

const pct = (value: number, total: number): string => `${(value / total) * 100}%`;

export default function HelpPanel() {
  const [selectedNav, setSelectedNav] = useState<string>("nav-1");
  const [activeIcon, setActiveIcon] = useState<string | null>(null);
  const [view, setView] = useState<PanelView | null>(null);
  const [swaps, setSwaps] = useState<number>(0);
  const [lang, setLang] = useState<PanelLang>("en");
  const [roomScene, setRoomScene] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [raised, setRaised] = useState<boolean>(false);
  const [butterflies, setButterflies] = useState<boolean>(false);
  const butterfliesTimer = useRef<number | null>(null);
  const { scrollRef, rootRef, screenRef, rect, measure } = useScreenRect();
  const layout = usePanelLayout();
  const { popped, closePop } = useMusic();
  const t = PANEL_TEXT[lang];

  useEffect(() => {
    measure();
  }, [layout, measure]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  useEffect(() => {
    playSwoosh(0.45);
    void document.fonts?.load("16px PixelMplus10");
    void document.fonts?.load("bold 16px PixelMplus10");
    void document.fonts?.load("16px PixelMplus12");
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    } catch {
      stored = null;
    }
    if (stored && PANEL_LANGS.includes(stored as PanelLang)) {
      const saved = stored as PanelLang;
      window.setTimeout(() => setLang(saved), 0);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const img = new window.Image();
    img.src = BUTTERFLIES_SRC;
    return () => {
      if (butterfliesTimer.current !== null) {
        window.clearTimeout(butterfliesTimer.current);
      }
    };
  }, []);

  const releaseButterflies = () => {
    if (butterflies) return;
    playClick(1.2);
    playFairies(BUTTERFLIES_MS / 1000);
    setButterflies(true);
    butterfliesTimer.current = window.setTimeout(() => {
      butterfliesTimer.current = null;
      setButterflies(false);
    }, BUTTERFLIES_MS);
  };

  const switchLang = () => {
    const next = PANEL_LANGS[(PANEL_LANGS.indexOf(lang) + 1) % PANEL_LANGS.length];
    setLang(next);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      return;
    }
    window.dispatchEvent(new Event(LANG_CHANGE_EVENT));
  };

  const openRoom = (room: RoomTile) => {
    playClick(room.sceneId ? 1.2 : 0.7);
    if (!room.sceneId) return;
    measure();
    setRoomScene(room.sceneId);
  };

  const closeRoom = () => {
    setRoomScene(null);
    setExpanded(false);
    setRaised(false);
  };

  const toggleExpanded = () => {
    playClick(expanded ? 0.9 : 1.1);
    if (expanded) {
      setExpanded(false);
      return;
    }
    measure();
    setExpanded(true);
    setRaised(true);
  };

  const revealScreen = () => {
    const scroller = scrollRef.current;
    const screen = screenRef.current;
    if (!scroller || !screen) return;
    if (layout !== "mobile" && layout !== "tablet") return;
    const offset =
      screen.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    scroller.scrollTo({ top: scroller.scrollTop + offset - 16 });
  };

  const press = (button: PanelButton) => {
    if (button.kind === "nav") {
      playClick(1);
      setSelectedNav(button.id);
      closeRoom();
      if (button.view) {
        setView(button.view);
        setSwaps((n) => n + 1);
        revealScreen();
      }
      return;
    }
    if (button.kind === "icon") {
      playClick(1.15);
      setActiveIcon((current) => (current === button.id ? null : button.id));
      if (button.view) {
        closeRoom();
        closePop();
        setView(button.view);
        setSwaps((n) => n + 1);
        revealScreen();
      }
      return;
    }
    if (button.id === "prev" || button.id === "next") {
      playClick(button.id === "prev" ? 0.9 : 1.1);
      const index = Math.max(0, Number(selectedNav.split("-")[1]) - 1);
      const step = button.id === "prev" ? -1 : 1;
      setSelectedNav(`nav-${((index + step + NAV_COUNT) % NAV_COUNT) + 1}`);
      return;
    }
    if (button.id === "lang") {
      playClick(1.3);
      switchLang();
      return;
    }
    playClick(0.8);
  };

  const stacked = layout === "mobile" || layout === "tablet";
  const passThrough = roomScene ? "pointer-events-none" : "";
  const variant = PANEL_VARIANTS[layout];
  const { image, hole } = variant;
  const ratio = image.width / image.height;
  const planeWidth =
    layout === "desktop"
      ? `min(86vw, calc(78vh * ${ratio}))`
      : `min(96vw, calc(94vh * ${ratio}))`;

  const screenLayer = (
    <div
      ref={screenRef}
      className="pointer-events-auto absolute flex overflow-hidden bg-[#0d0a1c]"
      style={{
        left: pct(hole.x, image.width),
        top: pct(hole.y, image.height),
        width: pct(hole.width, image.width),
        height: pct(hole.height, image.height),
        visibility: roomScene ? "hidden" : "visible",
      }}
    >
      <div className="screen-on absolute inset-0 flex bg-[radial-gradient(ellipse_at_center,#2a2152_0%,#0d0a1c_75%)]" />
      {view === "music" && !popped && (
        <Mp3Player key={`music-${swaps}`} t={t} />
      )}
      {view && view !== "music" && (
        <MapScreen
          key={`${view}-${swaps}`}
          title={t[VIEW_SCREENS[view].titleKey]}
          subtitle={VIEW_SCREENS[view].subtitle}
        >
          {view === "rooms" && <RoomsGrid onOpen={openRoom} t={t} />}
          {view === "map" && <MapView homeLabel={t.mapHome} />}
        </MapScreen>
      )}
      <div className="pointer-events-none absolute inset-0 flex bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.035)_0px,rgba(255,255,255,0.035)_1px,transparent_1px,transparent_3px)]" />
    </div>
  );

  const langButton = (
    <button
      type="button"
      aria-label={t.language}
      onClick={() => {
        playClick(1.3);
        switchLang();
      }}
      className="pixel-crisp pointer-events-auto absolute z-10 flex items-center pl-[1.5%] font-pixel12 uppercase leading-none tracking-[0.06em] text-[#9df59a] transition-transform duration-100 active:scale-[0.98]"
      style={{
        left: pct(variant.lang.x, image.width),
        top: pct(variant.lang.y, image.height),
        width: pct(variant.lang.width, image.width),
        height: pct(variant.lang.height, image.height),
        fontSize: `${(variant.langUnits / image.height) * 100}cqh`,
        textShadow: "0 0 6px rgba(157,245,154,0.6)",
      }}
    >
      {t.langStatus}
    </button>
  );

  return (
    <div
      ref={scrollRef}
      className={`screen-scroll intro-fade-in relative flex h-dvh w-full cursor-none bg-[#c9a6ec] [&_*]:!cursor-none ${
        stacked && !expanded
          ? "overflow-y-auto overflow-x-hidden"
          : "overflow-hidden"
      }`}
    >
      <PencilCursor />
      {butterflies && (
        <Image
          src={BUTTERFLIES_SRC}
          alt=""
          width={362}
          height={362}
          unoptimized
          loading="eager"
          draggable={false}
          className="butterfly-flood pointer-events-none fixed inset-0 z-[65] flex h-full w-full select-none object-cover [image-rendering:pixelated]"
        />
      )}
      <Image
        src={BACKDROP.src}
        alt=""
        width={BACKDROP.width}
        height={BACKDROP.height}
        unoptimized
        loading="eager"
        draggable={false}
        className={`pointer-events-none fixed inset-0 flex h-full w-full select-none ${
          layout === "desktop" ? "" : "object-cover"
        }`}
      />
      <div
        ref={rootRef}
        className={`relative flex w-full ${
          stacked ? "h-max flex-col" : "h-full items-center justify-center"
        }`}
      >
      {roomScene && rect && (
        <RoomViewer
          key={roomScene}
          sceneId={roomScene}
          rect={rect}
          expanded={expanded}
          raised={raised}
          onToggle={toggleExpanded}
          onBack={() => {
            playClick(0.9);
            closeRoom();
          }}
          onSettled={() => {
            if (!expanded) setRaised(false);
          }}
          t={t}
        />
      )}
      <PanelPlane
        image={image}
        punch={variant.punch}
        className={`${stacked ? "w-full shrink-0" : "panel-in rounded-[0.9%]"} ${passThrough}`}
        style={stacked ? undefined : { width: planeWidth }}
        behind={
          <>
            {screenLayer}
            <FramedGif frame={image} box={variant.avatar} />
          </>
        }
      >
        {langButton}
        <button
          type="button"
          aria-label="Rosetta"
          onClick={releaseButterflies}
          className="pointer-events-auto absolute z-10 flex"
          style={{
            left: pct(variant.avatar.x, image.width),
            top: pct(variant.avatar.y, image.height),
            width: pct(variant.avatar.width, image.width),
            height: pct(variant.avatar.height, image.height),
          }}
        />
        <PanelButtons
          selectedNav={selectedNav}
          activeIcon={activeIcon}
          onPress={press}
          t={t}
          panelWidth={image.width}
          panelHeight={image.height}
          buttons={variant.buttons}
          iconUnits={variant.iconUnits}
          textUnits={variant.textUnits}
        />
      </PanelPlane>
      </div>
    </div>
  );
}
