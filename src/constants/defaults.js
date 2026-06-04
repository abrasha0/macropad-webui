export const MACRO_MAX = 16;
export const MACRO_MAX_STEPS = 32;

export const DEFAULT_LAYERS = [
  {
    name: "Numpad",
    keys: [
      ["7", "8", "9", "/"],
      ["4", "5", "6", "*"],
      ["1", "2", "3", "-"],
      ["0", ".", "Enter", "+"],
    ],
    encoder: { left: "Vol Up", right: "Vol Down", button: "Play/Pause" },
  },
  {
    name: "NFS Underground 2",
    keys: [
      ["Esc", "", "", "Enter"],
      ["Shift", "Up", "Ctrl", "C"],
      ["Left", "Down", "Right", "Space"],
      ["N", "", "", "M"],
    ],
    encoder: { left: "Shift", right: "Ctrl", button: "Space" },
  },
  {
    name: "CS2",
    keys: [
      ["B", "M", "Tab", "Esc"],
      ["1", "2", "3", "G"],
      ["Z", "X", "C", "V"],
      ["Shift", "Ctrl", "R", "E"],
    ],
    encoder: { left: "[", right: "]", button: "R" },
  },
  {
    name: "Custom 1",
    keys: Array(4).fill(null).map(() => Array(4).fill("")),
    encoder: { left: "", right: "", button: "" },
  },
  {
    name: "Custom 2",
    keys: Array(4).fill(null).map(() => Array(4).fill("")),
    encoder: { left: "", right: "", button: "" },
  },
];

export const DEFAULT_MACROS = [];
