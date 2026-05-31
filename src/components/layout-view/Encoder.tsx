export default function Encoder({
  animRotation = 0,
  animActive = false,
}: {
  animRotation?: number;
  animActive?: boolean;
}) {
  const cx = 48;
  const cy = 48;
  const outerR = 36;
  const markerR = 3;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-1)" }}>
      <svg width={96} height={96} viewBox="0 0 96 96">
        <g
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 0.15s ease-out",
            transform: `rotate(${animRotation}deg)`,
          }}
        >
          <circle
            cx={cx}
            cy={cy}
            r={outerR}
            fill="none"
            stroke={animActive ? "var(--accent)" : "var(--border)"}
            strokeWidth={3}
          />
          <circle
            cx={cx}
            cy={cy}
            r={outerR - 8}
            fill={animActive ? "var(--accent-glow)" : "var(--bg-surface)"}
            stroke="none"
          />
          <circle
            cx={cx}
            cy={cy - outerR + 8}
            r={markerR}
            fill={animActive ? "var(--accent)" : "var(--text-muted)"}
          />
        </g>
      </svg>
      <span
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          textTransform: "uppercase",
        }}
      >
        VOL / MEDIA
      </span>
    </div>
  );
}
