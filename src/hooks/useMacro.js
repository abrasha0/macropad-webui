import { createContext, useContext } from "react";

export const MacroContext = createContext(null);

export function useMacro() {
  const ctx = useContext(MacroContext);
  if (!ctx) throw new Error("useMacro must be used within MacroProvider");
  return ctx;
}
