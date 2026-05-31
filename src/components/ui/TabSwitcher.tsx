export default function TabSwitcher({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
      }}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              padding: "var(--space-2) var(--space-3)",
              border: "none",
              cursor: "pointer",
              fontSize: "var(--text-sm)",
              background: active ? "var(--bg-surface-2)" : "transparent",
              color: active ? "var(--text-primary)" : "var(--text-muted)",
              fontFamily: "inherit",
              transition: "all 0.12s ease",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
