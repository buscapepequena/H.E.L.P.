import { ScenePipe as ScenePipeConfig } from "@/types/scene";

const OUTLINE = "#3e3768";
const BRACKET_GAP = 135;

export default function ScenePipe({ pipe }: { pipe: ScenePipeConfig }) {
  const pad = 4;
  const height = pipe.bottom - pipe.top;
  const w = pipe.width;
  const svgWidth = w + pad * 2 + 6;
  const brackets = Array.from(
    { length: Math.floor((height - 30) / BRACKET_GAP) },
    (_, i) => 40 + i * BRACKET_GAP,
  );
  const gradientId = `pipe-${pipe.x}`;

  return (
    <svg
      className="pointer-events-none absolute flex"
      style={{
        left: pipe.x - w / 2 - pad,
        top: pipe.top,
        width: svgWidth,
        height: height + pad,
      }}
      viewBox={`0 0 ${svgWidth} ${height + pad}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#9e8bbd" />
          <stop offset="30%" stopColor="#e6d3e3" />
          <stop offset="55%" stopColor="#cdb6d6" />
          <stop offset="100%" stopColor="#8c78ad" />
        </linearGradient>
      </defs>
      <rect
        x={pad + 2}
        y={0}
        width={w}
        height={height}
        fill="rgba(60,40,110,0.18)"
      />
      <rect
        x={pad}
        y={-2}
        width={w}
        height={height - 8}
        fill={`url(#${gradientId})`}
        stroke={OUTLINE}
        strokeWidth={1.1}
        strokeOpacity={0.85}
      />
      {brackets.map((y) => (
        <rect
          key={y}
          x={pad - 2.5}
          y={y}
          width={w + 5}
          height={4}
          rx={1}
          fill="#b7a2c9"
          stroke={OUTLINE}
          strokeWidth={0.9}
          strokeOpacity={0.85}
        />
      ))}
      <path
        d={`M ${pad} ${height - 10} L ${pad + w} ${height - 10} L ${pad + w + 6} ${height - 1} L ${pad + 2} ${height - 1} Z`}
        fill={`url(#${gradientId})`}
        stroke={OUTLINE}
        strokeWidth={1.1}
        strokeOpacity={0.85}
        strokeLinejoin="round"
      />
    </svg>
  );
}
