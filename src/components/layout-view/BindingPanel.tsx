import { useState, useCallback, useEffect, useRef } from "react";
import { useLayout } from "../../hooks/useLayout";
import { useDevice } from "../../hooks/useDevice";
import SectionLabel from "../ui/SectionLabel";
import Badge from "../ui/Badge";
import { Keyboard, Play, Disc3, Trash2, Save } from "lucide-react";
import { KEY_CATEGORIES } from "../../constants/hidCodes";

const BINDING_TABS = [
  { id: "keystroke", label: "Keystroke" },
  { id: "macro", label: "Macro" },
];

const MODIFIERS = [
  { label: "Ctrl", mod: "Ctrl" },
  { label: "Shift", mod: "Shift" },
  { label: "Alt", mod: "Alt" },
  { label: "Win", mod: "GUI" },
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
  const {
    layers,
    activeLayer,
    activeKey,
    activeEncoderAction,
    setActiveKey,
    setActiveEncoderAction,
    updateKey,
    updateEncoder,
    isCapturing,
    setIsCapturing,
    capturedKey,
    setCapturedKey,
  } = useLayout();
  const { isConnected } = useDevice();

  // ---- ALL hooks unconditionally ----
  const [bindingTab, setBindingTab] = useState("keystroke");
  const [savedStatus, setSavedStatus] = useState(false);
  const [encAction, setEncAction] = useState("left");
  const [navExpanded, setNavExpanded] = useState(false);
  const [showKeyPicker, setShowKeyPicker] = useState(false);
  const [pickerMods, setPickerMods] = useState({ Ctrl: false, Shift: false, Alt: false, GUI: false });
  const captureRef = useRef<HTMLDivElement>(null);

  const encoder = layers[activeLayer]?.encoder;

  const current = String(
    activeKey
      ? layers[activeLayer]?.keys?.[activeKey.rIdx]?.[activeKey.cIdx] || ""
      : "",
  );
  const isMacroBinding = current.startsWith("M:");
  const isNonKeystroke = isMacroBinding || current.startsWith("T:") || /^L[0-4]$/.test(current);

  const commit = useCallback(
    (val: string) => {
      if (!activeKey) return;
      updateKey(activeKey.rIdx, activeKey.cIdx, val);
    },
    [activeKey, updateKey],
  );

  const handleSave = useCallback(() => {
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 1500);
  }, []);

  const handleClear = useCallback(() => {
    commit("");
  }, [commit]);

  const handleToggleMod = useCallback((name: string) => {
    const parts = current.split("+");
    const keyPart = parts.pop() || "";
    if (!keyPart) return;
    const existingMods = new Set(
      parts.filter((p) => ["Ctrl", "Shift", "Alt", "GUI"].includes(p))
    );
    if (existingMods.has(name)) existingMods.delete(name);
    else existingMods.add(name);
    const ordered = ["Ctrl", "Shift", "Alt", "GUI"];
    const active = ordered.filter((m) => existingMods.has(m));
    commit(active.length > 0 ? active.join("+") + "+" + keyPart : keyPart);
  }, [current, commit]);

  const dismiss = useCallback(() => {
    if (activeEncoderAction) setActiveEncoderAction(null);
    else if (activeKey) setActiveKey(null);
  }, [activeEncoderAction, activeKey, setActiveKey, setActiveEncoderAction]);

  // Auto-commit captured key from KeyGrid
  useEffect(() => {
    if (capturedKey !== null) {
      commit(capturedKey);
      setCapturedKey(null);
    }
  }, [capturedKey, commit, setCapturedKey]);

  // Dismiss on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isCapturing) {
          setIsCapturing(false);
          setCapturedKey(null);
        } else if (activeEncoderAction) setActiveEncoderAction(null);
        else if (activeKey) setActiveKey(null);
      }
    };
    if (isCapturing || activeKey || activeEncoderAction) {
      addEventListener("keydown", onKey);
      return () => removeEventListener("keydown", onKey);
    }
  }, [
    isCapturing,
    activeKey,
    activeEncoderAction,
    setActiveKey,
    setActiveEncoderAction,
    setIsCapturing,
    setCapturedKey,
  ]);

  // Capture physical keyboard keys and click-outside deactivation
  useEffect(() => {
    if (!isCapturing) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") return;
      if (["Control", "Shift", "Alt", "Meta"].includes(e.key)) return;

      e.preventDefault();
      e.stopPropagation();

      const mods: string[] = [];
      if (e.ctrlKey) mods.push("Ctrl");
      if (e.shiftKey) mods.push("Shift");
      if (e.altKey) mods.push("Alt");
      if (e.metaKey) mods.push("GUI");

      let key = e.key;
      const keyMap: Record<string, string> = {
        Escape: "Esc",
        " ": "Space",
        ArrowUp: "Up",
        ArrowDown: "Down",
        ArrowLeft: "Left",
        ArrowRight: "Right",
        Delete: "Del",
        Insert: "Ins",
        PageUp: "Page Up",
        PageDown: "Page Down",
        PrintScreen: "Print Screen",
        ScrollLock: "Scroll Lock",
        CapsLock: "Caps Lock",
        Backspace: "BS",
      };
      key = keyMap[key] || key;
      if (key.length === 1) key = key.toUpperCase();

      const binding = mods.length > 0 ? mods.join("+") + "+" + key : key;
      commit(binding);
      setIsCapturing(false);
      setCapturedKey(null);
    };

    const onMouseDown = (e: MouseEvent) => {
      if (
        captureRef.current &&
        !captureRef.current.contains(e.target as Node)
      ) {
        setIsCapturing(false);
        setCapturedKey(null);
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("mousedown", onMouseDown, true);

    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("mousedown", onMouseDown, true);
    };
  }, [isCapturing, commit, setIsCapturing, setCapturedKey]);

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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
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

        <div
          style={{
            display: "flex",
            flex: 1,
            minHeight: 0,
            flexDirection: "row-reverse",
            gap: "var(--space-4)",
          }}
        >
          {/* Vertical tool column — hover to expand — visually on the right via row-reverse */}
          <div
            onMouseEnter={() => setNavExpanded(true)}
            onMouseLeave={() => setNavExpanded(false)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              width: navExpanded ? 72 : 24,
              flexShrink: 0,
              paddingTop: "var(--space-1)",
              paddingBottom: "var(--space-1)",
              transition: "width 0.15s ease",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {BINDING_TABS.map((t) => {
              const Icon =
                t.id === "keystroke"
                  ? Keyboard
                  : t.id === "macro"
                    ? Play
                    : Disc3;
              return (
                <button
                  key={t.id}
                  onClick={() => setBindingTab(t.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    height: 22,
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    background:
                      bindingTab === t.id ? "var(--accent)" : "transparent",
                    color: bindingTab === t.id ? "#000" : "var(--text-muted)",
                    cursor: "pointer",
                    padding: "0 4px",
                    fontFamily: "inherit",
                    fontSize: "var(--text-xs)",
                    fontWeight: 500,
                    textAlign: "left",
                    transition: "all 0.1s ease",
                    flexShrink: 0,
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
                  <Icon size={13} style={{ flexShrink: 0 }} />
                  {navExpanded && <span>{t.label}</span>}
                </button>
              );
            })}

            <div style={{ flex: 1 }} />

            <button
              onClick={dismiss}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 22,
                border: "none",
                borderRadius: "var(--radius-sm)",
                background: "transparent",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "0 4px",
                fontFamily: "inherit",
                fontSize: "var(--text-xs)",
                textAlign: "left",
                transition: "all 0.1s ease",
                flexShrink: 0,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              <Save size={13} style={{ flexShrink: 0 }} />
              {navExpanded && <span>Done</span>}
            </button>
          </div>

          <div
            style={{
              flex: 1,
              minWidth: 0,
              paddingLeft: "var(--space-2)",
              paddingLeft: "var(--space-2)",
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
                  value={
                    encoder?.[encAction]?.startsWith("M:")
                      ? encoder[encAction]
                      : ""
                  }
                  onChange={(e) => {
                    if (e.target.value)
                      updateEncoder(encAction, e.target.value);
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
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
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-muted)")
            }
          >
            ✕
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          flexDirection: "row-reverse",
          gap: "var(--space-4)",
        }}
      >
        {/* Vertical tool column — hover to expand */}
        <div
          onMouseEnter={() => setNavExpanded(true)}
          onMouseLeave={() => setNavExpanded(false)}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            width: navExpanded ? 80 : 24,
            flexShrink: 0,
            paddingTop: "var(--space-1)",
            paddingBottom: "var(--space-1)",
            transition: "width 0.15s ease",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {BINDING_TABS.map((t) => {
            const Icon =
              t.id === "keystroke" ? Keyboard : t.id === "macro" ? Play : Disc3;
            return (
              <button
                key={t.id}
                onClick={() => setBindingTab(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  height: 22,
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  background:
                    bindingTab === t.id ? "var(--accent)" : "transparent",
                  color: bindingTab === t.id ? "#000" : "var(--text-muted)",
                  cursor: "pointer",
                  padding: "0 4px",
                  fontFamily: "inherit",
                  fontSize: "var(--text-xs)",
                  fontWeight: 500,
                  textAlign: "left",
                  transition: "all 0.1s ease",
                  flexShrink: 0,
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
                <Icon size={13} style={{ flexShrink: 0 }} />
                {navExpanded && <span>{t.label}</span>}
              </button>
            );
          })}

          <div style={{ flex: 1 }} />

          <button
            onClick={handleClear}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 22,
              border: "none",
              borderRadius: "var(--radius-sm)",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "0 4px",
              fontFamily: "inherit",
              fontSize: "var(--text-xs)",
              textAlign: "left",
              transition: "all 0.1s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--danger)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-muted)")
            }
          >
            <Trash2 size={13} style={{ flexShrink: 0 }} />
            {navExpanded && <span>Clear</span>}
          </button>

          <button
            onClick={handleSave}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 22,
              border: "none",
              borderRadius: "var(--radius-sm)",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "0 4px",
              fontFamily: "inherit",
              fontSize: "var(--text-xs)",
              textAlign: "left",
              transition: "all 0.1s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--accent)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-muted)")
            }
          >
            <Save size={13} style={{ flexShrink: 0 }} />
            {navExpanded && <span>Save</span>}
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
            <div style={{ maxWidth: 240 }}>
              <SectionLabel>Primary Key</SectionLabel>
              <div
                ref={captureRef}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  background: "var(--bg-input)",
                  border: isCapturing
                    ? "1px solid var(--accent)"
                    : "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-2) var(--space-3)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  animation: isCapturing
                    ? "capturePulse 1s ease-in-out infinite"
                    : "none",
                  boxShadow: isCapturing ? "0 0 8px var(--accent)" : "none",
                }}
                onClick={() => {
                  if (!isCapturing) setIsCapturing(true);
                }}
              >
                {isCapturing ? (
                  <span
                    style={{
                      flex: 1,
                      fontSize: "var(--text-sm)",
                      color: "var(--text-muted)",
                      fontStyle: "italic",
                    }}
                  >
                    Press a key...
                  </span>
                ) : (
                  <span
                    style={{
                      flex: 1,
                      fontSize: "var(--text-sm)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {current || "\u2014"}
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const p = current.split("+");
                    p.pop();
                    const m = p.filter((x) =>
                      ["Ctrl", "Shift", "Alt", "GUI"].includes(x)
                    );
                    setPickerMods({
                      Ctrl: m.includes("Ctrl"),
                      Shift: m.includes("Shift"),
                      Alt: m.includes("Alt"),
                      GUI: m.includes("GUI"),
                    });
                    setShowKeyPicker(true);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    fontSize: "var(--text-sm)",
                    fontFamily: "inherit",
                    padding: 0,
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--text-secondary)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--text-muted)")
                  }
                >
                  <Keyboard size={13} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleClear(); }}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    fontSize: "var(--text-sm)",
                    fontFamily: "inherit",
                    padding: 0,
                    lineHeight: 1,
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
              {/* Modifier toggle buttons */}
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  marginTop: "var(--space-2)",
                }}
              >
                {MODIFIERS.map((m) => {
                  const parts = current.split("+");
                  const keyP = parts.pop() || "";
                  const activeMod = parts.filter((p) =>
                    ["Ctrl", "Shift", "Alt", "GUI"].includes(p)
                  );
                  const isOn = activeMod.includes(m.mod);
                  const noKey = !keyP;
                  const disabled = isCapturing || isNonKeystroke || noKey;
                  return (
                    <button
                      key={m.mod}
                      onClick={() => handleToggleMod(m.mod)}
                      disabled={disabled}
                      style={{
                        flex: 1,
                        padding: "2px 0",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid",
                        fontSize: "var(--text-xs)",
                        fontFamily: "inherit",
                        cursor: disabled ? "default" : "pointer",
                        opacity: disabled ? 0.35 : 1,
                        background: isOn
                          ? "var(--accent)"
                          : "var(--bg-input)",
                        color: isOn
                          ? "#000"
                          : "var(--text-muted)",
                        borderColor: isOn
                          ? "var(--accent)"
                          : "var(--border)",
                        transition: "all 0.1s ease",
                      }}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
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
        </div>
      </div>

      {/* Key picker modal */}
      {showKeyPicker && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowKeyPicker(false)}
        >
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-4)",
              maxWidth: 500,
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              border: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-3)",
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                Select Key
              </span>
              <button
                onClick={() => setShowKeyPicker(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  fontFamily: "inherit",
                  fontSize: "var(--text-sm)",
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
            {/* Modifier checkboxes */}
            <div
              style={{
                display: "flex",
                gap: "var(--space-3)",
                marginBottom: "var(--space-3)",
                paddingBottom: "var(--space-3)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {MODIFIERS.map((m) => (
                <label
                  key={m.mod}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: "var(--text-xs)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={pickerMods[m.mod as keyof typeof pickerMods]}
                    onChange={() =>
                      setPickerMods((prev) => ({
                        ...prev,
                        [m.mod]: !prev[m.mod as keyof typeof prev],
                      }))
                    }
                    style={{ accentColor: "var(--accent)" }}
                  />
                  {m.label}
                </label>
              ))}
            </div>
            {Object.entries(KEY_CATEGORIES).map(([category, keys]) => (
              <div key={category}>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    marginTop: "var(--space-2)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  {category}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {keys.map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        const modOrder = ["Ctrl", "Shift", "Alt", "GUI"];
                        const active = modOrder.filter(
                          (m) => pickerMods[m as keyof typeof pickerMods]
                        );
                        const prefix =
                          active.length > 0 ? active.join("+") + "+" : "";
                        commit(prefix + key);
                        setShowKeyPicker(false);
                      }}
                      style={{
                        padding: "2px 8px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border)",
                        background: "var(--bg-surface)",
                        cursor: "pointer",
                        color: "var(--text-primary)",
                        fontSize: "var(--text-xs)",
                        fontFamily: "inherit",
                      }}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
        @keyframes capturePulse {
          0%, 100% { border-color: var(--accent); box-shadow: 0 0 4px var(--accent); }
          50% { border-color: var(--accent-glow); box-shadow: 0 0 12px var(--accent); }
        }
      `}</style>
    </div>
  );
}
