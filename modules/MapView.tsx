"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import { MAP_GRAPH, MAP_MAX_DEPTH, mapFade } from "@/hooks/mapGraph";
import { MAP_LOCATIONS } from "@/hooks/mapLocations";
import { playClick, playJourney } from "@/hooks/soundEffects";
import { useMapDrift } from "@/hooks/useMapDrift";
import { useMapView } from "@/hooks/useMapView";
import { MapLocation } from "@/types/map";
import { PanelDictionary } from "@/types/panel";
import DraggableControl from "@/modules/DraggableControl";
import MapLocationButton from "@/modules/MapLocationButton";
import NavPad from "@/modules/NavPad";
import ZoomKeys from "@/modules/ZoomKeys";

const RAIN_MS = 8000;
const RAIN_SRC = "/images/mariposas.png";

const PULSE_STEP_MS = 500;
const PULSE_LAYERS = [
  { id: "halo", stroke: "#f78fc4", width: 5, strength: 0.4 },
  { id: "core", stroke: "#fff4fb", width: 1.7, strength: 1 },
];

const dropDelay = (depth: number) =>
  ({ "--drop": `${(MAP_MAX_DEPTH - depth) * 110}ms` }) as CSSProperties;

export default function MapView({
  t,
  onSelect,
}: {
  t: PanelDictionary;
  onSelect: (id: string) => void;
}) {
  const map = useMapView();
  const linesRef = useRef<SVGSVGElement | null>(null);
  const [falling, setFalling] = useState<boolean>(false);
  const rainTimer = useRef<number | null>(null);

  useMapDrift(linesRef);

  useEffect(() => {
    const img = new window.Image();
    img.src = RAIN_SRC;
    return () => {
      if (rainTimer.current !== null) window.clearTimeout(rainTimer.current);
    };
  }, []);

  const startRain = (place: MapLocation) => {
    if (falling) return;
    onSelect(place.id);
    playClick(1.2);
    playJourney(RAIN_MS / 1000);
    map.focusOn(place.x, place.y);
    setFalling(true);
    rainTimer.current = window.setTimeout(() => {
      rainTimer.current = null;
      setFalling(false);
      map.reset();
    }, RAIN_MS);
  };

  return (
    <div
      ref={map.containerRef}
      className="absolute inset-0 flex touch-none select-none overflow-hidden"
      onPointerDown={map.onPointerDown}
      onPointerMove={map.onPointerMove}
      onPointerUp={map.onPointerUp}
      onPointerCancel={map.onPointerUp}
    >
      <div
        className="absolute left-1/2 top-1/2 flex h-0 w-0 will-change-transform"
        style={{
          transform: `translate3d(${map.view.x}px, ${map.view.y}px, 0) scale(${map.view.zoom})`,
          transition: map.animated
            ? "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)"
            : "none",
        }}
      >
        <svg
          ref={linesRef}
          className={`pointer-events-none absolute left-0 top-0 h-px w-px overflow-visible ${falling ? "map-falling" : "map-rising"}`}
        >
          {MAP_GRAPH.segments.map((s) => (
            <line
              key={`${s.id}-glow`}
              style={dropDelay(s.depth)}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke="#f78fc4"
              strokeWidth={4.5}
              strokeLinecap="round"
              opacity={mapFade(s.depth) * 0.22}
            />
          ))}
          {MAP_GRAPH.segments.map((s) => (
            <line
              key={s.id}
              style={dropDelay(s.depth)}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke="#ffd7ec"
              strokeWidth={1.1}
              strokeLinecap="round"
              opacity={mapFade(s.depth)}
            />
          ))}
          {PULSE_LAYERS.map((layer) =>
            MAP_GRAPH.segments.map((s) => (
              <line
                key={`${s.id}-${layer.id}`}
                className="map-pulse"
                style={{ animationDelay: `${s.depth * PULSE_STEP_MS}ms` }}
                x1={s.x1}
                y1={s.y1}
                x2={s.x2}
                y2={s.y2}
                pathLength={100}
                stroke={layer.stroke}
                strokeWidth={layer.width}
                opacity={Math.min(1, mapFade(s.depth) + 0.35) * layer.strength}
              />
            )),
          )}
          {MAP_GRAPH.nodes.map((n) => (
            <circle
              key={n.id}
              style={dropDelay(n.depth)}
              cx={n.x}
              cy={n.y}
              r={2.8}
              fill={n.unlocked ? "#ffd7ec" : "#0d0a1c"}
              stroke="#ffd7ec"
              strokeWidth={1.1}
              opacity={Math.max(0.18, mapFade(n.depth))}
            />
          ))}
        </svg>
        {MAP_LOCATIONS.map((place) => (
          <MapLocationButton
            key={place.id}
            place={place}
            label={t[place.labelKey]}
            onPress={() => startRain(place)}
          />
        ))}
      </div>

      <div className="absolute bottom-[3%] right-[2%] flex origin-bottom-right scale-[0.36] flex-col items-center gap-3">
        <DraggableControl>
          <NavPad onPan={map.pan} onReset={map.reset} />
        </DraggableControl>
        <DraggableControl>
          <ZoomKeys
            onZoomIn={map.zoomIn}
            onZoomOut={map.zoomOut}
            canZoomIn={map.canZoomIn}
            canZoomOut={map.canZoomOut}
          />
        </DraggableControl>
      </div>

      {falling && (
        <div
          data-control
          className="rain-fade absolute inset-0 z-20 flex overflow-hidden mix-blend-screen"
        >
          <div className="rain-scroll absolute inset-x-0 top-[-100%] flex h-[200%] flex-col">
            <div
              className="relative flex h-1/2 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${RAIN_SRC})` }}
            />
            <div
              className="relative flex h-1/2 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${RAIN_SRC})` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
