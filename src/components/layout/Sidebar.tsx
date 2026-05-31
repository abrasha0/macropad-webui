import { useDevice } from "../../hooks/useDevice";

const NAV = [
  { id: "layout", label: "Layout", icon: "▦" },
  { id: "macros", label: "Macros", icon: "⬡" },
  { id: "system", label: "System", icon: "⚙" },
];

export default function Sidebar({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const { isConnected, connect, disconnect } = useDevice();

  return (
    <aside
      style={{
        width: 180,
        flexShrink: 0,
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "var(--space-5) var(--space-4)",
        gap: "var(--space-4)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <div
          style={{
            width: 32,
            height: 32,
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            color: "var(--accent)",
            flexShrink: 0,
          }}
        >
          ⌨
        </div>
        <div>
          <div style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2 }}>
            macropad
          </div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            configurator
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: isConnected ? "var(--status-connected)" : "var(--status-disconnected)",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <button
        onClick={isConnected ? disconnect : connect}
        style={{
          width: "100%",
          padding: "var(--space-2) var(--space-3)",
          borderRadius: "var(--radius-md)",
          fontWeight: 600,
          fontSize: "var(--text-sm)",
          border: "none",
          cursor: "pointer",
          transition: "all 0.15s ease",
          ...(isConnected
            ? {
                background: "transparent",
                color: "var(--danger)",
                border: "1px solid var(--danger)",
              }
            : {
                background: "var(--accent)",
                color: "#000",
              }),
        }}
      >
        {isConnected ? "Disconnect device" : "Connect Device"}
      </button>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {NAV.map(({ id, label, icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-2) var(--space-4)",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "var(--text-sm)",
                transition: "all 0.12s ease",
                textAlign: "left",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                ...(active
                  ? {
                      background: "var(--bg-surface-2)",
                      borderLeft: "2px solid var(--accent)",
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                    }
                  : {}),
              }}
            >
              <span style={{ width: 16, fontSize: 14, flexShrink: 0 }}>{icon}</span>
              {label}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto" }}>
        <button
          disabled
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-2) var(--space-4)",
            borderRadius: "var(--radius-sm)",
            border: "none",
            background: "transparent",
            cursor: "not-allowed",
            fontSize: "var(--text-sm)",
            color: "var(--text-muted)",
            opacity: 0.6,
            width: "100%",
            textAlign: "left",
          }}
        >
          <span style={{ width: 16, fontSize: 14 }}>⟳</span>
          Update
        </button>
      </div>
    </aside>
  );
}
