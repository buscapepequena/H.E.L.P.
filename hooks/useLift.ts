"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playClick, playDing } from "@/hooks/soundEffects";
import { LiftState, SceneLift } from "@/types/scene";

export const LIFT_TOP_FLOOR = 5;
const FLOOR_MS = 1300;
const IDLE_MIN_MS = 3500;
const IDLE_SPREAD_MS = 6000;
const DWELL_MIN_MS = 2600;
const DWELL_SPREAD_MS = 2400;
const ARRIVAL_REST_MS = 6000;
const STOP_CHANCE = 0.3;
const TRIP_CHANCE = 0.4;

export const floorLabel = (floor: number): string =>
  floor === 0 ? "G" : String(floor);

const pickFloor = (current: number): number => {
  const next = Math.floor(Math.random() * LIFT_TOP_FLOOR);
  return next >= current ? next + 1 : next;
};

const dwell = (now: number): number =>
  now + DWELL_MIN_MS + Math.random() * DWELL_SPREAD_MS;

const advance = (current: LiftState, now: number): LiftState => {
  if (now < current.restUntil) return current;
  const [target, ...rest] = current.stops;
  if (target === undefined) {
    if (current.called) return current;
    const first = pickFloor(current.floor);
    const stops =
      Math.random() < TRIP_CHANCE ? [first, pickFloor(first)] : [first];
    return { ...current, stops };
  }
  if (current.floor === target) {
    const home = target === 0 && current.called;
    if (home) playDing();
    return {
      ...current,
      stops: rest,
      called: home ? false : current.called,
      restUntil: home
        ? now + ARRIVAL_REST_MS
        : rest.length
          ? dwell(now)
          : now + IDLE_MIN_MS + Math.random() * IDLE_SPREAD_MS,
    };
  }
  const floor = current.floor + Math.sign(target - current.floor);
  const pause = floor !== target && Math.random() < STOP_CHANCE;
  return {
    ...current,
    floor,
    restUntil: pause ? dwell(now) : current.restUntil,
  };
};

export const useLift = (lift: SceneLift) => {
  const stateRef = useRef<LiftState>({
    floor: lift.floor,
    stops: lift.target === lift.floor ? [] : [lift.target],
    called: false,
    restUntil: 0,
  });
  const [state, setState] = useState<LiftState>(stateRef.current);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = stateRef.current;
      const next = advance(current, Date.now());
      if (next !== current) {
        stateRef.current = next;
        setState(next);
      }
    }, FLOOR_MS);
    return () => window.clearInterval(timer);
  }, []);

  const call = useCallback(() => {
    playClick(1.3);
    const current = stateRef.current;
    if (current.called) return;
    if (current.floor === 0 && !current.stops.length) {
      playDing();
      stateRef.current = { ...current, restUntil: Date.now() + ARRIVAL_REST_MS };
      setState(stateRef.current);
      return;
    }
    const trip = current.stops.slice(0, 1);
    stateRef.current = {
      ...current,
      stops: trip[0] === 0 ? trip : [...trip, 0],
      called: true,
      restUntil: trip.length
        ? current.restUntil
        : Math.min(current.restUntil, Date.now() + DWELL_MIN_MS),
    };
    setState(stateRef.current);
  }, []);

  const heading = state.stops[0];
  return {
    label: floorLabel(state.floor),
    arrow:
      heading === undefined || heading === state.floor
        ? ""
        : heading > state.floor
          ? "↑"
          : "↓",
    called: state.called,
    call,
  };
};
