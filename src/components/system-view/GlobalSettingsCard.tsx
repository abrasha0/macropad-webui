import SegmentedControl from "../ui/SegmentedControl";

export default function GlobalSettingsCard() {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-5)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          paddingBottom: "var(--space-3)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span style={{ fontSize: 16, color: "var(--text-primary)" }}>⚡</span>
        <span
          style={{
            fontSize: "var(--text-md)",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Global Settings
        </span>
      </div>

      <div>
        <div
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--text-muted)",
            marginBottom: "var(--space-2)",
          }}
        >
          Bluetooth Device Name
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            background: "var(--bg-input)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-2) var(--space-3)",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>🔗</span>
          <input
            defaultValue="MacroForge-01"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: "var(--text-sm)",
              fontFamily: "inherit",
            }}
          />
          <button
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              fontSize: 12,
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            ✏
          </button>
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--text-muted)",
            marginBottom: "var(--space-2)",
          }}
        >
          WebUI Theme
        </div>
        <SegmentedControl
          options={["Light", "Dark", "System"]}
          selected="Dark"
          onChange={() => {}}
        />
      </div>
    </div>
  );
}
