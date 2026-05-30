import { Settings2, ArrowLeft, ArrowRight, Disc3 } from "lucide-react";
import React, { useState } from "react";
import { useLayout } from "../../hooks/useLayout";
import { KEY_CATEGORIES, MEDIA_MAP } from "../../constants/hidCodes";

const ENC_ICONS = { left: ArrowLeft, right: ArrowRight, button: Disc3 };

const TAB_ORDER = ["Litery & Cyfry", "Specjalne", "Nawigacja", "Funkcyjne", "Media i System", "Systemowe", "Warstwy", "Makra", "Tekst"];

function getCategoryItems(tab, macros, strings) {
  if (tab === "Makra") return macros.map((m, i) => ({ label: m.name || `M:${i}`, value: `M:${i}` }));
  if (tab === "Tekst") return strings.map((s, i) => ({ label: `"${s.length > 20 ? s.slice(0, 20) + "..." : s}"`, value: `T:${i}` }));
  return (KEY_CATEGORIES[tab] || []).map((k) => ({ label: k, value: k }));
}

export default function KeyBindingPanel({ macros, strings, onAddMacro }) {
  const { layers, activeLayer, activeKey, activeEncoderAction, setActiveKey, setActiveEncoderAction, updateKey, updateEncoder } = useLayout();
  const [activeTab, setActiveTab] = useState(TAB_ORDER[0]);
  const [editMods, setEditMods] = useState({ Ctrl: false, Shift: false, Alt: false, GUI: false });
  const [textInput, setTextInput] = useState("");

  const isEncoderMode = activeEncoderAction !== null;

  if (!activeKey && !activeEncoderAction) {
    return (
      <div className="flex-1 bg-surface-container rounded-xl border border-outline-variant/30 p-container-padding flex items-center justify-center min-w-[280px]">
        <p className="text-on-surface-variant font-body-md text-body-md text-center">
          Select a key or encoder action to edit
        </p>
      </div>
    );
  }

  const currentBinding = isEncoderMode
    ? String(layers[activeLayer]?.encoder?.[activeEncoderAction.type] || "")
    : String(layers[activeLayer]?.keys?.[activeKey.rIdx]?.[activeKey.cIdx] || "");

  const baseKey = currentBinding.split("+").pop() || "";
  const isModAllowed = !currentBinding.startsWith("M:") && !currentBinding.startsWith("T:") && !currentBinding.startsWith("L") && MEDIA_MAP[currentBinding] === undefined;

  const commit = (value) => {
    if (isEncoderMode) {
      updateEncoder(activeEncoderAction.type, value);
    } else {
      updateKey(activeKey.rIdx, activeKey.cIdx, value);
    }
  };

  const handleSelect = (selectedBase) => {
    let finalBinding = selectedBase;
    if (selectedBase && !selectedBase.startsWith("L") && !selectedBase.startsWith("M:") && !selectedBase.startsWith("T:") && MEDIA_MAP[selectedBase] === undefined) {
      const m = [];
      if (editMods.Ctrl) m.push("Ctrl");
      if (editMods.Shift) m.push("Shift");
      if (editMods.Alt) m.push("Alt");
      if (editMods.GUI) m.push("GUI");
      if (m.length > 0) finalBinding = m.join("+") + (selectedBase ? "+" + selectedBase : "");
    }
    commit(finalBinding);
  };

  const handleTextApply = () => {
    const trimmed = textInput.trim();
    if (trimmed) commit(trimmed);
    setTextInput("");
  };

  const handleDismiss = () => {
    if (isEncoderMode) setActiveEncoderAction(null);
    else setActiveKey(null);
  };

  const toggleMod = (mod) => setEditMods((prev) => ({ ...prev, [mod]: !prev[mod] }));

  const items = getCategoryItems(activeTab, macros, strings);
  const isMacroTab = activeTab === "Makra";
  const isTextTab = activeTab === "Tekst";

  return (
    <div className="flex-1 bg-surface-container rounded-xl border border-outline-variant/30 p-container-padding flex flex-col min-w-[280px] min-h-0 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
          <Settings2 size={18} className="text-primary" />
          {isEncoderMode ? (
            <span className="flex items-center gap-2">
              {React.createElement(ENC_ICONS[activeEncoderAction.type] || Disc3, { size: 16 })}
              Encoder {activeEncoderAction.type === "left" ? "Left" : activeEncoderAction.type === "right" ? "Right" : "Press"}
            </span>
          ) : (
            <>Key {activeKey.rIdx},{activeKey.cIdx}</>
          )}
        </h3>
        <span className="px-2 py-1 bg-secondary-container/20 text-secondary border border-secondary/30 rounded font-code-sm text-code-sm">EDITING</span>
      </div>

      <div className="flex-1 space-y-4">
        {isModAllowed && (
          <div>
            <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Modifiers</label>
            <div className="flex gap-2">
              {["Ctrl", "Shift", "Alt", "GUI"].map((mod) => (
                <button key={mod} onClick={() => toggleMod(mod)}
                  className={`flex-1 py-2 rounded-full font-label-md text-label-md border transition-colors ${
                    editMods[mod]
                      ? "bg-primary-container text-on-primary-container border-primary glow-primary"
                      : "bg-surface-variant text-on-surface-variant border-outline-variant/30 hover:text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Custom Binding</label>
          <div className="flex gap-2">
            <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleTextApply(); }}
              placeholder="e.g. Ctrl+Shift+A"
              className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface font-code-sm focus:outline-none focus:border-primary"
            />
            <button onClick={handleTextApply} disabled={!textInput.trim()}
              className="px-4 py-2 bg-primary-container text-on-primary-container rounded-full text-xs font-medium glow-primary hover:bg-inverse-primary disabled:opacity-40 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>

        <div>
          <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Or Select</label>
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
            {TAB_ORDER.map((cat) => (
              <button key={cat} onClick={() => setActiveTab(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all font-label-md ${
                  activeTab === cat ? "bg-surface-container-high text-primary" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 max-h-[220px] overflow-y-auto">
            {isMacroTab && macros.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-on-surface-variant mb-3">No macros defined</p>
                <button onClick={() => { onAddMacro(); }}
                  className="px-4 py-2 bg-primary-container text-on-primary-container rounded-full text-xs font-medium glow-primary hover:bg-inverse-primary transition-colors"
                >
                  + Create macro
                </button>
              </div>
            )}
            {isTextTab && strings.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-on-surface-variant">No strings defined.</p>
              </div>
            )}
            {!isMacroTab && !isTextTab && (
              <div className="grid grid-cols-4 gap-1.5">
                <button onClick={() => handleSelect("")}
                  className={`py-2 rounded-lg text-xs border transition-all font-code-sm ${
                    baseKey === ""
                      ? "bg-secondary-container/20 border-secondary/50 text-secondary"
                      : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  (None)
                </button>
                {items.map(({ label, value }) => (
                  <button key={value} onClick={() => handleSelect(value)}
                    className={`py-2 rounded-lg text-xs border transition-all truncate font-code-sm ${
                      baseKey === value
                        ? "bg-secondary-container/20 border-secondary/50 text-secondary"
                        : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            {isMacroTab && macros.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5">
                {items.map(({ label, value }) => (
                  <button key={value} onClick={() => handleSelect(value)}
                    className={`py-2 rounded-lg text-xs border transition-all truncate font-code-sm ${
                      baseKey === value
                        ? "bg-secondary-container/20 border-secondary/50 text-secondary"
                        : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <button onClick={() => { onAddMacro(); }}
                  className="py-2 rounded-lg text-xs border border-dashed border-outline-variant/50 text-on-surface-variant hover:text-on-surface bg-surface-container transition-all font-code-sm"
                >
                  + New
                </button>
              </div>
            )}
            {isTextTab && strings.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5">
                {items.map(({ label, value }) => (
                  <button key={value} onClick={() => handleSelect(value)}
                    className={`py-2 rounded-lg text-xs border transition-all truncate font-code-sm ${
                      baseKey === value
                        ? "bg-secondary-container/20 border-secondary/50 text-secondary"
                        : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto flex gap-unit pt-4 border-t border-outline-variant/20">
        <button onClick={() => commit("")}
          className="flex-1 py-2 rounded-full font-label-md text-label-md bg-transparent border border-outline-variant text-on-surface-variant hover:bg-surface-variant transition-colors"
        >
          Clear
        </button>
        <button onClick={handleDismiss}
          className="flex-1 py-2 rounded-full font-label-md text-label-md bg-primary-container text-on-primary-container glow-primary hover:bg-inverse-primary transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
