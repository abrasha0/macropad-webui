import { getKeyDisplayString } from "../../utils/binding";

export default function KeyCap({
  label: rawLabel,
  selected,
  pressed,
  onClick,
  macros,
}: {
  label: string;
  selected: boolean;
  pressed: boolean;
  onClick: () => void;
  macros: any[];
}) {
  const display = getKeyDisplayString(rawLabel, macros);

  return (
    <button
      onClick={onClick}
      style={{
        width: 56,
        height: 56,
        background: pressed
          ? "var(--bg-surface)"
          : "var(--bg-surface-2)",
        border: `${selected ? "1.5px" : "1px"} solid ${
          selected || pressed ? "var(--accent)" : "var(--border)"
        }`,
        borderRadius: "var(--radius-md)",
        boxShadow: selected
          ? "var(--shadow-accent), var(--shadow-key)"
          : "var(--shadow-key)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: "var(--text-sm)",
        fontWeight: 500,
        color: selected || pressed ? "var(--text-accent)" : "var(--text-primary)",
        transition: "transform 80ms ease, border-color 80ms ease",
        transform: pressed ? "scale(0.95)" : "scale(1)",
      }}
    >
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "90%",
          fontSize: "10px",
          lineHeight: 1.2,
          textAlign: "center",
        }}
      >
        {display}
      </span>
    </button>
  );
}
