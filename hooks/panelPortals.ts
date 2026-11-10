import { LocalizedSources, PanelTextKey } from "@/types/panel";
import { Scene, SceneLink } from "@/types/scene";

const WIDTH = 1585;
const HEIGHT = 992;

const door = (
  to: string,
  labelKey: PanelTextKey,
  x: number,
  y: number,
): SceneLink => ({ to, label: labelKey, labelKey, x, y, rotation: 0 });

const psychic = (
  id: string,
  src: string,
  links: SceneLink[],
  parent?: string,
  localized: LocalizedSources = {},
): Scene => ({
  id,
  title: "Lectura psíquica",
  width: WIDTH,
  height: HEIGHT,
  tiles: [{ ...localized, src, x: 0, y: 0, width: WIDTH, height: HEIGHT }],
  focus: { x: 0.5, y: 0.5 },
  links,
  parent,
});

export const PSYCHIC_SCENES: Scene[] = [
  psychic(
    "psiquico-bosque",
    "/images/psiquico-en.png",
    [door("psiquico-frente", "portalApproach", 0.492, 0.6)],
    undefined,
    {
      srcEn: "/images/psiquico-en.png",
      srcEs: "/images/psiquico-es.png",
      srcPat: "/images/psiquico-pat.png",
      srcKre: "/images/psiquico-kre.png",
    },
  ),
  psychic(
    "psiquico-frente",
    "/images/psiquicofrente.png",
    [door("psiquico-puertas", "portalOpen", 0.555, 0.575)],
    "psiquico-bosque",
  ),
  psychic(
    "psiquico-puertas",
    "/images/psiquicopuertasabiertas.png",
    [door("psiquico-cerca", "portalEnter", 0.562, 0.53)],
    "psiquico-frente",
  ),
  {
    ...psychic(
      "psiquico-cerca",
      "/images/psiquicopuertasdecerca.png",
      [],
      "psiquico-puertas",
    ),
    maxZoom: 8,
    glimmers: [
      { x: 0.44, y: 0.4, zoom: 1, size: 3.5 },
      { x: 0.44, y: 0.45, zoom: 2.4, size: 5 },
      { x: 0.535, y: 0.46, zoom: 3.6, size: 7 },
      { x: 0.475, y: 0.53, zoom: 5, size: 9.5 },
      { x: 0.52, y: 0.48, zoom: 6.5, size: 13 },
    ],
    dialogue: [
      { key: "psychicAsk", speaker: "sign" },
      { key: "psychicReply", speaker: "rosetta" },
      { key: "psychicInsist", speaker: "sign" },
      { key: "psychicAskName", speaker: "sign" },
      { key: "psychicPuzzled", speaker: "rosetta" },
    ],
  },
];
