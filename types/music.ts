import { RefObject } from "react";
import { PanelTextKey } from "@/types/panel";

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

export interface Track {
  titleKey: PanelTextKey;
  src?: string;
  render?: () => Promise<string>;
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
  seek: (fraction: number) => void;
  setVolume: (value: number) => void;
  toggleRepeat: () => void;
  popOut: () => void;
  closePop: () => void;
  toggleCollapsed: () => void;
}
