import { RefObject } from "react";
import { LocalizedImage, PanelTextKey } from "@/types/panel";

export interface MirrorsVersion {
  turn: number[];
  undulate: boolean;
  pulse: boolean;
  keys: boolean;
  synth: boolean;
  room: number;
  wet: number;
  dry: number;
}

export interface WeightlessShape {
  length: number;
  energy: (t: number) => number;
  bend: (t: number) => number;
  lift: (t: number) => number;
  chordAt: (t: number) => number[];
  soar: (t: number) => number;
  shimmer: (t: number) => number;
}

export interface PhraseNote {
  at: number;
  midi: number;
  length: number;
}

export interface Track {
  titleKey: PanelTextKey;
  src?: string;
  render?: () => Promise<string>;
  image?: LocalizedImage;
  loop?: boolean;
  hidden?: boolean;
}

export interface MusicContextValue {
  track: Track | null;
  playing: boolean;
  time: number;
  duration: number;
  volume: number;
  repeat: boolean;
  popped: boolean;
  collapsed: boolean;
  analyserRef: RefObject<AnalyserNode | null>;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  playTrack: (key: PanelTextKey) => void;
  crossfadeTo: (key: PanelTextKey, ms?: number) => void;
  pauseTrack: (key: PanelTextKey) => void;
  seek: (fraction: number) => void;
  setVolume: (value: number) => void;
  toggleRepeat: () => void;
  popOut: () => void;
  closePop: () => void;
  toggleCollapsed: () => void;
}
