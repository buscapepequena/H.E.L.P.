import { TrackImage } from "@/types/music";
import { PanelIcon, PanelLang } from "@/types/panel";

const LANG_SOURCE: Record<PanelLang, keyof TrackImage> = {
  en: "srcEn",
  es: "srcEs",
  jam: "srcPat",
  ht: "srcKre",
};

export const trackArt = (
  image: TrackImage | undefined,
  lang: PanelLang,
): PanelIcon | null => {
  if (!image) return null;
  const src = image[LANG_SOURCE[lang]] ?? image.src ?? image.srcEn;
  return typeof src === "string"
    ? { src, width: image.width, height: image.height }
    : null;
};
