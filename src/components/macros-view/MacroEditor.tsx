import { useMacro } from "../../hooks/useMacro";
import { useDevice } from "../../hooks/useDevice";
import ActionCard from "./ActionCard";
import AddActionButton from "./AddActionButton";

export default function MacroEditor() {
  const { macros, selectedMacro, handleUpdateMacroSteps, handleUpdateMacroName, handleRunMacro, handleSaveMacros } = useMacro();
  const { isConnected } = useDevice();

  const macro = selectedMacro !== null ? macros[selectedMacro] : null;

  if (!macro) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "var(--text-muted)",
          fontSize: "var(--text-sm)",
        }}
      >
        Select a macro from the library
      </div>
    );
  }

  const steps = macro.steps || [];

  const updateStep = (idx: number, s: any) => {
    const updated = steps.map((x: any, i: number) => (i === idx ? s : x));
    handleUpdateMacroSteps(selectedMacro, updated);
  };

  const removeStep = (idx: number) => {
    handleUpdateMacroSteps(
      selectedMacro,
      steps.filter((_: any, i: number) => i !== idx)
    );
  };

  const addStep = () => {
    handleUpdateMacroSteps(selectedMacro, [
      ...steps,
      { keycode: 0, delay: 50 },
    ]);
  };

  const isModified = true;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flex: 1 }}>
          <input
            value={macro.name}
            onChange={(e) => handleUpdateMacroName(selectedMacro, e.target.value)}
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 600,
              color: "var(--text-primary)",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid transparent",
              outline: "none",
              fontFamily: "inherit",
              flex: 1,
            }}
            onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--accent)")}
            onBlur={(e) => (e.currentTarget.style.borderBottomColor = "transparent")}
          />
          {isModified && (
            <span
              style={{
                background: "rgba(250, 204, 21, 0.15)",
                color: "var(--warning)",
                border: "1px solid rgba(250,204,21,0.3)",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--text-xs)",
                padding: "2px 8px",
                whiteSpace: "nowrap",
                opacity: 0,
                animation: "unsavedFadeIn 100ms ease forwards",
              }}
            >
              Unsaved Changes
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button
            onClick={() => handleRunMacro(selectedMacro)}
            disabled={!isConnected || steps.length === 0}
            style={{
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
              cursor: isConnected && steps.length > 0 ? "pointer" : "not-allowed",
              fontSize: "var(--text-sm)",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-1)",
              opacity: isConnected && steps.length > 0 ? 1 : 0.4,
            }}
          >
            ▶ Test
          </button>
          <button
            onClick={handleSaveMacros}
            disabled={!isConnected}
            style={{
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "var(--accent)",
              color: "#000",
              fontWeight: 600,
              cursor: isConnected ? "pointer" : "not-allowed",
              fontSize: "var(--text-sm)",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-1)",
              opacity: isConnected ? 1 : 0.4,
            }}
          >
            💾 Save
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 999,
            fontSize: "var(--text-xs)",
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "3px 10px",
          }}
        >
          TRIGGER: KEY {selectedMacro}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
          flex: 1,
          overflowY: "auto",
        }}
      >
        {steps.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "var(--space-6)",
              color: "var(--text-muted)",
              fontSize: "var(--text-sm)",
            }}
          >
            No actions defined. Add your first action below.
          </div>
        )}

        {steps.map((step: any, i: number) => {
          const isDelay = step.keycode === 0;
          return (
            <ActionCard
              key={i}
              type={isDelay ? "delay" : "keystroke"}
              keystroke={isDelay ? undefined : String(step.keycode)}
              delay={isDelay ? step.delay : undefined}
              onChangeKeystroke={(v) =>
                updateStep(i, { ...step, keycode: v || 0 })
              }
              onChangeDelay={(v) =>
                updateStep(i, { ...step, delay: v })
              }
              onRemove={() => removeStep(i)}
            />
          );
        })}

        <AddActionButton onClick={addStep} />
      </div>

      <style>{`
        @keyframes unsavedFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
