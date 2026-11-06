"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TRACKS } from "@/hooks/tracks";
import { MusicContextValue } from "@/types/music";

export const useMusicEngine = (): MusicContextValue => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const resumeRef = useRef<boolean>(false);
  const repeatRef = useRef<boolean>(false);
  const [index, setIndex] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.6);
  const [repeat, setRepeat] = useState<boolean>(false);
  const [popped, setPopped] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const track = TRACKS[index] ?? null;

  const step = useCallback((delta: number) => {
    if (!TRACKS.length) return;
    setIndex((i) => (i + delta + TRACKS.length) % TRACKS.length);
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;
    const onTime = () => setTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      if (repeatRef.current) {
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
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [step]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    let alive = true;
    const load = async () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      setTime(0);
      setDuration(0);
      const src = track.src ?? (await track.render?.());
      if (!alive || !src) return;
      audio.src = src;
      if (resumeRef.current) audio.play().catch(() => undefined);
    };
    void load();
    return () => {
      alive = false;
    };
  }, [track]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      TRACKS.reduce<Promise<unknown>>(
        (queue, song) =>
          queue.then(() => song.render?.()).catch(() => undefined),
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

  const seek = (fraction: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = Math.max(0, Math.min(1, fraction)) * duration;
  };

  const toggleRepeat = () => {
    repeatRef.current = !repeatRef.current;
    setRepeat(repeatRef.current);
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
    seek,
    setVolume: (value) => setVolumeState(Math.max(0, Math.min(1, value))),
    toggleRepeat,
    popOut: () => {
      setCollapsed(false);
      setPopped(true);
    },
    closePop: () => setPopped(false),
    toggleCollapsed: () => setCollapsed((c) => !c),
  };
};
