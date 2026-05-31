import { useState, useCallback } from "react";
import { useLayout } from "../../hooks/useLayout";
import { useDevice } from "../../hooks/useDevice";
import TabSwitcher from "../ui/TabSwitcher";
import SectionLabel from "../ui/SectionLabel";
import Badge from "../ui/Badge";
import { MEDIA_MAP } from "../../constants/hidCodes";

const BINDING_TABS = [
  { id: "keystroke", label: "Keystroke" },
  { id: "macro", label: "Macro" },
  { id: "media", label: "Media" },
];

export default function BindingPanel({
  macros,
  strings,
  onAddMacro,
}: {
  macros: any[];
  strings: string[];
  onAddMacro: () => void;
}) {
  const { layers, activeLayer, activeKey, setActiveKey, updateKey } = useLayout();
  const { isConnected } = useDevice();
  const [bindingTab, setBindingTab] = useState("keystroke");
  const [mods, setMods] = useState({ CTRL: false, ALT: false, SHIFT: false, WIN: false });
  const [savedStatus, setSavedStatus] = useState(false);

  if (!activeKey) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "var(--text-muted)",
          fontSize: "var(--text-sm)",
          textAlign: "center",
          padding: "var(--space-4)",
        }}
      >
        Select a key to edit binding
      </div>
    );
  }

  const current = String(
    layers[activeLayer]?.keys?.[activeKey.rIdx]?.[activeKey.cIdx] || ""
  );
  const baseKey = current.split("+").pop() || "";
  const isMedia = MEDIA_MAP[current] !== undefined;
  const isMacroBinding = current.startsWith("M:");

  const commit = useCallback(
    (val: string) => {
      updateKey(activeKey.rIdx, activeKey.cIdx, val);
    },
    [activeKey, updateKey]
  );

  const buildBinding = useCallback(
    (key: string) => {
      if (key.startsWith("M:") || key.startsWith("L") || MEDIA_MAP[key]) {
        commit(key);
        return;
      }
      const activeMods = Object.entries(mods)
        .filter(([, v]) => v)
        .map(([k]) => k);
      if (activeMods.length > 0) {
        commit(activeMods.join("+") + "+" + key);
      } else {
        commit(key);
      }
    },
    [commit, mods]
  );

  const handleSave = useCallback(() => {
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 1500);
  }, []);

  const handleClear = useCallback(() => {
    commit("");
    setMods({ CTRL: false, ALT: false, SHIFT: false, WIN: false });
  }, [commit]);

  const dismiss = useCallback(() => {
    setActiveKey(null);
  }, [setActiveKey]);

  const row = activeKey.rIdx + 1;
  const col = activeKey.cIdx + 1;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        height: "100%",
        animation: "bindingSlideIn 120ms ease-out",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Binding: Key {row * 4 + col - 3}
        </span>
        <Badge>{`${row}, ${col}`}</Badge>
      </div>

      <TabSwitcher
        tabs={BINDING_TABS}
        activeTab={bindingTab}
        onTabChange={setBindingTab}
      />

      <div
        style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}
      >
        {bindingTab === "keystroke" && (
          <>
            <div>
              <SectionLabel>Primary Key</SectionLabel>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  background: "var(--bg-input)",
                  border: "1px solid var(--accent)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-2) var(--space-3)",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontSize: "var(--text-sm)",
                    color: "var(--text-primary)",
                  }}
                >
                  {baseKey || "\u2014"}
                </span>
                <button
                  onClick={handleClear}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    fontSize: "var(--text-sm)",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--danger)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--text-muted)")
                  }
                >
                  ×
                </button>
              </div>
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                  fontStyle: "italic",
                  marginTop: 4,
                }}
              >
                Click to record a new key
              </div>
            </div>

            <div>
              <SectionLabel>Modifiers</SectionLabel>
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-2)",
                }}
              >
                {["CTRL", "ALT", "SHIFT", "WIN"].map((m) => (
                  <button
                    key={m}
                    onClick={() =>
                      setMods((prev) => ({ ...prev, [m]: !prev[m as keyof typeof prev] }))
                    }
                    style={{
                      flex: 1,
                      padding: "var(--space-1) var(--space-2)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid",
                      cursor: "pointer",
                      fontSize: "var(--text-xs)",
                      fontWeight: 600,
                      fontFamily: "inherit",
                      transition: "all 0.12s ease",
                      ...(mods[m as keyof typeof mods]
                        ? {
                            background: "var(--accent)",
                            color: "#000",
                            borderColor: "var(--accent)",
                          }
                        : {
                            background: "var(--bg-surface)",
                            color: "var(--text-secondary)",
                            borderColor: "var(--border)",
                          }),
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {bindingTab === "macro" && (
          <div>
            <SectionLabel>Assign Macro</SectionLabel>
            <select
              value={isMacroBinding ? current : ""}
              onChange={(e) => {
                if (e.target.value) commit(e.target.value);
              }}
              style={{
                width: "100%",
                background: "var(--bg-input)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-2) var(--space-3)",
                color: "var(--text-primary)",
                fontSize: "var(--text-sm)",
                fontFamily: "inherit",
                outline: "none",
              }}
            >
              <option value="">None</option>
              {macros.map((m: any, i: number) => (
                <option key={i} value={`M:${i}`}>
                  {m.name || `Macro ${i}`}
                </option>
              ))}
            </select>
            {macros.length === 0 && (
              <button
                onClick={onAddMacro}
                style={{
                  marginTop: "var(--space-2)",
                  width: "100%",
                  padding: "var(--space-2)",
                  borderRadius: "var(--radius-md)",
                  border: "1px dashed var(--border)",
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  fontSize: "var(--text-sm)",
                  fontFamily: "inherit",
                }}
              >
                + Create macro
              </button>
            )}
          </div>
        )}

        {bindingTab === "media" && (
          <div>
            <SectionLabel>Media & System</SectionLabel>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "var(--space-1)",
              }}
            >
              {Object.keys(MEDIA_MAP).map((key) => (
                <button
                  key={key}
                  onClick={() => buildBinding(key)}
                  style={{
                    padding: "var(--space-2)",
                    borderRadius: "var(--radius-sm)",
                    border: `1px solid ${
                      current === key ? "var(--accent)" : "var(--border)"
                    }`,
                    background:
                      current === key ? "var(--accent-glow)" : "var(--bg-surface)",
                    cursor: "pointer",
                    color:
                      current === key
                        ? "var(--text-accent)"
                        : "var(--text-primary)",
                    fontSize: "var(--text-xs)",
                    fontFamily: "inherit",
                    transition: "all 0.12s ease",
                  }}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <SectionLabel>Display Label (Optional)</SectionLabel>
          <input
            placeholder="e.g. 'Heal'"
            style={{
              width: "100%",
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-2) var(--space-3)",
              color: "var(--text-primary)",
              fontSize: "var(--text-sm)",
              fontFamily: "inherit",
              outline: "none",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          marginTop: "auto",
        }}
      >
        <button
          onClick={handleClear}
          style={{
            flex: 1,
            padding: "var(--space-2)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            background: "transparent",
            cursor: "pointer",
            color: "var(--text-secondary)",
            fontSize: "var(--text-sm)",
            fontFamily: "inherit",
          }}
        >
          Clear
        </button>
        <button
          onClick={handleSave}
          style={{
            flex: 2,
            padding: "var(--space-3)",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "var(--accent)",
            color: "#000",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "var(--text-sm)",
            fontFamily: "inherit",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            transition: "all 0.12s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = "var(--shadow-accent)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow = "none")
          }
        >
          {savedStatus ? "Saved \u2713" : "SAVE BINDING"}
        </button>
      </div>

      <style>{`
        @keyframes bindingSlideIn {
          from { opacity: 0; transform: translateX(8px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
