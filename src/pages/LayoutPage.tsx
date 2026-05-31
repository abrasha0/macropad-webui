import ProfileList from "../components/layout-view/ProfileList";
import KeyGrid from "../components/layout-view/KeyGrid";
import BindingPanel from "../components/layout-view/BindingPanel";

export default function LayoutPage({
  macros,
  strings,
  onAddMacro,
}: {
  macros: any[];
  strings: string[];
  onAddMacro: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "var(--space-4)",
        height: "100%",
        minHeight: 0,
      }}
    >
      <div style={{ width: 200, flexShrink: 0, minWidth: 0, overflowY: "auto" }}>
        <ProfileList />
      </div>
      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 0,
        }}
      >
        <KeyGrid macros={macros} strings={strings} />
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          overflowY: "auto",
          minHeight: 0,
        }}
      >
        <BindingPanel macros={macros} strings={strings} onAddMacro={onAddMacro} />
      </div>
    </div>
  );
}
