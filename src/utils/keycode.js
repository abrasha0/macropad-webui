import {
  KEY_TYPE,
  MEDIA_MAP,
  MEDIA_MAP_REV,
  HID_NAMED,
  HID_NAMED_REV,
  MOD_MAP,
} from "../constants/hidCodes.js";

const PREFIX_MACRO = "M:";
const PREFIX_STRING = "T:";

export function cellToType(value) {
  const type = (value & 0xf000) >> 12;
  const mods = (value & 0x0f00) >> 8;
  const key = value & 0x00ff;
  return { type, mods, key };
}

function uiCellToKeycode(cell) {
  if (!cell || cell === "") return 0;

  if (cell.startsWith("L") && /^L[0-4]$/.test(cell)) {
    return (KEY_TYPE.LAYER << 12) | parseInt(cell.slice(1));
  }

  if (MEDIA_MAP[cell] !== undefined) {
    return (KEY_TYPE.MEDIA << 12) | MEDIA_MAP[cell];
  }

  if (cell.startsWith(PREFIX_MACRO)) {
    const idx = parseInt(cell.slice(2), 10);
    if (!isNaN(idx) && idx >= 0) {
      return (KEY_TYPE.MACRO << 12) | (idx & 0xff);
    }
  }

  if (cell.startsWith(PREFIX_STRING)) {
    const idx = parseInt(cell.slice(2), 10);
    if (!isNaN(idx) && idx >= 0) {
      return (KEY_TYPE.STRING << 12) | (idx & 0xff);
    }
  }

  let mods = 0;
  let keyChar = cell;

  if (cell.includes("+")) {
    const parts = cell.split("+");
    keyChar = parts.pop();
    parts.forEach((p) => {
      if (MOD_MAP[p] !== undefined) mods |= MOD_MAP[p];
    });
  } else if (MOD_MAP[cell] !== undefined) {
    return MOD_MAP[cell] << 8;
  }

  let keyVal = 0;
  if (HID_NAMED[keyChar] !== undefined) {
    keyVal = HID_NAMED[keyChar];
  } else if (keyChar.length === 1) {
    keyVal = keyChar.toLowerCase().charCodeAt(0);
  }

  return (mods << 8) | keyVal;
}

function keycodeToUiString(code, macros, strings) {
  if (code === 0) return "";

  const { type, mods, key } = cellToType(code);

  if (type === KEY_TYPE.LAYER) return `L${key}`;

  if (type === KEY_TYPE.MEDIA) {
    return MEDIA_MAP_REV[key] || `Media:${key}`;
  }

  if (type === KEY_TYPE.MACRO) {
    const name = macros?.[key]?.name;
    return `${PREFIX_MACRO}${key}${name ? ` (${name})` : ""}`;
  }

  if (type === KEY_TYPE.STRING) {
    const text = strings?.[key];
    return `${PREFIX_STRING}${key}${text ? ` ("${text}")` : ""}`;
  }

  let str = "";
  if (mods & 1) str += "Ctrl+";
  if (mods & 2) str += "Shift+";
  if (mods & 4) str += "Alt+";
  if (mods & 8) str += "GUI+";

  if (key === 0) return str.slice(0, -1);

  if (HID_NAMED_REV[key] !== undefined) {
    str += HID_NAMED_REV[key];
  } else if (key >= 32 && key <= 126) {
    str += String.fromCharCode(key).toUpperCase();
  } else {
    str += `0x${key.toString(16).toUpperCase()}`;
  }
  return str;
}

export function deviceLayersToUI(rawLayers, uiLayers, macros, strings) {
  return rawLayers.map((rawLayer, li) => {
    const existing = uiLayers[li];
    const name = existing?.name ?? `Layer ${li}`;

    let keys = Array.isArray(rawLayer.keys)
      ? rawLayer.keys.map((row) =>
          Array.isArray(row)
            ? row.map((cell) => keycodeToUiString(cell, macros, strings))
            : Array(4).fill(""),
        )
      : Array(4).fill(null).map(() => Array(4).fill(""));

    let encoder = { left: "", right: "", press: "" };

    if (rawLayer.encoder) {
      const enc = rawLayer.encoder;
      encoder.left = enc.left != null ? keycodeToUiString(enc.left, macros, strings) : "";
      encoder.right = enc.right != null ? keycodeToUiString(enc.right, macros, strings) : "";
      encoder.press = enc.press != null ? keycodeToUiString(enc.press, macros, strings) : "";
    }

    return { name, keys, encoder };
  });
}

export function uiLayersToDevice(uiLayers) {
  return uiLayers.map((layer) => ({
    keys: layer.keys.map((row) =>
      row.map((cell) => uiCellToKeycode(cell)),
    ),
    encoder: {
      left: layer.encoder?.left != null ? uiCellToKeycode(layer.encoder.left) : 0,
      right: layer.encoder?.right != null ? uiCellToKeycode(layer.encoder.right) : 0,
      press: layer.encoder?.press != null ? uiCellToKeycode(layer.encoder.press) : 0,
    },
  }));
}

export function getKeyDisplayString(cell, macros, strings) {
  if (!cell || cell === "") return "\u2014";

  if (cell.startsWith("M:")) {
    const idx = parseInt(cell.slice(2), 10);
    if (!isNaN(idx) && macros?.[idx]) {
      return macros[idx].name || cell;
    }
    return cell;
  }

  if (cell.startsWith("T:")) {
    const idx = parseInt(cell.slice(2), 10);
    if (!isNaN(idx) && strings?.[idx] !== undefined) {
      return `"${strings[idx]}"`;
    }
    return cell;
  }

  return cell || "\u2014";
}

export function macroCodeToSteps(rawMacros) {
  if (!Array.isArray(rawMacros)) return [];
  return rawMacros.map((m) => ({
    name: m.name || `Macro ${rawMacros.indexOf(m)}`,
    steps: Array.isArray(m.steps) ? m.steps.map((s) => ({
      keycode: s.keycode ?? 0,
      delay: s.delay ?? 0,
    })) : [],
  }));
}

export function stepsToDeviceCode(macros) {
  return macros.map((m) => ({
    name: m.name,
    steps: m.steps.map((s) => ({
      keycode: s.keycode,
      delay: s.delay,
    })),
  }));
}
