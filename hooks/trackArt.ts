import {
  LocalizedImage,
  LocalizedSources,
  PanelIcon,
  PanelLang,
} from "@/types/panel";

const LANG_SOURCE: Record<PanelLang, keyof LocalizedSources> = {
  en: "srcEn",
  es: "srcEs",
  jam: "srcPat",
  ht: "srcKre",
};

export const localizedSrc = (
  sources: LocalizedSources,
  lang: PanelLang,
): string | undefined =>
  sources[LANG_SOURCE[lang]] ?? sources.src ?? sources.srcEn;

export const trackArt = (
  image: LocalizedImage | undefined,
  lang: PanelLang,
): PanelIcon | null => {
  if (!image) return null;
  const src = localizedSrc(image, lang);
  return src ? { src, width: image.width, height: image.height } : null;
};
