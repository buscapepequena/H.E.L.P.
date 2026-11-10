import { MapRoute } from "@/types/map";

export const MAP_ROUTES: MapRoute[] = [
  { id: "ws-biblioteca-pacific", from: "ws", to: "biblioteca-pacific", lane: 1 },
  { id: "ws-dunkin", from: "ws", to: "dunkin", lane: 2 },
  { id: "ws-lidl-downtown", from: "ws", to: "lidl-downtown", lane: 3 },
  { id: "ws-lidl-quinta-avenida", from: "ws", to: "lidl-quinta-avenida", lane: 0 },
  { id: "ws2-siete-once", from: "ws2", to: "siete-once", lane: 0 },
  { id: "ws2-biblioteca-pacific", from: "ws2", to: "biblioteca-pacific", lane: -1 },
  { id: "ws2-biblioteca-central", from: "ws2", to: "biblioteca-central", lane: -3 },
  { id: "ws2-lidl-downtown", from: "ws2", to: "lidl-downtown", lane: -2 },
  { id: "ws2-lidl-quinta-avenida", from: "ws2", to: "lidl-quinta-avenida", lane: -4 },
  { id: "ws-cubesmart", from: "ws", to: "cubesmart", lane: -1 },
  { id: "ws-whole-foods-tercera", from: "ws", to: "whole-foods-tercera", lane: -2 },
  { id: "ws2-cubesmart", from: "ws2", to: "cubesmart", lane: 2 },
  { id: "ws2-whole-foods-tercera", from: "ws2", to: "whole-foods-tercera", lane: -5 },
  { id: "ws2-whole-foods-ashland", from: "ws2", to: "whole-foods-ashland", lane: 3 },
  { id: "ws-parque-houston", from: "ws", to: "parque-houston", lane: -3 },
  { id: "ws-parque-sycamores", from: "ws", to: "parque-sycamores", lane: 4 },
  { id: "ws-parque-thomas-greene", from: "ws", to: "parque-thomas-greene", lane: -4 },
  { id: "ws2-parque-sycamores", from: "ws2", to: "parque-sycamores", lane: 4 },
  { id: "ws2-parque-thomas-greene", from: "ws2", to: "parque-thomas-greene", lane: -6 },
  { id: "ws2-parque-brower", from: "ws2", to: "parque-brower", lane: 1 },
];
