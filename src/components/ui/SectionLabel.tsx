export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        fontWeight: 500,
        marginBottom: "var(--space-2)",
      }}
    >
      {children}
    </div>
  );
}
