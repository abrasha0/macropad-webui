import { useLayout } from "../../hooks/useLayout";
import { useDevice } from "../../hooks/useDevice";

export default function Encoder({
  animRotation = 0,
  animActive = false,
}: {
  animRotation?: number;
  animActive?: boolean;
}) {
  const { layers, activeLayer } = useLayout();
  const { activeKeysMap } = useDevice();
  const encoder = layers[activeLayer]?.encoder;
  const physLeft = !!activeKeysMap["enc-left"];
  const physRight = !!activeKeysMap["enc-right"];
  const physPress = !!activeKeysMap["enc-button"];
  const active = physLeft || physRight || physPress || animActive;
  const rotation = physLeft ? -20 : physRight ? 20 : animRotation;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      {/* Rotation bindings (left | right) */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-3)",
          fontSize: 9,
          lineHeight: 1.2,
          textAlign: "center",
        }}
      >
        <span style={{ color: "var(--text-muted)", width: 48 }}>
          {encoder?.left || "\u2014"}
        </span>
        <span style={{ color: "var(--text-muted)", width: 48 }}>
          {encoder?.right || "\u2014"}
        </span>
      </div>

      {/* Round knob — consistent with KeyCap styling */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: active ? "var(--bg-surface)" : "var(--bg-surface-2)",
          border: `${active ? "1.5px" : "1px"} solid ${
            active ? "var(--accent)" : "var(--border)"
          }`,
          boxShadow: active
            ? "var(--shadow-accent), var(--shadow-key)"
            : "var(--shadow-key)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "transform 80ms ease, border-color 80ms ease, box-shadow 80ms ease",
          transform: physPress ? "scale(0.92)" : "scale(1)",
        }}
      >
        <svg width={40} height={40} viewBox="0 0 40 40">
          <g
            style={{
              transformOrigin: "20px 20px",
              transition: "transform 0.15s ease-out",
              transform: `rotate(${rotation}deg)`,
            }}
          >
            {/* Outer ring */}
            <circle
              cx={20}
              cy={20}
              r={14}
              fill="none"
              stroke={active ? "var(--accent)" : "var(--text-muted)"}
              strokeWidth={1.5}
            />
            {/* Inner fill */}
            <circle
              cx={20}
              cy={20}
              r={10}
              fill={active ? "var(--accent-glow)" : "var(--bg-surface)"}
              stroke="none"
            />
            {/* Top marker dot */}
            <circle
              cx={20}
              cy={7}
              r={2}
              fill={active ? "var(--accent)" : "var(--text-muted)"}
            />
          </g>
        </svg>
      </div>

      {/* Click binding */}
      <div
        style={{
          fontSize: 9,
          lineHeight: 1.2,
          color: "var(--text-muted)",
          width: 48,
          textAlign: "center",
        }}
      >
        {encoder?.button || "\u2014"}
      </div>
    </div>
  );
}
