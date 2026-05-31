export default function AddActionButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "var(--space-3)",
        borderRadius: "var(--radius-md)",
        border: "1px dashed var(--border)",
        background: "var(--bg-surface)",
        cursor: "pointer",
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)",
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-2)",
        transition: "all 0.12s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--text-primary)";
        e.currentTarget.style.borderColor = "var(--accent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text-muted)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <span>+</span>
      Add Action
    </button>
  );
}
