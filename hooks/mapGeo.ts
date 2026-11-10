import { GeoPoint } from "@/types/map";

const KM_PER_DEGREE = 111.32;

export const MAP_UNITS_PER_KM = 450;

export const MAP_ORIGIN: GeoPoint = { lat: 40.6729365, lon: -73.902021 };

export const GEO_PLACES: Record<string, GeoPoint> = {
  ws: MAP_ORIGIN,
  ws2: { lat: 40.6786335, lon: -73.9462517 },
  bibliotecaPacific: { lat: 40.68348, lon: -73.9785318 },
  bibliotecaCentral: { lat: 40.6721312, lon: -73.9681891 },
  lidlDowntown: { lat: 40.6898023, lon: -73.9835655 },
  lidlQuintaAvenida: { lat: 40.6795373, lon: -73.9785059 },
  sieteOnce: { lat: 40.6786881, lon: -73.9444194 },
  dunkin: { lat: 40.6848014, lon: -73.9789058 },
  cubesmart: { lat: 40.6808274, lon: -73.9829727 },
  wholeFoodsTercera: { lat: 40.6748746, lon: -73.9887826 },
  wholeFoodsAshland: { lat: 40.6860974, lon: -73.9785902 },
  parqueHouston: { lat: 40.6722128, lon: -73.9050754 },
  parqueSycamores: { lat: 40.6867661, lon: -73.9808891 },
  parqueThomasGreene: { lat: 40.6802759, lon: -73.9852489 },
  parqueBrower: { lat: 40.6739108, lon: -73.9437074 },
};

export const mapPoint = ({ lat, lon }: GeoPoint): { x: number; y: number } => {
  const east =
    (lon - MAP_ORIGIN.lon) *
    KM_PER_DEGREE *
    Math.cos((MAP_ORIGIN.lat * Math.PI) / 180);
  const north = (lat - MAP_ORIGIN.lat) * KM_PER_DEGREE;
  return {
    x: Math.round(east * MAP_UNITS_PER_KM),
    y: Math.round(-north * MAP_UNITS_PER_KM),
  };
};
