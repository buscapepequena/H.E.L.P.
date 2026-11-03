import { SceneStitch } from "@/types/scene";

const jitter = (seed: number): number => {
  const v = Math.sin(seed * 12.9898) * 43758.5453;
  return v - Math.floor(v) - 0.5;
};

export default function SceneStitches({ seam }: { seam: SceneStitch }) {
  const height = seam.bottom - seam.top;
  const twistId = `stitch-twist-${seam.x}`;
  const fiberId = `stitch-fiber-${seam.x}`;
  const half = 6;
  const width = half * 2 + 4;
  const count = Math.floor(height / seam.spacing);
  const stitches = Array.from({ length: count }, (_, i) => {
    const y = i * seam.spacing + seam.spacing / 2;
    const reach = 3.6 + jitter(i + 1) * 0.9;
    const dy = jitter(i + 31) * 0.5;
    const dx = jitter(i + 57) * 0.6;
    return {
      x1: half + 2 - reach + dx,
      y1: y + dy,
      x2: half + 2 + reach + dx,
      y2: y + dy,
    };
  });

  return (
    <svg
      className="pointer-events-none absolute flex"
      style={{
        left: seam.x - half - 2,
        top: seam.top,
        width,
        height,
        opacity: seam.opacity,
      }}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <pattern
          id={twistId}
          width={1.4}
          height={1.4}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(55)"
        >
          <rect width={1.4} height={1.4} fill="#8e1b2c" />
          <rect width={0.55} height={1.4} fill="#b8344a" />
          <rect x={0.95} width={0.25} height={1.4} fill="#5e0f1c" />
        </pattern>
        <filter id={fiberId} x="-20%" y="-50%" width="140%" height="200%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.6"
            numOctaves={2}
            seed={7}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={0.7}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      {stitches.map((s, i) => (
        <g key={i}>
          <circle cx={s.x1} cy={s.y1} r={0.85} fill="#2e0910" opacity={0.65} />
          <circle cx={s.x2} cy={s.y2} r={0.85} fill="#2e0910" opacity={0.65} />
          <line
            x1={s.x1}
            y1={s.y1 + 0.75}
            x2={s.x2}
            y2={s.y2 + 0.75}
            stroke="#2e0910"
            strokeWidth={1.4}
            strokeLinecap="round"
            opacity={0.4}
          />
          <g filter={`url(#${fiberId})`}>
            <line
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke={`url(#${twistId})`}
              strokeWidth={1.4}
              strokeLinecap="round"
            />
            <line
              x1={s.x1 + 0.4}
              y1={s.y1 - 0.38}
              x2={s.x2 - 0.4}
              y2={s.y2 - 0.38}
              stroke="#e0788a"
              strokeWidth={0.3}
              strokeLinecap="round"
              opacity={0.45}
            />
          </g>
        </g>
      ))}
    </svg>
  );
}
