export default function Badge({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        fontSize: "var(--text-xs)",
        padding: "2px 6px",
        color: "var(--text-secondary)",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
