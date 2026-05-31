import MacroLibrary from "../components/macros-view/MacroLibrary";
import MacroEditor from "../components/macros-view/MacroEditor";

export default function MacrosPage() {
  return (
    <div
      style={{
        display: "flex",
        gap: "var(--space-4)",
        height: "100%",
        minHeight: 0,
      }}
    >
      <div style={{ width: 280, flexShrink: 0 }}>
        <MacroLibrary />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <MacroEditor />
      </div>
    </div>
  );
}
