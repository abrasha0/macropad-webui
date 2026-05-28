// src/App.jsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { useSerial } from "./hooks/useSerial";
import {
  Cpu,
  Save,
  Link,
  Unlink,
  Settings2,
  Terminal,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
} from "lucide-react";

// ─── Defaults (fallback only — device is source of truth) ────────────────────
const DEFAULT_LAYERS = [
  {
    name: "Numpad",
    keys: [
      ["NumLock", "/", "*", "-"],
      ["7", "8", "9", "+"],
      ["4", "5", "6", "BS"],
      ["1", "2", "3", "Ent"],
    ],
    encoder: {
      left: "Vol Down",
      right: "Vol Up",
      press: "Mute",
    },
  },
  {
    name: "NFS: U2",
    keys: [
      ["Esc", "", "", "Ent"],
      ["Shift", "Up", "Ctrl", "C"],
      ["Left", "Down", "Right", "Space"],
      ["N", "", "", "M"],
    ],
    encoder: {
      left: "Shift",
      right: "Ctrl",
      press: "Space",
    },
  },
  {
    name: "CS2",
    keys: [
      ["B", "M", "Tab", "Esc"],
      ["1", "2", "3", "G"],
      ["Z", "X", "C", "V"],
      ["Shift", "Ctrl", "R", "E"],
    ],
    encoder: {
      left: "[",   // Previous weapon (often [ or ] in games, but let's use a placeholder)
      right: "]",  // Next weapon
      press: "R",  // Reload
    },
  },
  {
    name: "Custom 1",
    keys: Array(4)
      .fill(null)
      .map(() => Array(4).fill("")),
    encoder: {
      left: "",
      right: "",
      press: "",
    },
  },
  {
    name: "Custom 2",
    keys: Array(4)
      .fill(null)
      .map(() => Array(4).fill("")),
    encoder: {
      left: "",
      right: "",
      press: "",
    },
  },
];

const KEY_CATEGORIES = {
  "Litery & Cyfry": [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
  ],
  Specjalne: ["Enter", "Esc", "Backspace", "Tab", "Space", "Del", "Ins"],
  Nawigacja: ["Up", "Down", "Left", "Right", "Home", "End"],
  Funkcyjne: [
    "F1",
    "F2",
    "F3",
    "F4",
    "F5",
    "F6",
    "F7",
    "F8",
    "F9",
    "F10",
    "F11",
    "F12",
  ],
  "Media i System": [
    "Vol Up",
    "Vol Down",
    "Mute",
    "Play/Pause",
    "Next Track",
    "Prev Track",
    "Stop",
    "Calc",
    "Web",
  ],
  Warstwy: ["L0", "L1", "L2", "L3", "L4"],
};

// Dodaj tę mapę gdzieś nad funkcją uiLayersToDevice
const MEDIA_MAP = {
  "Vol Up": 1,
  "Vol Down": 2,
  Mute: 3,
  "Play/Pause": 4,
  "Next Track": 5,
  "Prev Track": 6,
  Stop: 7,
  Calc: 8,
  Web: 9,
};

// ─── Layer format conversion ─────────────────────────────────────────────────
// Firmware stores keycodes as uint16 numbers. UI uses { name, keys[][] } with
// strings. These two functions translate between the formats.

function deviceLayersToUI(rawLayers, uiLayers) {
  return rawLayers.map((rawLayer, li) => {
    const existingLayer = uiLayers[li];
    const name = existingLayer?.name ?? `Layer ${li}`;

    // Convert keys matrix
    let keys = Array.isArray(rawLayer.keys)
      ? rawLayer.keys.map((row) =>
          Array.isArray(row)
            ? row.map((cell) => {
                if (cell === 0) return "";

                const type = (cell & 0xf000) >> 12;
                const mods = (cell & 0x0f00) >> 8;
                const key = cell & 0x00ff;

                // 1. Zmiana warstwy
                if (type === 3) return `L${key}`;

                // 2. Klawisze multimedialne
                if (type === 1) {
                  const revMedia = Object.fromEntries(
                    Object.entries(MEDIA_MAP).map(([k, v]) => [v, k]),
                  );
                  return revMedia[key] || `M${key}`;
                }

                // 3. Kombinacje i modyfikatory
                let str = "";
                if (mods & 1) str += "Ctrl+";
                if (mods & 2) str += "Shift+";
                if (mods & 4) str += "Alt+";
                if (mods & 8) str += "GUI+";

                const namedRev = {
                  0xb0: "Enter",
                  0xb1: "Esc",
                  0xb2: "Backspace",
                  0xb3: "Tab",
                  0x20: "Space",
                  0xda: "Up",
                  0xd9: "Down",
                  0xd8: "Left",
                  0xd7: "Right",
                  0xc2: "F1",
                  0xc3: "F2",
                  0xc4: "F3",
                  0xc5: "F4",
                  0xc6: "F5",
                  0xc7: "F6",
                  0xc8: "F7",
                  0xc9: "F8",
                  0xca: "F9",
                  0xcb: "F10",
                  0xcc: "F11",
                  0xcd: "F12",
                  0x2b: "+",
                  0x2d: "-",
                  0x2a: "*",
                  0x2f: "/",
                };

                if (key === 0) return str.slice(0, -1); // Tylko modyfikatory (np. samo "Ctrl")

                if (namedRev[key]) {
                  str += namedRev[key];
                } else if (key >= 32 && key <= 126) {
                  str += String.fromCharCode(key).toUpperCase();
                } else {
                  str += `0x${key.toString(16).toUpperCase()}`;
                }
                return str;
              })
            : Array(4).fill(""),
        )
      : Array(4)
          .fill(null)
          .map(() => Array(4).fill(""));

    // Convert encoder values
    let encoder = { left: "", right: "", press: "" };
    if (rawLayer.encoder) {
      // Left encoder
      if (rawLayer.encoder.left !== undefined && rawLayer.encoder.left !== null) {
        const cell = rawLayer.encoder.left;
        if (cell === 0) encoder.left = "";
        else {
          const type = (cell & 0xf000) >> 12;
          const mods = (cell & 0x0f00) >> 8;
          const key = cell & 0x00ff;

          // 1. Zmiana warstwy
          if (type === 3) encoder.left = `L${key}`;
          // 2. Klawisze multimedialne
          else if (type === 1) {
            const revMedia = Object.fromEntries(
              Object.entries(MEDIA_MAP).map(([k, v]) => [v, k]),
            );
            encoder.left = revMedia[key] || `M${key}`;
          }
          // 3. Kombinacje i modyfikatory
          else {
            let str = "";
            if (mods & 1) str += "Ctrl+";
            if (mods & 2) str += "Shift+";
            if (mods & 4) str += "Alt+";
            if (mods & 8) str += "GUI+";

            const namedRev = {
              0xb0: "Enter",
              0xb1: "Esc",
              0xb2: "Backspace",
              0xb3: "Tab",
              0x20: "Space",
              0xda: "Up",
              0xd9: "Down",
              0xd8: "Left",
              0xd7: "Right",
              0xc2: "F1",
              0xc3: "F2",
              0xc4: "F3",
              0xc5: "F4",
              0xc6: "F5",
              0xc7: "F6",
              0xc8: "F7",
              0xc9: "F8",
              0xca: "F9",
              0xcb: "F10",
              0xcc: "F11",
              0xcd: "F12",
              0x2b: "+",
              0x2d: "-",
              0x2a: "*",
              0x2f: "/",
            };

            if (key === 0) str = str.slice(0, -1); // Tylko modyfikatory

            if (namedRev[key]) {
              str += namedRev[key];
            } else if (key >= 32 && key <= 126) {
              str += String.fromCharCode(key).toUpperCase();
            } else {
              str += `0x${key.toString(16).toUpperCase()}`;
            }
            encoder.left = str;
          }
        }
      }

      // Right encoder
      if (rawLayer.encoder.right !== undefined && rawLayer.encoder.right !== null) {
        const cell = rawLayer.encoder.right;
        if (cell === 0) encoder.right = "";
        else {
          const type = (cell & 0xf000) >> 12;
          const mods = (cell & 0x0f00) >> 8;
          const key = cell & 0x00ff;

          // 1. Zmiana warstwy
          if (type === 3) encoder.right = `L${key}`;
          // 2. Klawisze multimedialne
          else if (type === 1) {
            const revMedia = Object.fromEntries(
              Object.entries(MEDIA_MAP).map(([k, v]) => [v, k]),
            );
            encoder.right = revMedia[key] || `M${key}`;
          }
          // 3. Kombinacje i modyfikatory
          else {
            let str = "";
            if (mods & 1) str += "Ctrl+";
            if (mods & 2) str += "Shift+";
            if (mods & 4) str += "Alt+";
            if (mods & 8) str += "GUI+";

            const namedRev = {
              0xb0: "Enter",
              0xb1: "Esc",
              0xb2: "Backspace",
              0xb3: "Tab",
              0x20: "Space",
              0xda: "Up",
              0xd9: "Down",
              0xd8: "Left",
              0xd7: "Right",
              0xc2: "F1",
              0xc3: "F2",
              0xc4: "F3",
              0xc5: "F4",
              0xc6: "F5",
              0xc7: "F6",
              0xc8: "F7",
              0xc9: "F8",
              0xca: "F9",
              0xcb: "F10",
              0xcc: "F11",
              0xcd: "F12",
              0x2b: "+",
              0x2d: "-",
              0x2a: "*",
              0x2f: "/",
            };

            if (key === 0) str = str.slice(0, -1); // Tylko modyfikatory

            if (namedRev[key]) {
              str += namedRev[key];
            } else if (key >= 32 && key <= 126) {
              str += String.fromCharCode(key).toUpperCase();
            } else {
              str += `0x${key.toString(16).toUpperCase()}`;
            }
            encoder.right = str;
          }
        }
      }

      // Press encoder
      if (rawLayer.encoder.press !== undefined && rawLayer.encoder.press !== null) {
        const cell = rawLayer.encoder.press;
        if (cell === 0) encoder.press = "";
        else {
          const type = (cell & 0xf000) >> 12;
          const mods = (cell & 0x0f00) >> 8;
          const key = cell & 0x00ff;

          // 1. Zmiana warstwy
          if (type === 3) encoder.press = `L${key}`;
          // 2. Klawisze multimedialne
          else if (type === 1) {
            const revMedia = Object.fromEntries(
              Object.entries(MEDIA_MAP).map(([k, v]) => [v, k]),
            );
            encoder.press = revMedia[key] || `M${key}`;
          }
          // 3. Kombinacje i modyfikatory
          else {
            let str = "";
            if (mods & 1) str += "Ctrl+";
            if (mods & 2) str += "Shift+";
            if (mods & 4) str += "Alt+";
            if (mods & 8) str += "GUI+";

            const namedRev = {
              0xb0: "Enter",
              0xb1: "Esc",
              0xb2: "Backspace",
              0xb3: "Tab",
              0x20: "Space",
              0xda: "Up",
              0xd9: "Down",
              0xd8: "Left",
              0xd7: "Right",
              0xc2: "F1",
              0xc3: "F2",
              0xc4: "F3",
              0xc5: "F4",
              0xc6: "F5",
              0xc7: "F6",
              0xc8: "F7",
              0xc9: "F8",
              0xca: "F9",
              0xcb: "F10",
              0xcc: "F11",
              0xcd: "F12",
              0x2b: "+",
              0x2d: "-",
              0x2a: "*",
              0x2f: "/",
            };

            if (key === 0) str = str.slice(0, -1); // Tylko modyfikatory

            if (namedRev[key]) {
              str += namedRev[key];
            } else if (key >= 32 && key <= 126) {
              str += String.fromCharCode(key).toUpperCase();
            } else {
              str += `0x${key.toString(16).toUpperCase()}`;
            }
            encoder.press = str;
          }
        }
      }
    }

    return { name, keys, encoder };
  });
}

function uiLayersToDevice(uiLayers) {
  return uiLayers.map((layer) => {
    // Convert keys matrix
    const keys = layer.keys.map((row) =>
      row.map((cell) => {
        if (!cell || cell === "") return 0;

        // 1. Zmiana warstwy
        if (cell.startsWith("L") && !isNaN(cell.slice(1))) {
          return 0x3000 | parseInt(cell.slice(1));
        }

        // 2. Klawisze multimedialne
        if (MEDIA_MAP[cell]) return 0x1000 | MEDIA_MAP[cell];

        // 3. Kombinacje (np. "Ctrl+Shift+C")
        let mods = 0;
        let keyChar = cell;
        const modMap = { Ctrl: 1, Shift: 2, Alt: 4, GUI: 8 };

        if (cell.includes("+")) {
          const parts = cell.split("+");
          keyChar = parts.pop(); // Ostatni element to właściwy klawisz
          parts.forEach((p) => {
            if (modMap[p]) mods |= modMap[p];
          });
        } else if (modMap[cell]) {
          return modMap[cell] << 8; // Pojedynczy modyfikator
        }

        // HID z BleKeyboard
        const named = {
          Enter: 0xb0,
          Esc: 0xb1,
          Backspace: 0xb2,
          Tab: 0xb3,
          Space: 0x20,
          Ent: 0xb0,
          BS: 0xb2,
          Up: 0xda,
          Down: 0xd9,
          Left: 0xd8,
          Right: 0xd7,
          F1: 0xc2,
          F2: 0xc3,
          F3: 0xc4,
          F4: 0xc5,
          F5: 0xc6,
          F6: 0xc7,
          F7: 0xc8,
          F8: 0xc9,
          F9: 0xca,
          F10: 0xcb,
          F11: 0xcc,
          F12: 0xcd,
          "+": 0x2b,
          "-": 0x2d,
          "*": 0x2a,
          "/": 0x2f,
        };

        let keyVal = 0;
        if (named[keyChar]) {
          keyVal = named[keyChar];
        } else if (keyChar.length === 1) {
          keyVal = keyChar.toLowerCase().charCodeAt(0);
        }

        return (mods << 8) | keyVal;
      }),
    );

    // Convert encoder values
    const encoder = {
      left: 0,
      right: 0,
      press: 0,
    };

    if (layer.encoder) {
      // Left encoder
      if (layer.encoder.left !== undefined && layer.encoder.left !== null && layer.encoder.left !== "") {
        encoder.left = uiLayerCellToDeviceCode(layer.encoder.left);
      }

      // Right encoder
      if (layer.encoder.right !== undefined && layer.encoder.right !== null && layer.encoder.right !== "") {
        encoder.right = uiLayerCellToDeviceCode(layer.encoder.right);
      }

      // Press encoder
      if (layer.encoder.press !== undefined && layer.encoder.press !== null && layer.encoder.press !== "") {
        encoder.press = uiLayerCellToDeviceCode(layer.encoder.press);
      }
    }

    return { keys, encoder };
  });
}

// Helper function to convert UI string to device code (same logic as in uiLayersToDevice for keys)
function uiLayerCellToDeviceCode(cell) {
  if (!cell || cell === "") return 0;

  // 1. Zmiana warstwy
  if (cell.startsWith("L") && !isNaN(cell.slice(1))) {
    return 0x3000 | parseInt(cell.slice(1));
  }

  // 2. Klawisze multimedialne
  if (MEDIA_MAP[cell]) return 0x1000 | MEDIA_MAP[cell];

  // 3. Kombinacje (np. "Ctrl+Shift+C")
  let mods = 0;
  let keyChar = cell;
  const modMap = { Ctrl: 1, Shift: 2, Alt: 4, GUI: 8 };

  if (cell.includes("+")) {
    const parts = cell.split("+");
    keyChar = parts.pop(); // Ostatni element to właściwy klawisz
    parts.forEach((p) => {
      if (modMap[p]) mods |= modMap[p];
    });
  } else if (modMap[cell]) {
    return modMap[cell] << 8; // Pojedynczy modyfikator
  }

  // HID z BleKeyboard
  const named = {
    Enter: 0xb0,
    Esc: 0xb1,
    Backspace: 0xb2,
    Tab: 0xb3,
    Space: 0x20,
    Ent: 0xb0,
    BS: 0xb2,
    Up: 0xda,
    Down: 0xd9,
    Left: 0xd8,
    Right: 0xd7,
    F1: 0xc2,
    F2: 0xc3,
    F3: 0xc4,
    F4: 0xc5,
    F5: 0xc6,
    F6: 0xc7,
    F7: 0xc8,
    F8: 0xc9,
    F9: 0xca,
    F10: 0xcb,
    F11: 0xcc,
    F12: 0xcd,
    "+": 0x2b,
    "-": 0x2d,
    "*": 0x2a,
    "/": 0x2f,
  };

  let keyVal = 0;
  if (named[keyChar]) {
    keyVal = named[keyChar];
  } else if (keyChar.length === 1) {
    keyVal = keyChar.toLowerCase().charCodeAt(0);
  }

  return (mods << 8) | keyVal;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
let _toastId = 0;

function Toast({ toast, onDismiss }) {
  const cfg = {
    success: {
      icon: <CheckCircle size={15} />,
      cls: "border-emerald-800 text-emerald-400",
    },
    error: {
      icon: <AlertCircle size={15} />,
      cls: "border-red-800    text-red-400",
    },
    warn: {
      icon: <AlertTriangle size={15} />,
      cls: "border-amber-800  text-amber-400",
    },
    info: { icon: <Info size={15} />, cls: "border-sky-800    text-sky-400" },
  };
  const { icon, cls } = cfg[toast.level] ?? cfg.info;

  return (
    <div
      className={`flex items-start gap-2 bg-slate-900 border ${cls} px-4 py-3 rounded-xl shadow-xl max-w-sm text-sm animate-slide-in`}
    >
      <span className="shrink-0 mt-0.5">{icon}</span>
      <span className="flex-1 text-slate-200">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-600 hover:text-slate-300 ml-1"
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ─── Serial Monitor ───────────────────────────────────────────────────────────
function SerialMonitor({ logs, onClear }) {
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const lvlCls = {
    error: "text-red-400",
    warn: "text-amber-400",
    info: "text-sky-400",
    raw: "text-slate-400",
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden mt-6">
      <div className="flex justify-between items-center px-4 py-2 border-b border-slate-800 bg-slate-900">
        <span className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Terminal size={12} /> Serial Monitor
        </span>
        <button
          onClick={onClear}
          className="text-xs text-slate-600 hover:text-slate-300"
        >
          Wyczyść
        </button>
      </div>
      <div className="font-mono text-xs h-44 overflow-y-auto p-3 space-y-0.5">
        {logs.length === 0 ? (
          <span className="text-slate-700">Brak wiadomości...</span>
        ) : (
          logs.map((log, i) => (
            <div
              key={i}
              className={`${lvlCls[log.level] ?? "text-slate-400"} leading-relaxed`}
            >
              <span className="text-slate-700 mr-2 select-none">
                {log.time}
              </span>
              {log.message}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ─── Key Editor Modal Component ───────────────────────────────────────────────
function KeyEditorModal({
  activeKey,
  layerName,
  currentBinding,
  onUpdate,
  onClose,
}) {
  const hasMod = (mod) => currentBinding.includes(`${mod}+`);
  const isMediaOrLayer =
    currentBinding.startsWith("L") || MEDIA_MAP[currentBinding];
  const baseKey = currentBinding.split("+").pop() || "";

  const [editMods, setEditMods] = useState({
    Ctrl: hasMod("Ctrl"),
    Shift: hasMod("Shift"),
    Alt: hasMod("Alt"),
    GUI: hasMod("GUI"),
  });

  const [activeTab, setActiveTab] = useState(Object.keys(KEY_CATEGORIES)[0]);

  const applyBinding = (selectedBase) => {
    let finalBinding = selectedBase;
    if (!selectedBase.startsWith("L") && !MEDIA_MAP[selectedBase]) {
      const m = [];
      if (editMods.Ctrl) m.push("Ctrl");
      if (editMods.Shift) m.push("Shift");
      if (editMods.Alt) m.push("Alt");
      if (editMods.GUI) m.push("GUI");

      if (m.length > 0)
        finalBinding = m.join("+") + (selectedBase ? "+" + selectedBase : "");
    }
    onUpdate(finalBinding);
  };

  const toggleMod = (mod) =>
    setEditMods((prev) => ({ ...prev, [mod]: !prev[mod] }));

  return (
    <div
      className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Settings2 size={20} className="text-blue-500" />
            Edytor Akcji Klawisza
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Konfigurujesz przycisk [{activeKey.rIdx}, {activeKey.cIdx}] na
            warstwie {layerName}
          </p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* Modyfikatory */}
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Modyfikatory (Opcjonalnie)
            </p>
            <div className="flex gap-3">
              {["Ctrl", "Shift", "Alt", "GUI"].map((mod) => (
                <button
                  key={mod}
                  onClick={() => toggleMod(mod)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    editMods[mod]
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          {/* Kategorie klawiszy */}
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Klawisz Główny
            </p>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {Object.keys(KEY_CATEGORIES).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeTab === cat
                      ? "bg-slate-700 text-blue-400"
                      : "bg-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 grid grid-cols-6 gap-2">
              <button
                onClick={() => applyBinding("")}
                className={`py-2 rounded-lg text-sm border transition-all ${
                  baseKey === ""
                    ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-400"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                }`}
              >
                (Brak)
              </button>

              {(KEY_CATEGORIES[activeTab] || []).map((k) => (
                <button
                  key={k}
                  onClick={() => applyBinding(k)}
                  className={`py-2 rounded-lg text-sm border transition-all ${
                    baseKey === k
                      ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-400"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-950 rounded-b-3xl flex justify-between items-center">
          <button
            onClick={() => onUpdate("")}
            className="px-5 py-2.5 text-sm font-medium text-red-400 border border-red-900/50 hover:bg-red-900/20 rounded-xl transition-all"
          >
            Wyczyść klawisz
          </button>
          <button
            onClick={() => applyBinding(baseKey || "")}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/30 transition-all"
          >
            Gotowe
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Encoder Editor Modal Component ───────────────────────────────────────────
function EncoderEditorModal({
  activeEncoderAction,
  layerName,
  currentBinding,
  onUpdate,
  onClose,
}) {
  const hasMod = (mod) => currentBinding.includes(`${mod}+`);
  const isMediaOrLayer =
    currentBinding.startsWith("L") || MEDIA_MAP[currentBinding];
  const baseKey = currentBinding.split("+").pop() || "";

  const [editMods, setEditMods] = useState({
    Ctrl: hasMod("Ctrl"),
    Shift: hasMod("Shift"),
    Alt: hasMod("Alt"),
    GUI: hasMod("GUI"),
  });

  const [activeTab, setActiveTab] = useState(Object.keys(KEY_CATEGORIES)[0]);

  const applyBinding = (selectedBase) => {
    let finalBinding = selectedBase;
    if (!selectedBase.startsWith("L") && !MEDIA_MAP[selectedBase]) {
      const m = [];
      if (editMods.Ctrl) m.push("Ctrl");
      if (editMods.Shift) m.push("Shift");
      if (editMods.Alt) m.push("Alt");
      if (editMods.GUI) m.push("GUI");

      if (m.length > 0)
        finalBinding = m.join("+") + (selectedBase ? "+" + selectedBase : "");
    }
    onUpdate(finalBinding);
  };

  const toggleMod = (mod) =>
    setEditMods((prev) => ({ ...prev, [mod]: !prev[mod] }));

  return (
    <div
      className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Settings2 size={20} className="text-blue-500" />
            Edytor Akcji Enkodera
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Konfigurujesz enkoder {activeEncoderAction.type === 'left' ? '←' : activeEncoderAction.type === 'right' ? '→' : '⏺'} na
            warstwie {layerName}
          </p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* Modyfikatory */}
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Modyfikatory (Opcjonalnie)
            </p>
            <div className="flex gap-3">
              {["Ctrl", "Shift", "Alt", "GUI"].map((mod) => (
                <button
                  key={mod}
                  onClick={() => toggleMod(mod)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    editMods[mod]
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          {/* Kategorie klawiszy */}
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Klawisz Główny
            </p>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {Object.keys(KEY_CATEGORIES).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeTab === cat
                      ? "bg-slate-700 text-blue-400"
                      : "bg-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 grid grid-cols-6 gap-2">
              <button
                onClick={() => applyBinding("")}
                className={`py-2 rounded-lg text-sm border transition-all ${
                  baseKey === ""
                    ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-400"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                }`}
              >
                (Brak)
              </button>

              {(KEY_CATEGORIES[activeTab] || []).map((k) => (
                <button
                  key={k}
                  onClick={() => applyBinding(k)}
                  className={`py-2 rounded-lg text-sm border transition-all ${
                    baseKey === k
                      ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-400"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-950 rounded-b-3xl flex justify-between items-center">
          <button
            onClick={() => onUpdate("")}
            className="px-5 py-2.5 text-sm font-medium text-red-400 border border-red-900/50 hover:bg-red-900/20 rounded-xl transition-all"
          >
            Wyczyść akcję
          </button>
          <button
            onClick={() => applyBinding(baseKey || "")}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/30 transition-all"
          >
            Gotowe
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { connect, send, disconnect, isConnected } = useSerial();

  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [activeLayer, setActiveLayer] = useState(0);
  const [deviceLayer, setDeviceLayer] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [activeEncoderAction, setActiveEncoderAction] = useState(null); // {type: 'left'|'right'|'press', action: 'Vol Up' etc.}
  const [activeEncoderControls, setActiveEncoderControls] = useState({ left: false, right: false, press: false }); // For UI feedback when clicking encoder controls
  const [activeKeysMap, setActiveKeysMap] = useState({});
  const [toasts, setToasts] = useState([]);
  const [serialLogs, setSerialLogs] = useState([]);
  const [showMonitor, setShowMonitor] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);

  // Keep a ref to layers so callbacks never go stale without re-creating them
  const layersRef = useRef(layers);
  useEffect(() => {
    layersRef.current = layers;
  }, [layers]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const addToast = useCallback((message, level = "info") => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, message, level }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4500,
    );
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addLog = useCallback((message, level = "info") => {
    const time = new Date().toLocaleTimeString("pl-PL", { hour12: false });
    setSerialLogs((prev) => [...prev.slice(-300), { message, level, time }]);
  }, []);

  // ── Serial message handler — stable, reads layers via ref ─────────────
  const handleSerialMessage = useCallback(
    (msg) => {
      addLog(JSON.stringify(msg), "raw");

      switch (msg.cmd) {
        case "config": {
          const rawLayers = msg.data?.layers;
          if (Array.isArray(rawLayers) && rawLayers.length > 0) {
            // Convert numeric keycodes from firmware into UI-friendly strings,
            // preserving layer names from the current UI state (firmware has none)
            setLayers((prev) => deviceLayersToUI(rawLayers, prev));
            setConfigLoaded(true);
            addToast("Konfiguracja załadowana z urządzenia", "success");
            addLog("Załadowano konfigurację", "info");
          } else {
            addToast(
              "Urządzenie zwróciło pustą konfigurację — używam domyślnych",
              "warn",
            );
            addLog("Pusta konfiguracja w odpowiedzi", "warn");
            setConfigLoaded(true); // don't keep showing the warning banner
          }
          break;
        }
        case "key_state": {
          const keyId = `${msg.row}-${msg.col}`;
          setActiveKeysMap((prev) => {
            const next = { ...prev };
            if (msg.isPressed) next[keyId] = true;
            else delete next[keyId];
            return next;
          });
          break;
        }
        case "key_pressed": {
          // Backward compat with old firmware
          const keyId = `${msg.row}-${msg.col}`;
          setActiveKeysMap((prev) => ({ ...prev, [keyId]: true }));
          setTimeout(() => {
            setActiveKeysMap((prev) => {
              const n = { ...prev };
              delete n[keyId];
              return n;
            });
          }, 200);
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
          addToast(
            msg.msg || (ok ? "OK" : "Błąd operacji"),
            ok ? "success" : "error",
          );
          addLog(msg.msg || msg.status, ok ? "info" : "error");
          break;
        }
        case "log": {
          addLog(msg.msg, msg.level ?? "info");
          if (msg.level === "error")
            addToast(`[Urządzenie] ${msg.msg}`, "error");
          if (msg.level === "warn") addToast(`[Urządzenie] ${msg.msg}`, "warn");
          break;
        }
        default:
          break;
      }
    },
    [addLog, addToast],
  ); // layersRef is a ref — no need in deps

  const handleError = useCallback(
    (err) => {
      addToast(err.message, "error");
      addLog(err.message, "error");
    },
    [addToast, addLog],
  );

  // ── Connection ────────────────────────────────────────────────────────────
  const handleConnectToggle = useCallback(async () => {
    if (isConnected) {
      await disconnect();
      addToast("Rozłączono od urządzenia", "info");
      addLog("Rozłączono", "info");
      setDeviceLayer(null);
      setConfigLoaded(false);
      setActiveKeysMap({});
      return;
    }
    await connect(handleSerialMessage, handleError);
  }, [
    isConnected,
    connect,
    disconnect,
    handleSerialMessage,
    handleError,
    addToast,
    addLog,
  ]);

  // When we first connect, request config + active layer from device
  const connectedOnce = useRef(false);
  useEffect(() => {
    if (!isConnected) {
      connectedOnce.current = false;
      return;
    }
    if (connectedOnce.current) return; // don't re-request on re-render
    connectedOnce.current = true;

    addToast("Połączono z urządzeniem!", "success");
    addLog("Połączono. Pobieranie konfiguracji...", "info");

    // Small delay so the device has time to settle after the port opens
    const t = setTimeout(async () => {
      await send({ cmd: "get_config" });
      await send({ cmd: "get_layer" });
    }, 600);
    return () => clearTimeout(t);
  }, [isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Config save ───────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!isConnected) return;
    // Convert UI string labels → numeric keycodes before sending to firmware
    const deviceLayers = uiLayersToDevice(layersRef.current);
    const ok = await send({
      cmd: "set_config",
      data: { layers: deviceLayers },
    });
    if (!ok) addToast("Nie udało się wysłać konfiguracji", "error");
    else addLog("Wysłano konfigurację do urządzenia...", "info");
  }, [isConnected, send, addToast, addLog]);

  // ── Key editing ───────────────────────────────────────────────────────────
  const updateKey = useCallback(
    (row, col, value) => {
      setLayers((prev) =>
        prev.map((l, li) =>
          li === activeLayer
            ? {
                ...l,
                keys: l.keys.map((r, ri) =>
                  ri === row ? r.map((k, ci) => (ci === col ? value : k)) : r,
                ),
              }
            : l,
        ),
      );
      setActiveKey(null);
    },
    [activeLayer],
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <style>{`
        @keyframes slide-in {
          from { opacity:0; transform:translateX(16px); }
          to   { opacity:1; transform:translateX(0);    }
        }
        .animate-slide-in { animation: slide-in 0.18s ease; }
      `}</style>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-slate-900 px-6 py-4 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-3">
            <Cpu className="text-blue-500 w-7 h-7" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                ESP32 <span className="text-blue-500">Macropad</span>
              </h1>
              {deviceLayer !== null && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Aktywna warstwa:{" "}
                  <span className="text-blue-400">
                    {layers[deviceLayer]?.name ?? deviceLayer}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMonitor((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs transition-all border ${
                showMonitor
                  ? "bg-slate-800 border-slate-600 text-slate-200"
                  : "border-slate-700 text-slate-500 hover:text-slate-300"
              }`}
            >
              <Terminal size={13} /> Monitor
            </button>

            <button
              onClick={handleConnectToggle}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm transition-all ${
                isConnected
                  ? "bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30"
              }`}
            >
              {isConnected ? (
                <>
                  <Unlink size={15} /> Połączono
                </>
              ) : (
                <>
                  <Link size={15} /> Połącz USB
                </>
              )}
            </button>
          </div>
        </header>

        {/* Config loading warning */}
        {isConnected && !configLoaded && (
          <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-700/40 text-amber-300 text-sm px-5 py-3 rounded-xl mb-5">
            <AlertTriangle size={15} className="shrink-0" />
            Pobieranie konfiguracji z urządzenia — widoczny profil jest
            tymczasowy.
          </div>
        )}

        {/* Layer tabs */}
        <div className="flex gap-1 mb-5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 flex-wrap">
          {layers.map((l, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveLayer(i);
                // TO ROZWIĄZUJE PROBLEM 3: WebUI wymusza fizyczną zmianę na Macropadzie
                if (isConnected) send({ cmd: "set_layer", layer: i });
              }}
              className={`relative px-4 py-2 rounded-lg text-sm transition-all ${
                activeLayer === i
                  ? "bg-slate-800 text-blue-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {l.name}
              {deviceLayer === i && (
                <span
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-400"
                  title="Aktywna warstwa urządzenia"
                />
              )}
            </button>
          ))}
        </div>

        {/* Encoder controls */}
        {layers[activeLayer] && (
          <div className="flex items-center gap-4 mb-6 p-4 bg-slate-900 rounded-xl border border-slate-800">
            <div className="flex flex-col items-center">
              <div className="text-xs text-slate-500 mb-1">Enkoder ←</div>
              <div
                onClick={() => {
                  setActiveEncoderAction({ type: 'left', action: layers[activeLayer]?.encoder?.left || '' });
                  setActiveEncoderControls(prev => ({ ...prev, left: true }));
                  setTimeout(() => setActiveEncoderControls(prev => ({ ...prev, left: false })), 200);
                }}
                className={`flex items-center gap-2 rounded-2xl border-2 transition-all h-12 w-28 ${
                  layers[activeLayer]?.encoder?.left || activeEncoderControls.left
                    ? "border-blue-400 bg-blue-500/20"
                    : "border-slate-800 bg-slate-900 hover:border-slate-600 hover:bg-slate-800/60"
                }`}
              >
                <span className="text-[10px] absolute -left-2 -top-2 italic text-slate-600">
                  L
                </span>
                <span className="text-base font-semibold">
                  {layers[activeLayer]?.encoder?.left || "—"}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-xs text-slate-500 mb-1">Enkoder →</div>
              <div
                onClick={() => {
                  setActiveEncoderAction({ type: 'right', action: layers[activeLayer]?.encoder?.right || '' });
                  setActiveEncoderControls(prev => ({ ...prev, right: true }));
                  setTimeout(() => setActiveEncoderControls(prev => ({ ...prev, right: false })), 200);
                }}
                className={`flex items-center gap-2 rounded-2xl border-2 transition-all h-12 w-28 ${
                  layers[activeLayer]?.encoder?.right || activeEncoderControls.right
                    ? "border-blue-400 bg-blue-500/20"
                    : "border-slate-800 bg-slate-900 hover:border-slate-600 hover:bg-slate-800/60"
                }`}
              >
                <span className="text-[10px] absolute -left-2 -top-2 italic text-slate-600">
                  R
                </span>
                <span className="text-base font-semibold">
                  {layers[activeLayer]?.encoder?.right || "—"}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-xs text-slate-500 mb-1">Enkoder ⏺</div>
              <div
                onClick={() => {
                  setActiveEncoderAction({ type: 'press', action: layers[activeLayer]?.encoder?.press || '' });
                  setActiveEncoderControls(prev => ({ ...prev, press: true }));
                  setTimeout(() => setActiveEncoderControls(prev => ({ ...prev, press: false })), 200);
                }}
                className={`flex items-center gap-2 rounded-2xl border-2 transition-all h-12 w-28 ${
                  layers[activeLayer]?.encoder?.press || activeEncoderControls.press
                    ? "border-blue-400 bg-blue-500/20"
                    : "border-slate-800 bg-slate-900 hover:border-slate-600 hover:bg-slate-800/60"
                }`}
              >
                <span className="text-[10px] absolute -left-2 -top-2 italic text-slate-600">
                  P
                </span>
                <span className="text-base font-semibold">
                  {layers[activeLayer]?.encoder?.press || "—"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4×4 key grid */}
        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto mb-8">
          {layers[activeLayer].keys.map((row, rIdx) =>
            row.map((key, cIdx) => {
              const pressed = !!activeKeysMap[`${rIdx}-${cIdx}`];
              return (
                <button
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => setActiveKey({ rIdx, cIdx })}
                  className={`relative flex flex-col items-center justify-center rounded-2xl border-2 transition-all h-24 ${
                    pressed
                      ? "border-blue-400 bg-blue-500/20 scale-95 shadow-[0_0_18px_rgba(59,130,246,0.4)]"
                      : "border-slate-800 bg-slate-900 hover:border-slate-600 hover:bg-slate-800/60"
                  }`}
                >
                  <span
                    className={`text-[10px] absolute top-2 left-2.5 italic ${pressed ? "text-blue-300" : "text-slate-600"}`}
                  >
                    {rIdx},{cIdx}
                  </span>
                  <span className="text-base font-semibold">{key || "—"}</span>
                </button>
              );
            }),
          )}
        </div>

        {/* Save */}
        <div className="flex justify-center mb-4">
          <button
            disabled={!isConnected}
            onClick={handleSave}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 text-sm"
          >
            <Save size={17} /> Zapisz w urządzeniu
          </button>
        </div>

        {/* Serial monitor */}
        {showMonitor && (
          <SerialMonitor logs={serialLogs} onClear={() => setSerialLogs([])} />
        )}
      </div>

      {/* Key editor modal */}
      {activeKey && (
        <KeyEditorModal
          activeKey={activeKey}
          layerName={layers[activeLayer].name}
          currentBinding={String(
            layers[activeLayer].keys[activeKey.rIdx][activeKey.cIdx] || "",
          )}
          onUpdate={(val) => updateKey(activeKey.rIdx, activeKey.cIdx, val)}
          onClose={() => setActiveKey(null)}
        />
      )}
      
      {/* Encoder editor modal */}
      {activeEncoderAction && (
        <EncoderEditorModal
          activeEncoderAction={activeEncoderAction}
          layerName={layers[activeLayer].name}
          currentBinding={activeEncoderAction.action}
          onUpdate={(val) => {
            // Update the appropriate encoder property based on type
            setLayers((prev) =>
              prev.map((l, li) =>
                li === activeLayer
                  ? {
                      ...l,
                      encoder: {
                        ...l.encoder,
                        [activeEncoderAction.type]: val,
                      },
                    }
                  : l
              ),
            );
            setActiveEncoderAction(null);
          }}
          onClose={() => setActiveEncoderAction(null)}
        />
      )}
    </div>
  );
}
