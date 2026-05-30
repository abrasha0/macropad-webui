import { useState, useCallback, useRef, useEffect } from "react";
import { useSerial } from "./hooks/useSerial";
import {
  Cpu, Save, Link, Unlink, Settings2, Terminal, X,
  AlertCircle, CheckCircle, Info, AlertTriangle,
  Download, Upload, RotateCcw, Play,
} from "lucide-react";
import { MEDIA_MAP, KEY_CATEGORIES } from "./constants/hidCodes.js";
import { DEFAULT_LAYERS, DEFAULT_MACROS, DEFAULT_STRINGS } from "./constants/defaults.js";
import {
  deviceLayersToUI, uiLayersToDevice, getKeyDisplayString,
  macroCodeToSteps, stepsToDeviceCode,
} from "./utils/keycode.js";

// ─── Toast ────────────────────────────────────────────────────────────────────
let _toastId = 0;

function Toast({ toast, onDismiss }) {
  const cfg = {
    success: { icon: <CheckCircle size={15} />, cls: "border-emerald-800 text-emerald-400" },
    error:   { icon: <AlertCircle size={15} />,   cls: "border-red-800    text-red-400" },
    warn:    { icon: <AlertTriangle size={15} />,  cls: "border-amber-800  text-amber-400" },
    info:    { icon: <Info size={15} />,           cls: "border-sky-800    text-sky-400" },
  };
  const { icon, cls } = cfg[toast.level] ?? cfg.info;
  return (
    <div className={`flex items-start gap-2 bg-slate-900 border ${cls} px-4 py-3 rounded-xl shadow-xl max-w-sm text-sm animate-slide-in`}>
      <span className="shrink-0 mt-0.5">{icon}</span>
      <span className="flex-1 text-slate-200">{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="text-slate-600 hover:text-slate-300 ml-1"><X size={13} /></button>
    </div>
  );
}

// ─── Serial Monitor ───────────────────────────────────────────────────────────
function SerialMonitor({ logs, onClear }) {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);
  const lvlCls = { error: "text-red-400", warn: "text-amber-400", info: "text-sky-400", raw: "text-slate-400" };
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden mt-6">
      <div className="flex justify-between items-center px-4 py-2 border-b border-slate-800 bg-slate-900">
        <span className="flex items-center gap-2 text-xs font-mono text-slate-400"><Terminal size={12} /> Serial Monitor</span>
        <button onClick={onClear} className="text-xs text-slate-600 hover:text-slate-300">Wyczyść</button>
      </div>
      <div className="font-mono text-xs h-44 overflow-y-auto p-3 space-y-0.5">
        {logs.length === 0 ? <span className="text-slate-700">Brak wiadomości...</span> : (
          logs.map((log, i) => (
            <div key={i} className={`${lvlCls[log.level] ?? "text-slate-400"} leading-relaxed`}>
              <span className="text-slate-700 mr-2 select-none">{log.time}</span>
              {log.message}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ─── Key Picker (shared between KeyEditorModal & EncoderEditorModal) ──────────
function KeyPickerGrid({ activeTab, setActiveTab, baseKey, onSelect, macros, onAddMacro, strings, onAddString }) {
  const [newStringVal, setNewStringVal] = useState("");

  const macroItems = macros.map((m, i) => ({ label: m.name || `M:${i}`, value: `M:${i}` }));
  const stringItems = strings.map((s, i) => ({ label: `"${s.length > 20 ? s.slice(0, 20) + "..." : s}"`, value: `T:${i}` }));

  const allCategories = { ...KEY_CATEGORIES, Makra: macroItems, Tekst: stringItems };
  const items = allCategories[activeTab] || [];

  const handleAddString = () => {
    const val = newStringVal.trim();
    if (!val) return;
    const idx = strings.length;
    onAddString(val);
    onSelect(`T:${idx}`);
    setNewStringVal("");
  };

  return (
    <div className="mb-4">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Klawisz Główny</p>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {Object.keys(allCategories).map((cat) => (
          <button key={cat} onClick={() => setActiveTab(cat)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === cat ? "bg-slate-700 text-blue-400" : "bg-transparent text-slate-500 hover:text-slate-300"
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Makra tab — inline creation */}
      {activeTab === "Makra" && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
          {macros.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500 mb-3">Brak zdefiniowanych makr</p>
              <button onClick={() => { const idx = macros.length; onAddMacro(); onSelect(`M:${idx}`); }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all">
                + Utwórz makro i przypisz
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {macroItems.map(({ label, value }) => (
                <button key={value} onClick={() => onSelect(value)}
                  className={`py-2 rounded-lg text-sm border transition-all truncate ${
                    baseKey === value
                      ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-400"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                  }`}>
                  {label}
                </button>
              ))}
              {macros.length > 0 && (
                <button onClick={() => { const idx = macros.length; onAddMacro(); onSelect(`M:${idx}`); }}
                  className="py-2 rounded-lg text-sm border border-dashed border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 bg-slate-900 transition-all">
                  + Nowe
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tekst tab — inline creation */}
      {activeTab === "Tekst" && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex gap-2">
            <input type="text" value={newStringVal} autoFocus
              onChange={(e) => setNewStringVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddString(); }}
              placeholder="Wpisz treść stringa..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
            <button onClick={handleAddString} disabled={!newStringVal.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-sm font-medium transition-all">
              Dodaj
            </button>
          </div>
          {strings.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              {stringItems.map(({ label, value }) => (
                <button key={value} onClick={() => onSelect(value)}
                  className={`py-2 rounded-lg text-sm border transition-all truncate ${
                    baseKey === value
                      ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-400"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Other tabs — standard grid */}
      {activeTab !== "Makra" && activeTab !== "Tekst" && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 grid grid-cols-6 gap-2">
          <button onClick={() => onSelect("")}
            className={`py-2 rounded-lg text-sm border transition-all ${
              baseKey === ""
                ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-400"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
            }`}>
            (Brak)
          </button>
          {items.map((k) => {
            const val = typeof k === "string" ? k : k.value;
            const lbl = typeof k === "string" ? k : k.label;
            const isSelected = baseKey === val || baseKey === lbl;
            return (
              <button key={val} onClick={() => onSelect(val)}
                className={`py-2 rounded-lg text-sm border transition-all truncate ${
                  isSelected
                    ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-400"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                }`}>
                {lbl}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Key Editor Modal ─────────────────────────────────────────────────────────
function KeyEditorModal({ activeKey, layerName, currentBinding, onUpdate, onClose, macros, onAddMacro, strings, onAddString }) {
  const hasMod = (mod) => currentBinding.includes(`${mod}+`);
  const [editMods, setEditMods] = useState({
    Ctrl: hasMod("Ctrl"), Shift: hasMod("Shift"), Alt: hasMod("Alt"), GUI: hasMod("GUI"),
  });
  const [activeTab, setActiveTab] = useState(Object.keys(KEY_CATEGORIES)[0]);

  const applyBinding = (selectedBase) => {
    let finalBinding = selectedBase;
    if (!selectedBase.startsWith("L") && !selectedBase.startsWith("M:") && !selectedBase.startsWith("T:") && MEDIA_MAP[selectedBase] === undefined) {
      const m = [];
      if (editMods.Ctrl) m.push("Ctrl");
      if (editMods.Shift) m.push("Shift");
      if (editMods.Alt) m.push("Alt");
      if (editMods.GUI) m.push("GUI");
      if (m.length > 0) finalBinding = m.join("+") + (selectedBase ? "+" + selectedBase : "");
    }
    onUpdate(finalBinding);
  };

  const toggleMod = (mod) => setEditMods((prev) => ({ ...prev, [mod]: !prev[mod] }));
  const baseKey = currentBinding.split("+").pop() || "";

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold flex items-center gap-2"><Settings2 size={20} className="text-blue-500" /> Edytor Akcji Klawisza</h2>
          <p className="text-slate-500 text-sm mt-1">Konfigurujesz przycisk [{activeKey.rIdx}, {activeKey.cIdx}] na warstwie {layerName}</p>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          {!currentBinding.startsWith("M:") && !currentBinding.startsWith("T:") && !currentBinding.startsWith("L") && !MEDIA_MAP[currentBinding] && (
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Modyfikatory (Opcjonalnie)</p>
              <div className="flex gap-3">
                {["Ctrl", "Shift", "Alt", "GUI"].map((mod) => (
                  <button key={mod} onClick={() => toggleMod(mod)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      editMods[mod] ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30" : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                    }`}>
                    {mod}
                  </button>
                ))}
              </div>
            </div>
          )}
          <KeyPickerGrid activeTab={activeTab} setActiveTab={setActiveTab} baseKey={baseKey} onSelect={applyBinding} macros={macros} onAddMacro={onAddMacro} strings={strings} onAddString={onAddString} />
        </div>
        <div className="p-6 border-t border-slate-800 bg-slate-950 rounded-b-3xl flex justify-between items-center">
          <button onClick={() => onUpdate("")} className="px-5 py-2.5 text-sm font-medium text-red-400 border border-red-900/50 hover:bg-red-900/20 rounded-xl transition-all">Wyczyść klawisz</button>
          <button onClick={() => applyBinding(baseKey || "")} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/30 transition-all">Gotowe</button>
        </div>
      </div>
    </div>
  );
}

// ─── Encoder Editor Modal ─────────────────────────────────────────────────────
function EncoderEditorModal({ activeEncoderAction, layerName, currentBinding, onUpdate, onClose, macros, onAddMacro, strings, onAddString }) {
  const hasMod = (mod) => currentBinding.includes(`${mod}+`);
  const [editMods, setEditMods] = useState({
    Ctrl: hasMod("Ctrl"), Shift: hasMod("Shift"), Alt: hasMod("Alt"), GUI: hasMod("GUI"),
  });
  const [activeTab, setActiveTab] = useState(Object.keys(KEY_CATEGORIES)[0]);

  const applyBinding = (selectedBase) => {
    let finalBinding = selectedBase;
    if (!selectedBase.startsWith("L") && !selectedBase.startsWith("M:") && !selectedBase.startsWith("T:") && MEDIA_MAP[selectedBase] === undefined) {
      const m = [];
      if (editMods.Ctrl) m.push("Ctrl");
      if (editMods.Shift) m.push("Shift");
      if (editMods.Alt) m.push("Alt");
      if (editMods.GUI) m.push("GUI");
      if (m.length > 0) finalBinding = m.join("+") + (selectedBase ? "+" + selectedBase : "");
    }
    onUpdate(finalBinding);
  };

  const toggleMod = (mod) => setEditMods((prev) => ({ ...prev, [mod]: !prev[mod] }));
  const baseKey = currentBinding.split("+").pop() || "";

  const encLabel = activeEncoderAction.type === 'left' ? '←' : activeEncoderAction.type === 'right' ? '→' : '⏺';

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold flex items-center gap-2"><Settings2 size={20} className="text-blue-500" /> Edytor Akcji Enkodera {encLabel}</h2>
          <p className="text-slate-500 text-sm mt-1">Konfigurujesz enkoder na warstwie {layerName}</p>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          {!currentBinding.startsWith("M:") && !currentBinding.startsWith("T:") && !currentBinding.startsWith("L") && !MEDIA_MAP[currentBinding] && (
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Modyfikatory (Opcjonalnie)</p>
              <div className="flex gap-3">
                {["Ctrl", "Shift", "Alt", "GUI"].map((mod) => (
                  <button key={mod} onClick={() => toggleMod(mod)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      editMods[mod] ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30" : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                    }`}>
                    {mod}
                  </button>
                ))}
              </div>
            </div>
          )}
          <KeyPickerGrid activeTab={activeTab} setActiveTab={setActiveTab} baseKey={baseKey} onSelect={applyBinding} macros={macros} onAddMacro={onAddMacro} strings={strings} onAddString={onAddString} />
        </div>
        <div className="p-6 border-t border-slate-800 bg-slate-950 rounded-b-3xl flex justify-between items-center">
          <button onClick={() => onUpdate("")} className="px-5 py-2.5 text-sm font-medium text-red-400 border border-red-900/50 hover:bg-red-900/20 rounded-xl transition-all">Wyczyść akcję</button>
          <button onClick={() => applyBinding(baseKey || "")} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/30 transition-all">Gotowe</button>
        </div>
      </div>
    </div>
  );
}

// ─── Macro Manager Modal ─────────────────────────────────────────────────────
function MacroManagerModal({ macros, onRun, onRefresh, onSave, onClose, isConnected }) {
  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2"><Cpu size={20} className="text-blue-500" /> Zarządzanie Makrami</h2>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-300"><X size={18} /></button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex gap-2 mb-6">
            <button onClick={onRefresh} disabled={!isConnected}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 rounded-xl text-xs font-medium transition-all border border-slate-700">
              <RotateCcw size={14} /> Odśwież makra
            </button>
            <button onClick={onSave} disabled={!isConnected}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-medium transition-all">
              <Save size={14} /> Zapisz makra
            </button>
          </div>

          {macros.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-500">Brak zdefiniowanych makr</p>
            </div>
          ) : (
            <div className="space-y-3">
              {macros.map((m, i) => (
                <div key={i} className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-200">{m.name || `Makro ${i}`}</span>
                    <span className="text-xs text-slate-500">{m.steps?.length || 0} kroków</span>
                  </div>
                  {m.steps?.length > 0 && (
                    <div className="text-xs text-slate-500 font-mono truncate mb-3">
                      {m.steps.map((s, si) => (
                        <span key={si}>{si > 0 && ", "}kc=0x{(s.keycode ?? 0).toString(16)} d={s.delay ?? 0}ms</span>
                      ))}
                    </div>
                  )}
                  <button onClick={() => onRun(i)} disabled={!isConnected}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-all">
                    <Play size={12} /> Uruchom
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Macro Progress Bar ───────────────────────────────────────────────────────
function MacroProgressBar({ progress }) {
  if (!progress) return null;
  const pct = progress.total > 0 ? Math.round((progress.step / progress.total) * 100) : 0;
  return (
    <div className="mb-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex justify-between items-center mb-2 text-sm">
        <span className="text-slate-400">Wykonywanie makra #{progress.index}</span>
        <span className="text-blue-400 font-mono">{progress.step}/{progress.total}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all duration-200" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Encoder Wheel ────────────────────────────────────────────────────────────
function EncoderWheel({ encoder, onEdit, onAnim, animRotation, animGlow, macros, strings }) {

  const handleClick = (type) => {
    if (onAnim) onAnim(type);
    setTimeout(() => onEdit(type), 180);
  };

  const leftLabel = getKeyDisplayString(encoder?.left, macros, strings);
  const rightLabel = getKeyDisplayString(encoder?.right, macros, strings);
  const pressLabel = getKeyDisplayString(encoder?.button, macros, strings);

  const cx = 100, cy = 120, outerR = 55, innerR = 24, glow = animGlow;

  return (
    <svg viewBox="0 0 200 230" className="w-full max-w-[220px] mx-auto select-none">
      {/* Top label — left binding */}
      <text x={cx} y="26" textAnchor="middle"
        className={`text-xs font-medium transition-all duration-200 ${glow ? "fill-blue-400" : "fill-slate-400"}`}>
        {leftLabel !== "\u2014" ? `← ${leftLabel}` : ""}
      </text>

      {/* Bottom label — right binding */}
      <text x={cx} y="224" textAnchor="middle"
        className={`text-xs font-medium transition-all duration-200 ${glow ? "fill-blue-400" : "fill-slate-400"}`}>
        {rightLabel !== "\u2014" ? `→ ${rightLabel}` : ""}
      </text>

      {/* Left clickable arrow — large invisible hit area */}
      <g onClick={() => handleClick('left')} className="cursor-pointer">
        <rect x="0" y={cy - 60} width="50" height="120" fill="transparent" />
        <circle cx="22" cy={cy} r="24" fill={glow ? "rgba(59,130,246,0.15)" : "transparent"}
          className="transition-all duration-200" />
        <polygon points={`32,${cy - 20} 32,${cy + 20} 10,${cy}`}
          fill={glow ? "#60a5fa" : "none"}
          stroke={glow ? "#60a5fa" : "#475569"} strokeWidth="3"
          strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-200" />
      </g>

      {/* Right clickable arrow — large invisible hit area */}
      <g onClick={() => handleClick('right')} className="cursor-pointer">
        <rect x="150" y={cy - 60} width="50" height="120" fill="transparent" />
        <circle cx="178" cy={cy} r="24" fill={glow ? "rgba(59,130,246,0.15)" : "transparent"}
          className="transition-all duration-200" />
        <polygon points={`168,${cy - 20} 168,${cy + 20} 190,${cy}`}
          fill={glow ? "#60a5fa" : "none"}
          stroke={glow ? "#60a5fa" : "#475569"} strokeWidth="3"
          strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-200" />
      </g>

      {/* Knob body — CSS transform for smooth animation */}
      <g style={{
        transform: `rotate(${animRotation}deg)`,
        transformOrigin: `${cx}px ${cy}px`,
        transition: 'transform 0.15s ease-out',
      }}>
        {/* Outer ring with ridges */}
        <circle cx={cx} cy={cy} r={outerR}
          fill="none"
          stroke={glow ? "#3b82f6" : "#1e293b"}
          strokeWidth="10"
          strokeDasharray="6 8"
          className="transition-all duration-200" />

        {/* Inner knob face */}
        <circle cx={cx} cy={cy} r={outerR - 6}
          fill={glow ? "rgba(59,130,246,0.12)" : "#0f172a"}
          stroke={glow ? "rgba(59,130,246,0.3)" : "transparent"}
          strokeWidth="1"
          className="transition-all duration-200" />

        {/* Knob inner ring */}
        <circle cx={cx} cy={cy} r={outerR - 10}
          fill="none" stroke={glow ? "#3b82f6" : "#334155"}
          strokeWidth="1.5" className="transition-all duration-200" />

        {/* Directional notch — makes rotation visible */}
        <line x1={cx} y1={cy - outerR + 14} x2={cx} y2={cy - outerR + 28}
          stroke={glow ? "#60a5fa" : "#64748b"}
          strokeWidth="3" strokeLinecap="round"
          className="transition-all duration-200" />
      </g>

      {/* Center press button */}
      <g onClick={() => handleClick('button')} className="cursor-pointer">
        {/* Invisible hit area */}
        <circle cx={cx} cy={cy} r={innerR + 10} fill="transparent" />
        {/* Glow ring */}
        {glow && (
          <circle cx={cx} cy={cy} r={innerR + 6}
            fill="none" stroke="rgba(59,130,246,0.5)" strokeWidth="3"
            className="transition-all duration-200" />
        )}
        {/* Center button face */}
        <circle cx={cx} cy={cy} r={innerR}
          fill={glow ? "#1e40af" : "#1e293b"}
          stroke={glow ? "#3b82f6" : "#475569"}
          strokeWidth="2"
          className="transition-all duration-200 cursor-pointer" />
        {/* Center label */}
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
          className={`text-[10px] font-semibold transition-all duration-200 ${
            glow ? "fill-blue-200" : "fill-slate-400"
          }`}>
          {pressLabel !== "\u2014" ? pressLabel : "⏺"}
        </text>
      </g>
    </svg>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { connect, send, disconnect, isConnected } = useSerial();

  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [macros, setMacros] = useState(DEFAULT_MACROS);
  const [strings, setStrings] = useState(DEFAULT_STRINGS);
  const [activeLayer, setActiveLayer] = useState(0);
  const [deviceLayer, setDeviceLayer] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [activeEncoderAction, setActiveEncoderAction] = useState(null);
  const [activeKeysMap, setActiveKeysMap] = useState({});
  const [toasts, setToasts] = useState([]);
  const [serialLogs, setSerialLogs] = useState([]);
  const [showMonitor, setShowMonitor] = useState(false);
  const [showMacroManager, setShowMacroManager] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [macroProgress, setMacroProgress] = useState(null);
  const [editingLayerName, setEditingLayerName] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [encoderAnim, setEncoderAnim] = useState({ rotation: 0, glow: false });
  const encoderAnimTimeout = useRef(null);

  const layersRef = useRef(layers);
  useEffect(() => { layersRef.current = layers; }, [layers]);
  const macrosRef = useRef(macros);
  useEffect(() => { macrosRef.current = macros; }, [macros]);
  const stringsRef = useRef(strings);
  useEffect(() => { stringsRef.current = strings; }, [strings]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const addToast = useCallback((message, level = "info") => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, message, level }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addLog = useCallback((message, level = "info") => {
    const time = new Date().toLocaleTimeString("pl-PL", { hour12: false });
    setSerialLogs((prev) => [...prev.slice(-300), { message, level, time }]);
  }, []);

  // ── Encoder animation (defined before serial handler which uses it) ─────
  const fireEncoder = useCallback((dir) => {
    clearTimeout(encoderAnimTimeout.current);
    const rot = dir === 'left' ? -18 : dir === 'right' ? 18 : 0;
    setEncoderAnim({ rotation: rot, glow: true });
    encoderAnimTimeout.current = setTimeout(() => {
      setEncoderAnim({ rotation: 0, glow: false });
    }, 400);
  }, []);

  // ── Serial message handler ───────────────────────────────────────────────
  const handleSerialMessage = useCallback((msg) => {
    addLog(JSON.stringify(msg), "raw");

    switch (msg.cmd) {
      case "config": {
        const rawLayers = msg.data?.layers;
        const rawEncoder = msg.data?.encoder;
        const rawMacros = msg.data?.macros;
        const rawStrings = msg.data?.strings;
        if (Array.isArray(rawLayers) && rawLayers.length > 0) {
          setLayers((prev) => deviceLayersToUI(rawLayers, rawEncoder, prev, macrosRef.current, stringsRef.current));
          if (Array.isArray(rawMacros)) {
            setMacros(macroCodeToSteps(rawMacros));
          }
          if (Array.isArray(rawStrings)) {
            setStrings(rawStrings);
          }
          setConfigLoaded(true);
          addToast("Konfiguracja załadowana z urządzenia", "success");
          addLog("Załadowano konfigurację", "info");
        } else {
          addToast("Urządzenie zwróciło pustą konfigurację — używam domyślnych", "warn");
          addLog("Pusta konfiguracja w odpowiedzi", "warn");
          setConfigLoaded(true);
        }
        break;
      }
      case "key_state": {
        if (msg.row >= 4) {
          const dir = msg.col === 0 ? 'left' : msg.col === 1 ? 'right' : 'button';
          fireEncoder(dir);
          break;
        }
        const keyId = `${msg.row}-${msg.col}`;
        setActiveKeysMap((prev) => {
          const next = { ...prev };
          if (msg.isPressed) next[keyId] = true;
          else delete next[keyId];
          return next;
        });
        break;
      }
      case "layer_change": {
        const l = msg.layer;
        setDeviceLayer(l);
        const name = layersRef.current[l]?.name ?? l;
        addLog(`Urządzenie przełączyło na warstwę ${l}: "${name}"`, "info");
        break;
      }
      case "status": {
        const ok = msg.status === "success";
        addToast(msg.msg || (ok ? "OK" : "Błąd operacji"), ok ? "success" : "error");
        addLog(msg.msg || msg.status, ok ? "info" : "error");
        break;
      }
      case "log": {
        addLog(msg.msg, msg.level ?? "info");
        if (msg.level === "error") addToast(`[Urządzenie] ${msg.msg}`, "error");
        if (msg.level === "warn") addToast(`[Urządzenie] ${msg.msg}`, "warn");
        break;
      }
      case "macros": {
        if (Array.isArray(msg.data)) {
          setMacros(macroCodeToSteps(msg.data));
          addLog("Załadowano makra z urządzenia", "info");
          addToast("Makra załadowane z urządzenia", "success");
        }
        if (Array.isArray(msg.strings)) {
          setStrings(msg.strings);
        }
        break;
      }
      case "macro_progress": {
        setMacroProgress({ index: msg.index, step: msg.step, total: msg.total });
        if (msg.step >= msg.total) {
          setTimeout(() => setMacroProgress(null), 1500);
          addLog(`Makro #${msg.index} zakończone (${msg.step}/${msg.total})`, "info");
        }
        break;
      }
      default:
        break;
    }
  }, [addLog, addToast, fireEncoder]);

  const handleError = useCallback((err) => {
    addToast(err.message, "error");
    addLog(err.message, "error");
  }, [addToast, addLog]);

  // ── Connection ───────────────────────────────────────────────────────────
  const handleConnectToggle = useCallback(async () => {
    if (isConnected) {
      await disconnect();
      addToast("Rozłączono od urządzenia", "info");
      addLog("Rozłączono", "info");
      setDeviceLayer(null);
      setConfigLoaded(false);
      setActiveKeysMap({});
      setMacroProgress(null);
      return;
    }
    await connect(handleSerialMessage, handleError);
  }, [isConnected, connect, disconnect, handleSerialMessage, handleError, addToast, addLog]);

  const connectedOnce = useRef(false);
  useEffect(() => {
    if (!isConnected) { connectedOnce.current = false; return; }
    if (connectedOnce.current) return;
    connectedOnce.current = true;
    addToast("Połączono z urządzeniem!", "success");
    addLog("Połączono. Pobieranie konfiguracji...", "info");
    const t = setTimeout(async () => {
      await send({ cmd: "get_config" });
      await send({ cmd: "get_layer" });
      await send({ cmd: "get_macros" });
    }, 600);
    return () => clearTimeout(t);
  }, [isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Config save ──────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!isConnected) return;
    const { layers: deviceLayers, encoder: deviceEncoder } = uiLayersToDevice(layersRef.current);
    const configData = {
      layers: deviceLayers,
      encoder: deviceEncoder,
      macros: stepsToDeviceCode(macrosRef.current),
      strings: stringsRef.current,
    };
    const ok = await send({ cmd: "set_config", data: configData });
    if (!ok) addToast("Nie udało się wysłać konfiguracji", "error");
    else addLog("Wysłano konfigurację do urządzenia...", "info");
  }, [isConnected, send, addToast, addLog]);

  // ── Macro management ─────────────────────────────────────────────────────
  const handleRunMacro = useCallback(async (index) => {
    if (!isConnected) return;
    const ok = await send({ cmd: "run_macro", index });
    if (!ok) addToast("Nie udało się uruchomić makra", "error");
    else addLog(`Wysłano run_macro #${index}`, "info");
  }, [isConnected, send, addToast, addLog]);

  const handleFetchMacros = useCallback(async () => {
    if (!isConnected) return;
    const ok = await send({ cmd: "get_macros" });
    if (!ok) addToast("Nie udało się pobrać makr", "error");
    else {
      addLog("Pobieranie makr...", "info");
      addToast("Pobieranie makr...", "info");
    }
  }, [isConnected, send, addToast, addLog]);

  const handleSaveMacros = useCallback(async () => {
    if (!isConnected) return;
    const ok = await send({
      cmd: "set_macros",
      data: {
        macros: stepsToDeviceCode(macrosRef.current),
        strings: stringsRef.current,
      },
    });
    if (!ok) addToast("Nie udało się zapisać makr", "error");
    else addLog("Wysłano set_macros", "info");
  }, [isConnected, send, addToast, addLog]);

  // ── Key editing ──────────────────────────────────────────────────────────
  const updateKey = useCallback((row, col, value) => {
    setLayers((prev) =>
      prev.map((l, li) =>
        li === activeLayer
          ? { ...l, keys: l.keys.map((r, ri) => ri === row ? r.map((k, ci) => ci === col ? value : k) : r) }
          : l,
      ),
    );
    setActiveKey(null);
  }, [activeLayer]);

  // ── Layer rename ─────────────────────────────────────────────────────────
  const startRename = (i, currentName) => {
    setEditingLayerName(i);
    setRenameValue(currentName);
  };

  const commitRename = (i) => {
    if (renameValue.trim()) {
      setLayers((prev) => prev.map((l, li) => li === i ? { ...l, name: renameValue.trim() } : l));
    }
    setEditingLayerName(null);
  };

  // ── Macro/String helpers ────────────────────────────────────────────────
  const handleAddMacro = useCallback(() => {
    const idx = macros.length;
    setMacros(prev => [...prev, { name: `Makro ${idx}`, steps: [] }]);
  }, [macros.length]);

  const handleAddString = useCallback((text) => {
    setStrings(prev => [...prev, text]);
  }, []);

  // ── Import/Export/Reset ──────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const { layers: deviceLayers, encoder: deviceEncoder } = uiLayersToDevice(layersRef.current);
    const config = {
      layers: deviceLayers,
      encoder: deviceEncoder,
      macros: stepsToDeviceCode(macrosRef.current),
      strings: stringsRef.current,
      _layerNames: layersRef.current.map(l => l.name),
      _version: 2,
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "macropad-config.json";
    a.click();
    URL.revokeObjectURL(url);
    addToast("Konfiguracja wyeksportowana", "success");
  }, [addToast]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data.layers || !Array.isArray(data.layers)) {
            addToast("Nieprawidłowy plik konfiguracji", "error");
            return;
          }
          const names = data._layerNames || DEFAULT_LAYERS.map(l => l.name);
          const newLayers = deviceLayersToUI(data.layers, data.encoder, layersRef.current, data.macros || [], data.strings || []);
          newLayers.forEach((l, i) => { l.name = names[i] || `Layer ${i}`; });
          setLayers(newLayers);
          if (Array.isArray(data.macros)) setMacros(macroCodeToSteps(data.macros));
          if (Array.isArray(data.strings)) setStrings(data.strings);
          addToast("Konfiguracja zaimportowana", "success");
        } catch (err) {
          addToast("Błąd parsowania pliku: " + err.message, "error");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [addToast]);

  const handleReset = useCallback(() => {
    setLayers(DEFAULT_LAYERS);
    setMacros(DEFAULT_MACROS);
    setStrings(DEFAULT_STRINGS);
    addToast("Zresetowano do ustawień domyślnych", "info");
  }, [addToast]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <style>{`
        @keyframes slide-in { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
        .animate-slide-in { animation: slide-in 0.18s ease; }
        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
        {toasts.map((t) => (<Toast key={t.id} toast={t} onDismiss={dismissToast} />))}
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-slate-900 px-6 py-4 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-3">
            <Cpu className="text-blue-500 w-7 h-7" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">ESP32 <span className="text-blue-500">Macropad</span></h1>
              {deviceLayer !== null && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Aktywna warstwa: <span className="text-blue-400">{layers[deviceLayer]?.name ?? deviceLayer}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowMacroManager(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs transition-all border border-slate-700 text-slate-500 hover:text-slate-300">
              <Terminal size={13} /> Makra
            </button>
            <button onClick={() => setShowMonitor((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs transition-all border ${
                showMonitor ? "bg-slate-800 border-slate-600 text-slate-200" : "border-slate-700 text-slate-500 hover:text-slate-300"
              }`}>
              <Terminal size={13} /> Monitor
            </button>
            <button onClick={handleConnectToggle}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm transition-all ${
                isConnected
                  ? "bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30"
              }`}>
              {isConnected ? <><Unlink size={15} /> Połączono</> : <><Link size={15} /> Połącz USB</>}
            </button>
          </div>
        </header>

        {/* Config loading warning */}
        {isConnected && !configLoaded && (
          <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-700/40 text-amber-300 text-sm px-5 py-3 rounded-xl mb-5">
            <AlertTriangle size={15} className="shrink-0" />
            Pobieranie konfiguracji z urządzenia — widoczny profil jest tymczasowy.
          </div>
        )}

        {/* Macro progress */}
        <MacroProgressBar progress={macroProgress} />

        {/* Layer tabs */}
        <div className="flex gap-1 mb-5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 flex-wrap">
          {layers.map((l, i) => (
            <div key={i} className="relative">
              {editingLayerName === i ? (
                <input type="text" value={renameValue} autoFocus
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => commitRename(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename(i);
                    if (e.key === 'Escape') setEditingLayerName(null);
                  }}
                  className="px-4 py-2 rounded-lg text-sm bg-slate-800 text-blue-400 border border-blue-500 outline-none w-28" />
              ) : (
                <button onClick={() => { setActiveLayer(i); if (isConnected) send({ cmd: "set_layer", layer: i }); }}
                  onDoubleClick={() => startRename(i, l.name)}
                  className={`relative px-4 py-2 rounded-lg text-sm transition-all ${
                    activeLayer === i ? "bg-slate-800 text-blue-400" : "text-slate-400 hover:text-slate-200"
                  }`}>
                  {l.name}
                  {deviceLayer === i && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-400" title="Aktywna warstwa urządzenia" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Encoder wheel */}
        {layers[activeLayer] && (
          <div className="mb-6 p-4 bg-slate-900 rounded-xl border border-slate-800">
            <div className="text-center text-xs text-slate-500 mb-1">Enkoder</div>
            <EncoderWheel
              encoder={layers[activeLayer].encoder}
              onEdit={(type) => setActiveEncoderAction({ type, action: layers[activeLayer].encoder?.[type] || '' })}
              onAnim={(dir) => fireEncoder(dir)}
              animRotation={encoderAnim.rotation}
              animGlow={encoderAnim.glow}
              macros={macros}
              strings={strings}
            />
          </div>
        )}

        {/* 4×4 key grid */}
        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto mb-8">
          {layers[activeLayer]?.keys.map((row, rIdx) =>
            row.map((key, cIdx) => {
              const pressed = !!activeKeysMap[`${rIdx}-${cIdx}`];
              return (
                <button key={`${rIdx}-${cIdx}`}
                  onClick={() => setActiveKey({ rIdx, cIdx })}
                  className={`relative flex flex-col items-center justify-center rounded-2xl border-2 transition-all h-24 ${
                    pressed
                      ? "border-blue-400 bg-blue-500/20 scale-95 shadow-[0_0_18px_rgba(59,130,246,0.4)]"
                      : "border-slate-800 bg-slate-900 hover:border-slate-600 hover:bg-slate-800/60"
                  }`}>
                  <span className={`text-[10px] absolute top-2 left-2.5 italic ${pressed ? "text-blue-300" : "text-slate-600"}`}>
                    {rIdx},{cIdx}
                  </span>
                  <span className="text-base font-semibold truncate max-w-[90%]">{getKeyDisplayString(key, macros, strings)}</span>
                </button>
              );
            }),
          )}
        </div>

        {/* Save + Import/Export/Reset */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          <button disabled={!isConnected} onClick={handleSave}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 text-sm">
            <Save size={17} /> Zapisz w urządzeniu
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all border border-slate-700">
            <Download size={14} /> Eksportuj JSON
          </button>
          <button onClick={handleImport}
            className="flex items-center gap-1.5 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all border border-slate-700">
            <Upload size={14} /> Importuj JSON
          </button>
          <button onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all border border-slate-700">
            <RotateCcw size={14} /> Resetuj
          </button>
        </div>

        {/* Serial monitor */}
        {showMonitor && <SerialMonitor logs={serialLogs} onClear={() => setSerialLogs([])} />}
      </div>

      {/* Key editor modal */}
      {activeKey && (
        <KeyEditorModal
          activeKey={activeKey}
          layerName={layers[activeLayer].name}
          currentBinding={String(layers[activeLayer].keys[activeKey.rIdx][activeKey.cIdx] || "")}
          onUpdate={(val) => updateKey(activeKey.rIdx, activeKey.cIdx, val)}
          onClose={() => setActiveKey(null)}
          macros={macros} onAddMacro={handleAddMacro}
          strings={strings} onAddString={handleAddString}
        />
      )}

      {/* Encoder editor modal */}
      {activeEncoderAction && (
        <EncoderEditorModal
          activeEncoderAction={activeEncoderAction}
          layerName={layers[activeLayer].name}
          currentBinding={activeEncoderAction.action}
          onUpdate={(val) => {
            setLayers((prev) => prev.map((l, li) =>
              li === activeLayer
                ? { ...l, encoder: { ...l.encoder, [activeEncoderAction.type]: val } }
                : l,
            ));
            setActiveEncoderAction(null);
          }}
          onClose={() => setActiveEncoderAction(null)}
          macros={macros} onAddMacro={handleAddMacro}
          strings={strings} onAddString={handleAddString}
        />
      )}

      {/* Macro manager modal */}
      {showMacroManager && (
        <MacroManagerModal
          macros={macros}
          onRun={handleRunMacro}
          onRefresh={handleFetchMacros}
          onSave={handleSaveMacros}
          onClose={() => setShowMacroManager(false)}
          isConnected={isConnected}
        />
      )}
    </div>
  );
}
