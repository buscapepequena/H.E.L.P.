import { renderDepartureSong } from "@/hooks/departureSong";
import { renderDepthsSong } from "@/hooks/depthsSong";
import { renderHerSong } from "@/hooks/herSong";
import { renderJourneySong } from "@/hooks/journeySong";
import { renderWarriorSong } from "@/hooks/warriorSong";
import { Track } from "@/types/music";

export const TRACKS: Track[] = [
  { titleKey: "songJourney", render: renderJourneySong },
  { titleKey: "songDeparture", render: renderDepartureSong },
  { titleKey: "songTerms", render: renderWarriorSong },
  { titleKey: "songAlone", render: renderHerSong },
  { titleKey: "songDepths", render: renderDepthsSong },
];
