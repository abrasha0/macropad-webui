const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: "var(--accent)",
    color: "#000",
    fontWeight: 600,
    border: "none",
  },
  secondary: {
    background: "var(--bg-surface)",
    color: "var(--text-primary)",
    border: "1px solid var(--border)",
  },
  danger: {
    background: "var(--danger-bg)",
    color: "var(--danger)",
    border: "1px solid var(--danger)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-muted)",
    border: "none",
  },
};

export default function Button({
  children,
  variant = "primary",
  style,
  ...props
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  style?: React.CSSProperties;
  [key: string]: any;
}) {
  return (
    <button
      style={{
        padding: "var(--space-2) var(--space-3)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)",
        cursor: "pointer",
        transition: "all 0.12s ease",
        fontFamily: "inherit",
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
