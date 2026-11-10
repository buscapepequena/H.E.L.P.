import { GEO_PLACES, mapPoint } from "@/hooks/mapGeo";
import { PSYCHIC_SCENES } from "@/hooks/panelPortals";
import { WS1_ROOMS, WS2_ROOMS } from "@/hooks/panelRooms";
import { SIM_SLOTS } from "@/hooks/panelSims";
import { GeoPoint, MapLocation, MapNetwork, MapSound } from "@/types/map";
import { PanelTextKey } from "@/types/panel";

const LIBRARY_COLORS = { line: "#e4d8ff", glow: "#a98bf0", pulse: "#f4eeff" };
const FOOD_COLORS = { line: "#d6ebff", glow: "#6fb6ff", pulse: "#f0f8ff" };
const COFFEE_COLORS = { line: "#d8f5df", glow: "#6fd28c", pulse: "#effcf2" };
const HOME_COLORS = { line: "#ffd7ec", glow: "#f78fc4", pulse: "#fff4fb" };
const STORAGE_COLORS = { line: "#fff3b8", glow: "#e8c94a", pulse: "#fffbe6" };
const LANGUAGE_COLORS = { line: "#ffd3d6", glow: "#f2545e", pulse: "#fff1f2" };

const errand = (
  id: string,
  labelKey: PanelTextKey,
  src: string,
  point: GeoPoint,
  rain: string,
  sound: MapSound,
  network: MapNetwork,
): MapLocation => ({
  id,
  labelKey,
  src,
  size: 52,
  ...mapPoint(point),
  rooms: [],
  sims: [],
  rain,
  sound,
  network,
});

export const MAP_LOCATIONS: MapLocation[] = [
  {
    id: "ws",
    labelKey: "mapHome",
    src: "/images/ws.png",
    size: 52,
    ...mapPoint(GEO_PLACES.ws),
    rooms: WS1_ROOMS,
    sims: SIM_SLOTS,
    portal: PSYCHIC_SCENES,
    rain: "/images/mariposas.png",
    sound: "journey",
    network: { seed: 20, steps: [7, 10], ...HOME_COLORS },
  },
  {
    id: "ws2",
    labelKey: "mapHomeAtlantic",
    src: "/images/ws2.png",
    size: 52,
    ...mapPoint(GEO_PLACES.ws2),
    rooms: WS2_ROOMS,
    sims: SIM_SLOTS,
    portal: PSYCHIC_SCENES,
    rain: "/images/mariposas.png",
    sound: "journey",
    network: { seed: 211, steps: [5, 8], ...HOME_COLORS },
  },
  errand(
    "biblioteca-pacific",
    "mapLibrary",
    "/images/biblioteca.png",
    GEO_PLACES.bibliotecaPacific,
    "/images/libros.png",
    "library",
    { seed: 77, steps: [2, 4], ...LIBRARY_COLORS },
  ),
  errand(
    "biblioteca-central",
    "mapLibrary",
    "/images/biblioteca.png",
    GEO_PLACES.bibliotecaCentral,
    "/images/libros.png",
    "library",
    { seed: 91, steps: [2, 4], ...LIBRARY_COLORS },
  ),
  errand(
    "lidl-downtown",
    "mapFood",
    "/images/nourriture.png",
    GEO_PLACES.lidlDowntown,
    "/images/comida.png",
    "food",
    { seed: 133, steps: [2, 4], ...FOOD_COLORS },
  ),
  errand(
    "lidl-quinta-avenida",
    "mapFood",
    "/images/nourriture.png",
    GEO_PLACES.lidlQuintaAvenida,
    "/images/comida.png",
    "food",
    { seed: 149, steps: [2, 4], ...FOOD_COLORS },
  ),
  errand(
    "siete-once",
    "mapCoffee",
    "/images/cafe.png",
    GEO_PLACES.sieteOnce,
    "/images/cafeina.png",
    "coffee",
    { seed: 167, steps: [2, 4], ...COFFEE_COLORS },
  ),
  errand(
    "dunkin",
    "mapCoffee",
    "/images/cafe.png",
    GEO_PLACES.dunkin,
    "/images/cafeina.png",
    "coffee",
    { seed: 181, steps: [2, 4], ...COFFEE_COLORS },
  ),
  errand(
    "cubesmart",
    "mapStorage",
    "/images/taquillas.png",
    GEO_PLACES.cubesmart,
    "/images/almacenamiento.png",
    "storage",
    { seed: 193, steps: [2, 4], ...STORAGE_COLORS },
  ),
  errand(
    "whole-foods-tercera",
    "mapFood",
    "/images/nourriture.png",
    GEO_PLACES.wholeFoodsTercera,
    "/images/comida.png",
    "food",
    { seed: 211, steps: [2, 4], ...FOOD_COLORS },
  ),
  errand(
    "whole-foods-ashland",
    "mapFood",
    "/images/nourriture.png",
    GEO_PLACES.wholeFoodsAshland,
    "/images/comida.png",
    "food",
    { seed: 227, steps: [2, 4], ...FOOD_COLORS },
  ),
  errand(
    "parque-houston",
    "mapLanguages",
    "/images/idiomas.png",
    GEO_PLACES.parqueHouston,
    "/images/lengua.png",
    "languages",
    { seed: 241, steps: [2, 4], ...LANGUAGE_COLORS },
  ),
  errand(
    "parque-sycamores",
    "mapLanguages",
    "/images/idiomas.png",
    GEO_PLACES.parqueSycamores,
    "/images/lengua.png",
    "languages",
    { seed: 257, steps: [2, 4], ...LANGUAGE_COLORS },
  ),
  errand(
    "parque-thomas-greene",
    "mapLanguages",
    "/images/idiomas.png",
    GEO_PLACES.parqueThomasGreene,
    "/images/lengua.png",
    "languages",
    { seed: 271, steps: [2, 4], ...LANGUAGE_COLORS },
  ),
  errand(
    "parque-brower",
    "mapLanguages",
    "/images/idiomas.png",
    GEO_PLACES.parqueBrower,
    "/images/lengua.png",
    "languages",
    { seed: 283, steps: [2, 4], ...LANGUAGE_COLORS },
  ),
];

export const DEFAULT_LOCATION = MAP_LOCATIONS[0].id;

export const findLocation = (id?: string): MapLocation | undefined =>
  MAP_LOCATIONS.find((place) => place.id === id);
