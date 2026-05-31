import { useDevice } from "../../hooks/useDevice";

export default function DeviceInfoCard() {
  const { deviceInfo, isConnected } = useDevice();

  const rows = [
    { label: "Architecture", value: deviceInfo?.architecture || "\u2014", accent: false },
    { label: "Firmware Version", value: deviceInfo?.version || "\u2014", accent: true },
    { label: "Build Date", value: deviceInfo?.buildDate || "\u2014", accent: false },
  ];

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
        <span style={{ fontSize: 16, color: "var(--text-primary)" }}>⚙</span>
        <span
          style={{
            fontSize: "var(--text-md)",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Device Info
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {rows.map((row, i) => (
          <div key={row.label}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "var(--space-3) 0",
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--text-muted)",
                }}
              >
                {row.label}
              </span>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: row.accent ? "var(--text-accent)" : "var(--text-primary)",
                  fontWeight: row.accent ? 600 : 400,
                }}
              >
                {row.value}
              </span>
            </div>
            {i < rows.length - 1 && (
              <div
                style={{
                  height: 1,
                  background: "var(--border-subtle)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {!isConnected && (
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-2)",
            borderRadius: "var(--radius-sm)",
            background: "var(--bg-surface-2)",
            fontSize: "var(--text-xs)",
            color: "var(--text-muted)",
          }}
        >
          Connect device to see info
        </div>
      )}
    </div>
  );
}
