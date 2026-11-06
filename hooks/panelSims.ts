import { FramedImage, SimSlot } from "@/types/panel";

export const SIM_BORDER: FramedImage = {
  src: "/images/bordersims.png",
  width: 1566,
  height: 1004,
  hole: { x: 72, y: 98, width: 1420, height: 785 },
};

export const SIM_SLOTS: SimSlot[] = Array.from({ length: 8 }, (_, i) => ({
  id: `sim-${i + 1}`,
}));
