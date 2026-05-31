import { useState, useCallback, useEffect } from "react";
import { useLayout } from "../../hooks/useLayout";
import { useDevice } from "../../hooks/useDevice";
import SectionLabel from "../ui/SectionLabel";
import Badge from "../ui/Badge";
import { Keyboard, Play, Disc3, Trash2, Save } from "lucide-react";
import { MEDIA_MAP } from "../../constants/hidCodes";

const BINDING_TABS = [
  { id: "keystroke", label: "Keystroke" },
  { id: "macro", label: "Macro" },
  { id: "media", label: "Media" },
];

const ENCODER_ACTIONS = [
  { id: "left", label: "Rotate Left" },
  { id: "right", label: "Rotate Right" },
  { id: "button", label: "Press" },
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
  const { layers, activeLayer, activeKey, activeEncoderAction, setActiveKey, setActiveEncoderAction, updateKey, updateEncoder } = useLayout();
  const { isConnected } = useDevice();

  // ---- ALL hooks unconditionally ----
  const [bindingTab, setBindingTab] = useState("keystroke");
  const [mods, setMods] = useState({ CTRL: false, ALT: false, SHIFT: false, WIN: false });
  const [savedStatus, setSavedStatus] = useState(false);
  const [encAction, setEncAction] = useState("left");

  // Dismiss on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeEncoderAction) setActiveEncoderAction(null);
        else if (activeKey) setActiveKey(null);
      }
    };
    if (activeKey || activeEncoderAction) {
      addEventListener("keydown", onKey);
      return () => removeEventListener("keydown", onKey);
    }
  }, [activeKey, activeEncoderAction, setActiveKey, setActiveEncoderAction]);

  const encoder = layers[activeLayer]?.encoder;

  const current = String(
    activeKey ? (layers[activeLayer]?.keys?.[activeKey.rIdx]?.[activeKey.cIdx] || "") : ""
  );
  const baseKey = current.split("+").pop() || "";
  const isMacroBinding = current.startsWith("M:");

  const commit = useCallback(
    (val: string) => {
      if (!activeKey) return;
      updateKey(activeKey.rIdx, activeKey.cIdx, val);
    },
    [activeKey, updateKey]
  );

  const buildBinding = useCallback(
    (key: string) => {
      if (!activeKey) return;
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
    [commit, mods, activeKey]
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
    if (activeEncoderAction) setActiveEncoderAction(null);
    else if (activeKey) setActiveKey(null);
  }, [activeEncoderAction, activeKey, setActiveKey, setActiveEncoderAction]);

  const row = activeKey ? activeKey.rIdx + 1 : 0;
  const col = activeKey ? activeKey.cIdx + 1 : 0;

  // ── Placeholder (nothing selected) ──
  if (!activeKey && !activeEncoderAction) {
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
        Select a key or encoder to edit binding
      </div>
    );
  }

  // ── Encoder mode ──
  if (activeEncoderAction) {
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
            Encoder Binding
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Badge>ENC</Badge>
            <button
              onClick={dismiss}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                fontSize: "var(--text-sm)",
                fontFamily: "inherit",
                lineHeight: 1,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              ✕
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {ENCODER_ACTIONS.map((a) => (
            <button
              key={a.id}
              onClick={() => setEncAction(a.id)}
              style={{
                flex: 1,
                padding: "var(--space-2)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid",
                cursor: "pointer",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                fontFamily: "inherit",
                transition: "all 0.12s ease",
                ...(encAction === a.id
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
              {a.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          {/* Vertical tool column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              width: 24,
              flexShrink: 0,
              paddingTop: "var(--space-1)",
              paddingBottom: "var(--space-1)",
            }}
          >
            {BINDING_TABS.map((t) => {
              const Icon = t.id === "keystroke" ? Keyboard : t.id === "macro" ? Play : Disc3;
              return (
                <button
                  key={t.id}
                  onClick={() => setBindingTab(t.id)}
                  title={t.label}
                  style={{
                    width: 22,
                    height: 22,
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    background:
                      bindingTab === t.id ? "var(--accent)" : "transparent",
                    color:
                      bindingTab === t.id ? "#000" : "var(--text-muted)",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.1s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (bindingTab !== t.id)
                      e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    if (bindingTab !== t.id)
                      e.currentTarget.style.color = "var(--text-muted)";
                  }}
                >
                  <Icon size={13} />
                </button>
              );
            })}

            <div style={{ flex: 1 }} />

            <button
              onClick={dismiss}
              title="Done"
              style={{
                width: 22,
                height: 22,
                border: "none",
                borderRadius: "var(--radius-sm)",
                background: "transparent",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.1s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              <Save size={13} />
            </button>
          </div>

          <div
            style={{
              flex: 1,
              minWidth: 0,
              marginLeft: "var(--space-2)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            {bindingTab === "keystroke" && (
              <div>
                <SectionLabel>Key</SectionLabel>
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
                  <input
                    value={encoder?.[encAction] || ""}
                    onChange={(e) => updateEncoder(encAction, e.target.value)}
                    placeholder="Type key name..."
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "var(--text-primary)",
                      fontSize: "var(--text-sm)",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>
            )}

            {bindingTab === "macro" && (
              <div>
                <SectionLabel>Assign Macro</SectionLabel>
                <select
                  value={encoder?.[encAction]?.startsWith("M:") ? encoder[encAction] : ""}
                  onChange={(e) => {
                    if (e.target.value) updateEncoder(encAction, e.target.value);
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
                      onClick={() => updateEncoder(encAction, key)}
                      style={{
                        padding: "var(--space-2)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border)",
                        background: "var(--bg-surface)",
                        cursor: "pointer",
                        color: "var(--text-primary)",
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
          </div>
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

  // ── Key mode ──
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
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Badge>{`${row}, ${col}`}</Badge>
          <button
            onClick={dismiss}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              fontSize: "var(--text-sm)",
              fontFamily: "inherit",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            ✕
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Vertical tool column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            width: 24,
            flexShrink: 0,
            paddingTop: "var(--space-1)",
            paddingBottom: "var(--space-1)",
          }}
        >
          {BINDING_TABS.map((t) => {
            const Icon = t.id === "keystroke" ? Keyboard : t.id === "macro" ? Play : Disc3;
            return (
              <button
                key={t.id}
                onClick={() => setBindingTab(t.id)}
                title={t.label}
                style={{
                  width: 22,
                  height: 22,
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  background:
                    bindingTab === t.id ? "var(--accent)" : "transparent",
                  color:
                    bindingTab === t.id ? "#000" : "var(--text-muted)",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.1s ease",
                }}
                onMouseEnter={(e) => {
                  if (bindingTab !== t.id)
                    e.currentTarget.style.color = "var(--text-secondary)";
                }}
                onMouseLeave={(e) => {
                  if (bindingTab !== t.id)
                    e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                <Icon size={13} />
              </button>
            );
          })}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Clear */}
          <button
            onClick={handleClear}
            title="Clear binding"
            style={{
              width: 22,
              height: 22,
              border: "none",
              borderRadius: "var(--radius-sm)",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.1s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <Trash2 size={13} />
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            title="Save binding"
            style={{
              width: 22,
              height: 22,
              border: "none",
              borderRadius: "var(--radius-sm)",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.1s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <Save size={13} />
          </button>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            marginLeft: "var(--space-2)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
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
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
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
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                {["CTRL", "ALT", "SHIFT", "WIN"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMods((prev) => ({ ...prev, [m]: !prev[m as keyof typeof prev] }))}
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
                    border: `1px solid ${current === key ? "var(--accent)" : "var(--border)"}`,
                    background: current === key ? "var(--accent-glow)" : "var(--bg-surface)",
                    cursor: "pointer",
                    color: current === key ? "var(--text-accent)" : "var(--text-primary)",
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
      </div>

      {savedStatus && (
        <div
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--accent)",
            textAlign: "center",
            marginTop: "auto",
          }}
        >
          Saved ✓
        </div>
      )}

      <style>{`
        @keyframes bindingSlideIn {
          from { opacity: 0; transform: translateX(8px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
