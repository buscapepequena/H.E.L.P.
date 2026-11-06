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
  { titleKey: "songJourney", render: renderJourneySong },
  { titleKey: "songJourneyLong", render: renderJourneyLongSong },
  { titleKey: "songDeparture", render: renderDepartureSong },
  { titleKey: "songTerms", render: renderWarriorSong },
  { titleKey: "songAlone", render: renderHerSong },
  { titleKey: "songDawn", render: renderDawnSong },
  { titleKey: "songMirrors", render: renderMirrorsFirst },
  { titleKey: "songMirrorsPulse", render: renderMirrorsPulse },
  { titleKey: "songMirrorsChamber", render: renderMirrorsChamber },
  { titleKey: "songDepths", render: renderDepthsSong },
];
