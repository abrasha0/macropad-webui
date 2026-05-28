export const MACRO_MAX = 32;
export const MACRO_MAX_STEPS = 64;

export const DEFAULT_LAYERS = [
  {
    name: "Numpad",
    keys: [
      ["NumLock", "/", "*", "-"],
      ["7", "8", "9", "+"],
      ["4", "5", "6", "BS"],
      ["1", "2", "3", "Ent"],
    ],
    encoder: { left: "Vol Down", right: "Vol Up", press: "Mute" },
  },
  {
    name: "NFS: U2",
    keys: [
      ["Esc", "", "", "Ent"],
      ["Shift", "Up", "Ctrl", "C"],
      ["Left", "Down", "Right", "Space"],
      ["N", "", "", "M"],
    ],
    encoder: { left: "Shift", right: "Ctrl", press: "Space" },
  },
  {
    name: "CS2",
    keys: [
      ["B", "M", "Tab", "Esc"],
      ["1", "2", "3", "G"],
      ["Z", "X", "C", "V"],
      ["Shift", "Ctrl", "R", "E"],
    ],
    encoder: { left: "[", right: "]", press: "R" },
  },
  {
    name: "Custom 1",
    keys: Array(4).fill(null).map(() => Array(4).fill("")),
    encoder: { left: "", right: "", press: "" },
  },
  {
    name: "Custom 2",
    keys: Array(4).fill(null).map(() => Array(4).fill("")),
    encoder: { left: "", right: "", press: "" },
  },
];

export const DEFAULT_MACROS = [];
export const DEFAULT_STRINGS = [];
