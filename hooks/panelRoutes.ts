import { LocationView, PanelView } from "@/types/panel";

export const LOCATION_VIEWS: LocationView[] = [
  "map",
  "rooms",
  "portals",
  "mirrors",
  "sims",
];

const GLOBAL_PATHS: Record<string, PanelView> = {
  tunes: "music",
  computer: "local",
  settings: "settings",
};

export const isLocationView = (value: string): value is LocationView =>
  LOCATION_VIEWS.includes(value as LocationView);

export const viewHref = (view: PanelView, location: string): string => {
  const path = Object.keys(GLOBAL_PATHS).find(
    (key) => GLOBAL_PATHS[key] === view,
  );
  return path ? `/${path}` : `/${location}/${view}`;
};

export const viewOfPath = (pathname: string): PanelView | null => {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 1) return GLOBAL_PATHS[parts[0]] ?? null;
  return parts.length === 2 && isLocationView(parts[1]) ? parts[1] : null;
};
