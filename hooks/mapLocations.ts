import { PSYCHIC_PORTAL } from "@/hooks/panelPortals";
import { ROOM_TILES } from "@/hooks/panelRooms";
import { SIM_SLOTS } from "@/hooks/panelSims";
import { MapLocation } from "@/types/map";

export const MAP_LOCATIONS: MapLocation[] = [
  {
    id: "ws",
    labelKey: "mapHome",
    src: "/images/ws.png",
    size: 52,
    x: 0,
    y: 0,
    rooms: ROOM_TILES,
    sims: SIM_SLOTS,
    portal: PSYCHIC_PORTAL,
  },
];

export const DEFAULT_LOCATION = MAP_LOCATIONS[0].id;

export const findLocation = (id?: string): MapLocation | undefined =>
  MAP_LOCATIONS.find((place) => place.id === id);
