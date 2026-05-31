import { useState } from "react";

export default function Input({
  style,
  ...props
}: {
  style?: React.CSSProperties;
  [key: string]: any;
}) {
  return (
    <input
      style={{
        background: "var(--bg-input)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-2) var(--space-3)",
        color: "var(--text-primary)",
        fontSize: "var(--text-sm)",
        outline: "none",
        fontFamily: "inherit",
        transition: "border-color 0.12s ease",
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        props.onBlur?.(e);
      }}
      {...props}
    />
  );
}
