"use client";

import Image from "next/image";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { DEFAULT_LOCATION, findLocation } from "@/hooks/mapLocations";
import { playClick, playFairies, playSwoosh } from "@/hooks/soundEffects";
import { PANEL_BUTTONS } from "@/hooks/panelButtons";
import { PanelContext } from "@/hooks/panelContext";
import { readProfile, saveProfile } from "@/hooks/localProfile";
import {
  LANG_CHANGE_EVENT,
  PANEL_LANGS,
  PANEL_TEXT,
} from "@/hooks/panelI18n";
import { PANEL_VARIANTS } from "@/hooks/panelLayout";
import { viewHref, viewOfPath } from "@/hooks/panelRoutes";
import {
  PanelButton,
  PanelButtonKind,
  PanelLang,
  PanelView,
  RoomTile,
} from "@/types/panel";
import { useScreenRect } from "@/hooks/useScreenRect";
import { usePanelLayout } from "@/hooks/usePanelLayout";
import { useMusic } from "@/hooks/musicContext";
import FramedGif from "@/modules/FramedGif";
import PanelPlane from "@/modules/PanelPlane";
import RoomViewer from "@/modules/RoomViewer";
import PortalScreen from "@/modules/PortalScreen";
import RosettaCard from "@/modules/RosettaCard";
import RosettaSpeech from "@/modules/RosettaSpeech";
import StreetView from "@/modules/StreetView";
import PanelButtons from "@/modules/PanelButtons";
import PencilCursor from "@/modules/PencilCursor";

const NAV_COUNT = PANEL_BUTTONS.filter((b) => b.kind === "nav").length;

const BACKDROP = { src: "/images/panelfondo.png", width: 1672, height: 941 };
const BUTTERFLIES_SRC = "/images/mariposas.gif";
const BUTTERFLIES_MS = 10000;

const pct = (value: number, total: number): string => `${(value / total) * 100}%`;

const buttonFor = (kind: PanelButtonKind, view: PanelView | null) =>
  PANEL_BUTTONS.find((b) => b.kind === kind && b.view === view)?.id ?? null;

export default function HelpPanel({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ location?: string }>();
  const view = viewOfPath(pathname);
  const [place, setPlace] = useState<string>(DEFAULT_LOCATION);
  const location = findLocation(params.location)?.id ?? place;
  const [seenPath, setSeenPath] = useState<string>(pathname);
  const [selectedNav, setSelectedNav] = useState<string>(
    buttonFor("nav", view) ?? "nav-1",
  );
  const [activeIcon, setActiveIcon] = useState<string | null>(
    buttonFor("icon", view),
  );
  const [lang, setLang] = useState<PanelLang>("en");
  const [roomScene, setRoomScene] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [raised, setRaised] = useState<boolean>(false);
  const [butterflies, setButterflies] = useState<boolean>(false);
  const [speech, setSpeech] = useState<string | null>(null);
  const butterfliesTimer = useRef<number | null>(null);
  const { scrollRef, rootRef, screenRef, rect, measure } = useScreenRect();
  const layout = usePanelLayout();
  const { closePop } = useMusic();
  const t = PANEL_TEXT[lang];

  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setPlace(location);
    setRoomScene(null);
    setExpanded(false);
    setRaised(false);
    setActiveIcon(buttonFor("icon", view));
    setSelectedNav(buttonFor("nav", view) ?? selectedNav);
  }

  useEffect(() => {
    measure();
  }, [layout, view, measure]);

  useEffect(() => {
    PANEL_BUTTONS.forEach((button) => {
      if (button.view) router.prefetch(viewHref(button.view, location));
    });
  }, [router, location]);

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
    void readProfile().then((profile) => {
      if (profile.lang) setLang(profile.lang);
    });
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
    void saveProfile({ lang: next }).then(() =>
      window.dispatchEvent(new Event(LANG_CHANGE_EVENT)),
    );
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

  const selectLocation = (id: string) => {
    setPlace(id);
    if (id !== location) router.push(viewHref("map", id), { scroll: false });
  };

  const showView = (next: PanelView) => {
    router.push(viewHref(next, location), { scroll: false });
    revealScreen();
  };

  const press = (button: PanelButton) => {
    if (button.kind === "nav") {
      playClick(1);
      setSelectedNav(button.id);
      closeRoom();
      if (button.view) showView(button.view);
      return;
    }
    if (button.kind === "icon") {
      playClick(1.15);
      setActiveIcon((current) => (current === button.id ? null : button.id));
      if (button.view) {
        closeRoom();
        closePop();
        showView(button.view);
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
  const portal =
    view === "portals" && !roomScene ? findLocation(location)?.portal : undefined;
  const covered = Boolean(roomScene || portal);
  const passThrough = covered ? "pointer-events-none" : "";
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
        visibility: covered ? "hidden" : "visible",
      }}
    >
      <div className="screen-on absolute inset-0 flex bg-[radial-gradient(ellipse_at_center,#2a2152_0%,#0d0a1c_75%)]" />
      <PanelContext.Provider value={{ t, lang, openRoom, selectLocation }}>
        {children}
      </PanelContext.Provider>
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
        >
          <StreetView
            startId={roomScene}
            embedded
            compact={!expanded}
            lang={lang}
            onEnter={closeRoom}
          />
        </RoomViewer>
      )}
      {portal && rect && (
        <RoomViewer
          key={`portal-${location}`}
          rect={rect}
          expanded={expanded}
          raised={raised}
          onToggle={toggleExpanded}
          onBack={closeRoom}
          onSettled={() => {
            if (!expanded) setRaised(false);
          }}
          t={t}
          tools={false}
        >
          <PortalScreen
            scenes={portal}
            t={t}
            lang={lang}
            expanded={expanded}
            onToggle={toggleExpanded}
            onSpeak={setSpeech}
          />
        </RoomViewer>
      )}
      {portal && expanded && speech && <RosettaCard key={speech} text={speech} />}
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
        <div
          className="online-blink pointer-events-none absolute z-10 flex rounded-full bg-[#10262b]"
          style={{
            left: pct(variant.online.x, image.width),
            top: pct(variant.online.y, image.height),
            width: pct(variant.online.width, image.width),
            height: pct(variant.online.height, image.height),
          }}
        />
        {langButton}
        {speech && (
          <RosettaSpeech
            key={speech}
            text={speech}
            box={variant.speech}
            image={image}
          />
        )}
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
