import {
  MEDIA_MAP,
  MEDIA_MAP_REV,
  HID_NAMED,
  HID_NAMED_REV,
  MOD_MAP,
} from "../constants/hidCodes.js";

const PREFIX_MACRO = "M:";
const PREFIX_STRING = "T:";

function cellToBinding(cell) {
  if (!cell || cell === "") return 0;

  // Layer L0-L4
  if (/^L[0-4]$/.test(cell)) {
    return { t: 4, k: parseInt(cell.slice(1), 10) };
  }

  // Media by name
  if (MEDIA_MAP[cell] !== undefined) {
    return { t: 2, k: MEDIA_MAP[cell] };
  }

  // Macro M:index
  if (cell.startsWith(PREFIX_MACRO)) {
    const idx = parseInt(cell.slice(2), 10);
    if (!isNaN(idx) && idx >= 0 && idx <= 15) {
      return { t: 3, k: idx };
    }
  }

  // String T:text (inline)
  if (cell.startsWith(PREFIX_STRING)) {
    const text = cell.slice(2);
    return { t: 5, s: text };
  }

  // Keystroke — parse modifiers + key
  let mods = 0;
  let keyChar = cell;

  if (cell.includes("+")) {
    const parts = cell.split("+");
    keyChar = parts.pop();
    parts.forEach((p) => {
      if (MOD_MAP[p] !== undefined) mods |= MOD_MAP[p];
    });
  } else if (MOD_MAP[cell] !== undefined) {
    return { t: 1, m: MOD_MAP[cell], k: 0 };
  }

  let keyVal = 0;
  if (HID_NAMED[keyChar] !== undefined) {
    keyVal = HID_NAMED[keyChar];
  } else if (keyChar.length === 1) {
    keyVal = keyChar.toLowerCase().charCodeAt(0);
  }

  return { t: 1, m: mods, k: keyVal };
}

function bindingToUiString(binding, macros) {
  if (!binding || binding === 0) return "";

  const t = binding.t;
  const m = binding.m || 0;
  const k = binding.k || 0;

  // Layer
  if (t === 4) return `L${k}`;

  // Media
  if (t === 2) return MEDIA_MAP_REV[k] || `Media:${k}`;

  // Macro
  if (t === 3) {
    const name = macros?.[k]?.name;
    return `${PREFIX_MACRO}${k}${name ? ` (${name})` : ""}`;
  }

  // String inline
  if (t === 5) {
    const s = binding.s || "";
    return `${PREFIX_STRING}${s}`;
  }

  // Key (t === 1)
  let str = "";
  if (m & 1) str += "Ctrl+";
  if (m & 2) str += "Shift+";
  if (m & 4) str += "Alt+";
  if (m & 8) str += "GUI+";

  if (k === 0) return str.slice(0, -1);

  if (HID_NAMED_REV[k] !== undefined) {
    str += HID_NAMED_REV[k];
  } else if (k >= 32 && k <= 126) {
    str += String.fromCharCode(k).toUpperCase();
  } else {
    str += `0x${k.toString(16).toUpperCase()}`;
  }
  return str;
}

export function deviceLayersToUI(rawLayers, rawEncoder, uiLayers) {
  return rawLayers.map((rawLayer, li) => {
    const existing = uiLayers?.[li];
    const name = existing?.name ?? `Layer ${li}`;

    let keys = Array.isArray(rawLayer) && Array.isArray(rawLayer[0])
      ? rawLayer.map((row) =>
          Array.isArray(row)
            ? row.map((cell) => bindingToUiString(cell))
            : Array(4).fill(""),
        )
      : Array(4).fill(null).map(() => Array(4).fill(""));

    let encoder = { left: "", right: "", button: "" };
    const enc = rawEncoder?.[li];
    if (enc) {
      encoder.left = enc.left != null ? bindingToUiString(enc.left) : "";
      encoder.right = enc.right != null ? bindingToUiString(enc.right) : "";
      encoder.button = enc.button != null ? bindingToUiString(enc.button) : "";
    }

    return { name, keys, encoder };
  });
}

export function uiLayersToDevice(uiLayers) {
  return {
    layers: uiLayers.map((layer) =>
      layer.keys.map((row) =>
        row.map((cell) => cellToBinding(cell)),
      ),
    ),
    encoder: uiLayers.map((layer) => ({
      left: layer.encoder?.left != null ? cellToBinding(layer.encoder.left) : 0,
      right: layer.encoder?.right != null ? cellToBinding(layer.encoder.right) : 0,
      button: layer.encoder?.button != null ? cellToBinding(layer.encoder.button) : 0,
    })),
  };
}

export function getKeyDisplayString(cell, macros) {
  if (!cell || cell === "") return "\u2014";

  if (cell.startsWith("M:")) {
    const idx = parseInt(cell.slice(2), 10);
    if (!isNaN(idx) && macros?.[idx]) {
      return macros[idx].name || cell;
    }
    return cell;
  }

  if (cell.startsWith("T:")) {
    const text = cell.slice(2);
    return text ? `"${text}"` : cell;
  }

  return cell || "\u2014";
}

export function macroCodeToSteps(rawMacros) {
  if (!Array.isArray(rawMacros)) return [];
  return rawMacros.map((m) => ({
    name: m.name || "Macro",
    steps: Array.isArray(m.steps) ? m.steps.map((s) => {
      const step = { delay: s.delay ?? 0 };
      if (s.text !== undefined && s.text !== "") {
        step.text = s.text;
      } else {
        step.keycode = s.keycode ?? 0;
      }
      return step;
    }) : [],
  }));
}

export function stepsToDeviceCode(macros) {
  return macros.map((m) => ({
    name: m.name,
    steps: m.steps.map((s) => {
      const step = { delay: s.delay ?? 0 };
      if (s.text !== undefined && s.text !== "") {
        step.text = s.text;
      } else {
        step.keycode = s.keycode ?? 0;
      }
      return step;
    }),
  }));
}
