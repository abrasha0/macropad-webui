const TYPE_STYLES: Record<string, { border: string; label: string; icon: string }> = {
  keystroke: {
    border: "var(--action-keystroke)",
    label: "KEYSTROKE SEQUENCE",
    icon: "⌨",
  },
  delay: {
    border: "var(--action-delay)",
    label: "DELAY",
    icon: "⏱",
  },
  media: {
    border: "var(--action-media)",
    label: "MEDIA ACTION",
    icon: "🎵",
  },
};

export default function ActionCard({
  type,
  keystroke,
  delay,
  onChangeKeystroke,
  onChangeDelay,
  onRemove,
}: {
  type: "keystroke" | "delay" | "media";
  keystroke?: string;
  delay?: number;
  onChangeKeystroke?: (v: string) => void;
  onChangeDelay?: (v: number) => void;
  onRemove: () => void;
}) {
  const style = TYPE_STYLES[type];

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        borderLeft: `3px solid ${style.border}`,
        padding: "var(--space-3)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <span style={{ fontSize: 14, color: style.border }}>{style.icon}</span>
          <span
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {style.label}
          </span>
        </div>
        <button
          onClick={onRemove}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            fontSize: 14,
            padding: 2,
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          🗑
        </button>
      </div>

      {type === "keystroke" && (
        <input
          value={keystroke || ""}
          onChange={(e) => onChangeKeystroke?.(e.target.value)}
          placeholder="e.g. git add . ENTER"
          style={{
            width: "100%",
            background: "var(--bg-input)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "var(--space-2) var(--space-3)",
            color: "var(--text-code)",
            fontSize: "var(--text-sm)",
            fontFamily: "var(--font-mono)",
            outline: "none",
          }}
        />
      )}

      {type === "delay" && (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <input
            type="number"
            value={delay || 0}
            onChange={(e) => onChangeDelay?.(Math.max(0, parseInt(e.target.value) || 0))}
            style={{
              width: 60,
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "var(--space-1) var(--space-2)",
              color: "var(--text-primary)",
              fontSize: "var(--text-sm)",
              fontFamily: "inherit",
              outline: "none",
            }}
          />
          <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>ms</span>
        </div>
      )}
    </div>
  );
}
