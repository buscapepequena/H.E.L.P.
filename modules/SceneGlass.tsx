import { SceneGlass as SceneGlassConfig } from "@/types/scene";

export default function SceneGlass({
  pane,
  index,
}: {
  pane: SceneGlassConfig;
  index: number;
}) {
  return (
    <div
      className="pointer-events-none absolute flex overflow-hidden"
      style={{
        left: pane.x,
        top: pane.y,
        width: pane.width,
        height: pane.height,
        backdropFilter: pane.frosted ? "blur(0.5px)" : "none",
        WebkitBackdropFilter: pane.frosted ? "blur(0.5px)" : "none",
        background: pane.frosted
          ? "rgba(220,214,240,0.08)"
          : "linear-gradient(160deg, rgba(210,215,255,0.05) 0%, rgba(130,115,200,0.06) 100%)",
      }}
    >
      <div
        className="absolute inset-0 flex"
        style={{
          background:
            "linear-gradient(115deg, transparent 0%, transparent 20%, rgba(255,255,255,0.1) 23%, transparent 28%, transparent 100%)",
          mixBlendMode: "screen",
        }}
      />
      <div
        className="glass-sheen absolute inset-y-0 flex w-[50%]"
        style={{
          left: "-60%",
          background:
            "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
          mixBlendMode: "screen",
          animationDelay: `${index * 0.35}s`,
        }}
      />
    </div>
  );
}
