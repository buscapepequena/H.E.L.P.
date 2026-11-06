import { PanelIcon, PanelLang, PortalLight } from "@/types/panel";

const psychic = (name: string): PanelIcon => ({
  src: `/images/psiquico-${name}.png`,
  width: 1535,
  height: 1024,
});

export const PSYCHIC_PORTAL: Record<PanelLang, PanelIcon> = {
  en: psychic("en"),
  es: psychic("es"),
  jam: psychic("patwa"),
  ht: psychic("creole"),
};

const WARM = "rgba(255, 170, 80, 0.9)";
const RED = "rgba(255, 45, 40, 0.9)";
const TEAL = "rgba(50, 240, 205, 0.9)";

export const PORTAL_LIGHTS: PortalLight[] = [
  { x: 61, y: 22, width: 22, height: 26, color: TEAL, low: 0.04, high: 0.17, seconds: 9, delay: 0 },
  { x: 71.3, y: 29, width: 4.5, height: 7, color: TEAL, low: 0.1, high: 0.32, seconds: 6, delay: 1.4, flicker: true },
  { x: 54, y: 60, width: 27, height: 27, color: RED, low: 0.03, high: 0.14, seconds: 7, delay: 0.6 },
  { x: 59.5, y: 56, width: 15, height: 15, color: "rgba(255, 70, 95, 0.9)", low: 0.12, high: 0.34, seconds: 5, delay: 0, flicker: true },
  { x: 51.5, y: 64, width: 6, height: 8, color: RED, low: 0.08, high: 0.26, seconds: 4.6, delay: 2 },
  { x: 33.9, y: 49, width: 9, height: 11, color: WARM, low: 0.1, high: 0.3, seconds: 6.5, delay: 0.9, flicker: true },
  { x: 87.8, y: 22, width: 10, height: 14, color: WARM, low: 0.1, high: 0.28, seconds: 7.5, delay: 1.7, flicker: true },
  { x: 96.6, y: 53.5, width: 3.4, height: 5, color: WARM, low: 0.12, high: 0.34, seconds: 5.5, delay: 2.6 },
  { x: 8.7, y: 12, width: 11, height: 8, color: WARM, low: 0.05, high: 0.18, seconds: 10, delay: 3 },
  { x: 8.7, y: 30, width: 10, height: 18, color: WARM, low: 0.03, high: 0.12, seconds: 11, delay: 1 },
  { x: 21.2, y: 4, width: 5, height: 9, color: WARM, low: 0.05, high: 0.18, seconds: 8, delay: 4 },
  { x: 21, y: 24, width: 5, height: 10, color: WARM, low: 0.05, high: 0.18, seconds: 9.5, delay: 2.2 },
  { x: 44, y: 24, width: 4.5, height: 15, color: WARM, low: 0.03, high: 0.13, seconds: 12, delay: 0.4 },
  { x: 77, y: 27, width: 4, height: 11, color: WARM, low: 0.05, high: 0.18, seconds: 8.5, delay: 3.4 },
  { x: 76.3, y: 60, width: 4, height: 15, color: WARM, low: 0.05, high: 0.18, seconds: 10.5, delay: 1.2 },
  { x: 17, y: 77.5, width: 7, height: 9, color: WARM, low: 0.06, high: 0.2, seconds: 7, delay: 2.8 },
];

export const PORTAL_STEAM = [
  { x: 81, y: 76, delay: 0 },
  { x: 81.8, y: 78, delay: 3.5 },
];
