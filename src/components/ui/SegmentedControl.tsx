export default function SegmentedControl({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        background: "var(--bg-input)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
      }}
    >
      {options.map((opt) => {
        const active = opt === selected;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              flex: 1,
              padding: "var(--space-2) var(--space-3)",
              border: "none",
              cursor: "pointer",
              fontSize: "var(--text-sm)",
              textAlign: "center",
              background: active ? "var(--bg-surface-2)" : "transparent",
              color: active ? "var(--text-primary)" : "var(--text-muted)",
              fontFamily: "inherit",
              transition: "all 0.12s ease",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
