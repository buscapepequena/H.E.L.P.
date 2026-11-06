import { renderDawnSong } from "@/hooks/dawnSong";
import { renderDepartureSong } from "@/hooks/departureSong";
import { renderDepthsSong } from "@/hooks/depthsSong";
import { renderHerSong } from "@/hooks/herSong";
import { renderJourneyLongSong } from "@/hooks/journeyLongSong";
import { renderJourneySong } from "@/hooks/journeySong";
import {
  renderMirrorsChamber,
  renderMirrorsFirst,
  renderMirrorsPulse,
} from "@/hooks/mirrorsSong";
import { renderWarriorSong } from "@/hooks/warriorSong";
import { Track } from "@/types/music";

export const TRACKS: Track[] = [
  {
    titleKey: "songJourney",
    src: "/music/rosettas-theme.mp3",
    render: renderJourneySong,
    image: { src: "/images/viaje.png", width: 1254, height: 1254 },
  },
  {
    titleKey: "songJourneyLong",
    src: "/music/rosettas-theme-extended.mp3",
    render: renderJourneyLongSong,
    image: { src: "/images/viaje.gif", width: 1254, height: 1254 },
  },
  {
    titleKey: "songDeparture",
    src: "/music/departure.mp3",
    render: renderDepartureSong,
    image: { src: "/images/partida.png", width: 1254, height: 1254 },
  },
  {
    titleKey: "songTerms",
    src: "/music/on-her-own-terms.mp3",
    render: renderWarriorSong,
    image: {
      srcEn: "/images/suspropiosterminos-en.png",
      srcEs: "/images/suspropiosterminos-es.png",
      srcKre: "/images/suspropiosterminos-kre.png",
      srcPat: "/images/suspropiosterminos-pat.png",
      width: 1254,
      height: 1254,
    },
  },

  {
    titleKey: "songAlone",
    src: "/music/alone.mp3",
    render: renderHerSong,
    image: { src: "/images/sola.png", width: 1254, height: 1254 },
  },
  {
    titleKey: "songDawn",
    src: "/music/she-goes.mp3",
    render: renderDawnSong,
    image: { src: "/images/ellaseva.png", width: 1254, height: 1254 },
  },
  {
    titleKey: "songMirrors",
    src: "/music/mirrors-1.mp3",
    render: renderMirrorsFirst,
    image: { src: "/images/espejos1.png", width: 1254, height: 1254 },
  },
  {
    titleKey: "songMirrorsPulse",
    src: "/music/mirrors-2.mp3",
    render: renderMirrorsPulse,
    image: { src: "/images/espejos2.png", width: 1254, height: 1254 },
  },
  {
    titleKey: "songMirrorsChamber",
    src: "/music/mirrors-3.mp3",
    render: renderMirrorsChamber,
    image: { src: "/images/espejos3.png", width: 1254, height: 1254 },
  },
  {
    titleKey: "songDepths",
    src: "/music/depths.mp3",
    render: renderDepthsSong,
    image: { src: "/images/depths.png", width: 1254, height: 1254 },
  },
];
