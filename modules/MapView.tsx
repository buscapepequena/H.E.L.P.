"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import {
  MAP_MAX_DEPTH,
  buildGraph,
  graphReach,
  mapFade,
  scaleGraph,
} from "@/hooks/mapGraph";
import { MAP_LOCATIONS } from "@/hooks/mapLocations";
import { shapeRoute } from "@/hooks/mapRouteShape";
import { MAP_ROUTES } from "@/hooks/mapRoutes";
import {
  playClick,
  playCoffee,
  playFood,
  playJourney,
  playLanguages,
  playLibrary,
  playStorage,
} from "@/hooks/soundEffects";
import { useMapDrift } from "@/hooks/useMapDrift";
import { useMapView } from "@/hooks/useMapView";
import { MapLocation, MapSound } from "@/types/map";
import { PanelDictionary } from "@/types/panel";
import DraggableControl from "@/modules/DraggableControl";
import FitAllKey from "@/modules/FitAllKey";
import MapLocationButton from "@/modules/MapLocationButton";
import NavPad from "@/modules/NavPad";
import ZoomKeys from "@/modules/ZoomKeys";

const RAIN_MS = 8000;
const PULSE_STEP_MS = 500;
const ROUTE_LINE = "#fff1fa";
const ROUTE_GLOW = "#f78fc4";
const ROUTE_PULSE_MS = 90;

const SOUNDS: Record<MapSound, (seconds: number) => void> = {
  journey: playJourney,
  library: playLibrary,
  food: playFood,
  coffee: playCoffee,
  storage: playStorage,
  languages: playLanguages,
};

const NETWORK_OVERLAP = 90;

const connectedReach = (place: MapLocation): number =>
  Math.max(
    0,
    ...MAP_ROUTES.filter((r) => r.from === place.id || r.to === place.id).map((r) => {
      const other = MAP_LOCATIONS.find(
        (p) => p.id === (r.from === place.id ? r.to : r.from),
      );
      return other
        ? Math.hypot(other.x - place.x, other.y - place.y) / 2 + NETWORK_OVERLAP
        : 0;
    }),
  );

const NETWORKS = MAP_LOCATIONS.flatMap((place) => {
  if (!place.network) return [];
  const graph = buildGraph(
    place.network.seed,
    place.x,
    place.y,
    place.network.steps,
  );
  const factor = Math.max(
    1,
    connectedReach(place) / graphReach(graph, place.x, place.y),
  );
  return [
    {
      id: place.id,
      colors: place.network,
      graph: scaleGraph(graph, place.x, place.y, factor),
    },
  ];
});

const ROUTES = MAP_ROUTES.map((route) => {
  const network = MAP_LOCATIONS.find((place) => place.id === route.to)?.network;
  return {
    id: route.id,
    line: network?.line ?? ROUTE_LINE,
    glow: network?.glow ?? ROUTE_GLOW,
    pulse: network?.pulse ?? ROUTE_LINE,
    points: shapeRoute(route, MAP_ROUTES, MAP_LOCATIONS),
  };
});

const dropDelay = (depth: number) =>
  ({ "--drop": `${(MAP_MAX_DEPTH - depth) * 110}ms` }) as CSSProperties;

export default function MapView({
  t,
  current,
  onSelect,
}: {
  t: PanelDictionary;
  current?: MapLocation;
  onSelect: (id: string) => void;
}) {
  const map = useMapView(current?.x, current?.y);
  const linesRef = useRef<SVGSVGElement | null>(null);
  const [rain, setRain] = useState<string | null>(null);
  const rainTimer = useRef<number | null>(null);

  useMapDrift(linesRef);

  useEffect(() => {
    MAP_LOCATIONS.forEach((place) => {
      const img = new window.Image();
      img.src = place.rain;
    });
    return () => {
      if (rainTimer.current !== null) window.clearTimeout(rainTimer.current);
    };
  }, []);

  const startRain = (place: MapLocation) => {
    if (rain) return;
    playClick(1.2);
    SOUNDS[place.sound](RAIN_MS / 1000);
    map.focusOn(place.x, place.y);
    setRain(place.rain);
    rainTimer.current = window.setTimeout(() => {
      rainTimer.current = null;
      setRain(null);
      if (place.id === current?.id) map.reset();
      else onSelect(place.id);
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
          className={`pointer-events-none absolute left-0 top-0 h-px w-px overflow-visible ${rain ? "map-falling" : "map-rising"}`}
        >
          {ROUTES.map((route) => {
            const segments = route.points.slice(1).map((to, i) => ({
              from: route.points[i],
              to,
              key: `${route.id}-${i}`,
            }));
            return (
              <g key={route.id}>
                {segments.map(({ from, to, key }) => (
                  <line
                    key={`${key}-glow`}
                    style={dropDelay(MAP_MAX_DEPTH)}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={route.glow}
                    strokeWidth={4.5}
                    strokeLinecap="round"
                    opacity={0.24}
                  />
                ))}
                {segments.map(({ from, to, key }) => (
                  <line
                    key={key}
                    style={dropDelay(MAP_MAX_DEPTH)}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={route.line}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                  />
                ))}
                {segments.map(({ from, to, key }, i) => (
                  <line
                    key={`${key}-pulse`}
                    className="map-pulse"
                    style={{ animationDelay: `${i * ROUTE_PULSE_MS}ms` }}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    pathLength={100}
                    stroke={route.pulse}
                    strokeWidth={1.8}
                  />
                ))}
                {route.points.slice(1, -1).map((point, i) =>
                  i % 2 ? null : (
                    <circle
                      key={`${route.id}-node-${i}`}
                      style={dropDelay(MAP_MAX_DEPTH)}
                      cx={point.x}
                      cy={point.y}
                      r={2.6}
                      fill="#0d0a1c"
                      stroke={route.line}
                      strokeWidth={1.1}
                    />
                  ),
                )}
              </g>
            );
          })}
          {NETWORKS.map(({ id, colors, graph }) => (
            <g key={id}>
              {graph.segments.map((s) => (
                <line
                  key={`${s.id}-glow`}
                  style={dropDelay(s.depth)}
                  x1={s.x1}
                  y1={s.y1}
                  x2={s.x2}
                  y2={s.y2}
                  stroke={colors.glow}
                  strokeWidth={4.5}
                  strokeLinecap="round"
                  opacity={mapFade(s.depth) * 0.22}
                />
              ))}
              {graph.segments.map((s) => (
                <line
                  key={s.id}
                  style={dropDelay(s.depth)}
                  x1={s.x1}
                  y1={s.y1}
                  x2={s.x2}
                  y2={s.y2}
                  stroke={colors.line}
                  strokeWidth={1.1}
                  strokeLinecap="round"
                  opacity={mapFade(s.depth)}
                />
              ))}
              {[
                { key: "halo", stroke: colors.glow, width: 5, strength: 0.4 },
                { key: "core", stroke: colors.pulse, width: 1.7, strength: 1 },
              ].map((layer) =>
                graph.segments.map((s) => (
                  <line
                    key={`${s.id}-${layer.key}`}
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
              {graph.nodes.map((n) => (
                <circle
                  key={n.id}
                  style={dropDelay(n.depth)}
                  cx={n.x}
                  cy={n.y}
                  r={2.8}
                  fill={n.unlocked ? colors.line : "#0d0a1c"}
                  stroke={colors.line}
                  strokeWidth={1.1}
                  opacity={Math.max(0.18, mapFade(n.depth))}
                />
              ))}
            </g>
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
        <DraggableControl>
          <FitAllKey label={t.mapFitAll} onFit={map.fitAll} />
        </DraggableControl>
      </div>

      {rain && (
        <div
          data-control
          className="rain-fade absolute inset-0 z-20 flex overflow-hidden mix-blend-screen"
        >
          <div className="rain-scroll absolute inset-x-0 top-[-100%] flex h-[200%] flex-col">
            <div
              className="relative flex h-1/2 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${rain})` }}
            />
            <div
              className="relative flex h-1/2 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${rain})` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
