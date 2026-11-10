"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readProfile, saveProfile } from "@/hooks/localProfile";
import { TRACKS } from "@/hooks/tracks";
import { MusicContextValue } from "@/types/music";
import { PanelTextKey } from "@/types/panel";

const VOLUME_SAVE_MS = 300;
const FADE_TICK_MS = 50;

export const useMusicEngine = (): MusicContextValue => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const resumeRef = useRef<boolean>(false);
  const repeatRef = useRef<boolean>(false);
  const profileReadyRef = useRef<boolean>(false);
  const volumeTimerRef = useRef<number | null>(null);
  const unbindRef = useRef<(() => void) | null>(null);
  const skipLoadRef = useRef<boolean>(false);
  const fadeRef = useRef<number | null>(null);
  const incomingRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef<number>(0.6);
  const [index, setIndex] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.6);
  const [repeat, setRepeat] = useState<boolean>(false);
  const [popped, setPopped] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const track = TRACKS[index] ?? null;
  const trackRef = useRef(track);

  useEffect(() => {
    trackRef.current = track;
  }, [track]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const step = useCallback((delta: number) => {
    if (!TRACKS.length) return;
    setIndex((i) => {
      let next = i;
      do {
        next = (next + delta + TRACKS.length) % TRACKS.length;
      } while (TRACKS[next].hidden && next !== i);
      return next;
    });
  }, []);

  const attach = useCallback(
    (audio: HTMLAudioElement) => {
      unbindRef.current?.();
      const onTime = () => setTime(audio.currentTime);
      const onMeta = () => setDuration(audio.duration);
      const onPlay = () => setPlaying(true);
      const onPause = () => setPlaying(false);
      const onEnded = () => {
        if (repeatRef.current || trackRef.current?.loop) {
          audio.currentTime = 0;
          void audio.play();
          return;
        }
        resumeRef.current = true;
        step(1);
      };
      audio.addEventListener("timeupdate", onTime);
      audio.addEventListener("loadedmetadata", onMeta);
      audio.addEventListener("play", onPlay);
      audio.addEventListener("pause", onPause);
      audio.addEventListener("ended", onEnded);
      unbindRef.current = () => {
        audio.removeEventListener("timeupdate", onTime);
        audio.removeEventListener("loadedmetadata", onMeta);
        audio.removeEventListener("play", onPlay);
        audio.removeEventListener("pause", onPause);
        audio.removeEventListener("ended", onEnded);
      };
    },
    [step],
  );

  useEffect(() => {
    void readProfile().then((profile) => {
      if (typeof profile.volume === "number") setVolumeState(profile.volume);
      if (profile.repeat) {
        repeatRef.current = true;
        setRepeat(true);
      }
      const saved = TRACKS.findIndex(
        (song) => song.titleKey === profile.track && !song.hidden,
      );
      if (saved >= 0) setIndex(saved);
      profileReadyRef.current = true;
    });
  }, []);

  useEffect(() => {
    if (profileReadyRef.current && track && !track.hidden) {
      void saveProfile({ track: track.titleKey });
    }
  }, [track]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;
    attach(audio);
    return () => {
      audioRef.current?.pause();
      unbindRef.current?.();
    };
  }, [attach]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (skipLoadRef.current) {
      skipLoadRef.current = false;
      return;
    }
    let alive = true;
    const load = async () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      setTime(0);
      setDuration(0);
      const src = track.src ?? (await track.render?.());
      if (!alive || !src) return;
      audio.loop = Boolean(track.loop);
      audio.src = src;
      if (resumeRef.current) audio.play().catch(() => undefined);
    };
    void load();
    return () => {
      alive = false;
    };
  }, [track]);

  useEffect(() => {
    if (audioRef.current && fadeRef.current === null) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      TRACKS.reduce<Promise<unknown>>(
        (queue, song) =>
          queue
            .then(() => (song.src ? undefined : song.render?.()))
            .catch(() => undefined),
        Promise.resolve(),
      );
    }, 1500);
    return () => window.clearTimeout(timer);
  }, []);

  const connect = () => {
    const audio = audioRef.current;
    if (!audio || contextRef.current) return;
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.78;
    context.createMediaElementSource(audio).connect(analyser);
    analyser.connect(context.destination);
    contextRef.current = context;
    analyserRef.current = analyser;
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (!audio.paused) {
      resumeRef.current = false;
      audio.pause();
      return;
    }
    connect();
    void contextRef.current?.resume();
    resumeRef.current = true;
    audio.play().catch(() => undefined);
  };

  const jump = (delta: number) => {
    connect();
    void contextRef.current?.resume();
    resumeRef.current = true;
    step(delta);
  };

  const playTrack = (key: PanelTextKey) => {
    const target = TRACKS.findIndex((song) => song.titleKey === key);
    if (target < 0) return;
    connect();
    void contextRef.current?.resume();
    resumeRef.current = true;
    if (target === index) {
      audioRef.current?.play().catch(() => undefined);
      return;
    }
    setIndex(target);
  };

  const crossfadeTo = async (key: PanelTextKey, ms = 5000) => {
    const target = TRACKS.findIndex((song) => song.titleKey === key);
    const current = audioRef.current;
    if (target < 0) return;
    if (target === index && fadeRef.current === null) {
      playTrack(key);
      return;
    }
    if (!current || current.paused) {
      playTrack(key);
      return;
    }
    const song = TRACKS[target];
    const src = song.src ?? (await song.render?.());
    if (!src) return;
    if (fadeRef.current !== null) window.clearInterval(fadeRef.current);
    connect();
    void contextRef.current?.resume();
    const next = new Audio();
    next.preload = "auto";
    next.loop = Boolean(song.loop);
    next.src = src;
    next.volume = 0;
    if (contextRef.current && analyserRef.current) {
      contextRef.current.createMediaElementSource(next).connect(analyserRef.current);
    }
    incomingRef.current = next;
    await next.play().catch(() => undefined);
    const level = volumeRef.current;
    const from = current.volume;
    const start = performance.now();
    fadeRef.current = window.setInterval(() => {
      const k = Math.min(1, (performance.now() - start) / ms);
      current.volume = from * Math.cos((k * Math.PI) / 2);
      next.volume = level * k * k;
      if (k < 1) return;
      if (fadeRef.current !== null) window.clearInterval(fadeRef.current);
      fadeRef.current = null;
      incomingRef.current = null;
      current.pause();
      attach(next);
      audioRef.current = next;
      skipLoadRef.current = true;
      resumeRef.current = true;
      setDuration(next.duration || 0);
      setPlaying(true);
      setIndex(target);
    }, FADE_TICK_MS);
  };

  const pauseTrack = (key: PanelTextKey) => {
    const audio = audioRef.current;
    if (fadeRef.current !== null && incomingRef.current) {
      window.clearInterval(fadeRef.current);
      fadeRef.current = null;
      incomingRef.current.pause();
      incomingRef.current = null;
      if (audio) audio.volume = volumeRef.current;
      resumeRef.current = false;
      audio?.pause();
      return;
    }
    if (!audio || trackRef.current?.titleKey !== key) return;
    resumeRef.current = false;
    audio.pause();
  };

  const seek = (fraction: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = Math.max(0, Math.min(1, fraction)) * duration;
  };

  const toggleRepeat = () => {
    repeatRef.current = !repeatRef.current;
    setRepeat(repeatRef.current);
    void saveProfile({ repeat: repeatRef.current });
  };

  const setVolume = (value: number) => {
    const next = Math.max(0, Math.min(1, value));
    setVolumeState(next);
    if (volumeTimerRef.current !== null) {
      window.clearTimeout(volumeTimerRef.current);
    }
    volumeTimerRef.current = window.setTimeout(() => {
      volumeTimerRef.current = null;
      void saveProfile({ volume: next });
    }, VOLUME_SAVE_MS);
  };

  return {
    track,
    playing,
    time,
    duration,
    volume,
    repeat,
    popped,
    collapsed,
    analyserRef,
    toggle,
    next: () => jump(1),
    prev: () => jump(-1),
    playTrack,
    crossfadeTo: (key: PanelTextKey, ms?: number) => void crossfadeTo(key, ms),
    pauseTrack,
    seek,
    setVolume,
    toggleRepeat,
    popOut: () => {
      setCollapsed(false);
      setPopped(true);
    },
    closePop: () => setPopped(false),
    toggleCollapsed: () => setCollapsed((c) => !c),
  };
};
