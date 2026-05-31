import { useLayout } from "../../hooks/useLayout";
import SectionLabel from "../ui/SectionLabel";

export default function ProfileList() {
  const { layers, activeLayer, handleLayerChange } = useLayout();

  const tags = ["Default", "Editing", "Gaming", "", ""];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-1)",
      }}
    >
      <SectionLabel>PROFILES</SectionLabel>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {layers.map((layer: any, i: number) => {
          const active = activeLayer === i;
          return (
            <button
              key={i}
              onClick={() => handleLayerChange(i)}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "var(--space-2) var(--space-3)",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: active ? "rgba(200,255,0,0.08)" : "transparent",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                transition: "all 0.12s ease",
                ...(active
                  ? { borderLeft: "2px solid var(--accent)" }
                  : {}),
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "var(--bg-surface)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 500,
                  color: active ? "var(--text-accent)" : "var(--text-primary)",
                }}
              >
                {layer.name}
              </span>
              {tags[i] && (
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                  }}
                >
                  ({tags[i]})
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        disabled
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-2)",
          marginTop: "var(--space-1)",
          border: "1px dashed var(--border)",
          borderRadius: "var(--radius-md)",
          background: "transparent",
          cursor: "not-allowed",
          color: "var(--text-muted)",
          fontSize: "var(--text-sm)",
          fontFamily: "inherit",
          opacity: 0.6,
        }}
      >
        +
      </button>
    </div>
  );
}
