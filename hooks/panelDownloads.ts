import { DownloadPlatform } from "@/types/panel";

export const DOWNLOAD_PLATFORMS: DownloadPlatform[] = [
  {
    id: "linux",
    name: "Linux",
    icon: { src: "/images/linux.png", width: 514, height: 607 },
    visible: { x: 6, y: 4, width: 505, height: 593 },
    scale: 1,
  },
  {
    id: "mac",
    name: "macOS",
    icon: { src: "/images/mac.png", width: 504, height: 603 },
    visible: { x: 1, y: 5, width: 499, height: 587 },
    scale: 1,
  },
  {
    id: "windows",
    name: "Windows",
    icon: { src: "/images/windows.png", width: 607, height: 480 },
    visible: { x: 6, y: 6, width: 597, height: 472 },
    scale: 0.86,
  },
];
