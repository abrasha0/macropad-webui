import { useState, useCallback, useEffect } from "react";
import { MacroContext } from "../hooks/useMacro";
import { useDevice } from "../hooks/useDevice";
import { useToast } from "../hooks/useToast";
import { stepsToDeviceCode } from "../utils/binding";

export function MacroProvider({ children, macros, setMacros, onMacroProgress }) {
  const { send, isConnected } = useDevice();
  const { addToast } = useToast();
  const [selectedMacro, setSelectedMacro] = useState(null);
  const [macroProgress, setMacroProgress] = useState(null);

  const handleAddMacro = useCallback(() => {
    const idx = macros.length;
    setMacros((prev) => [...prev, { name: `Macro ${idx}`, steps: [] }]);
    setSelectedMacro(idx);
  }, [macros.length, setMacros]);

  const handleRemoveMacro = useCallback((idx) => {
    setMacros((prev) => prev.filter((_, i) => i !== idx));
    setSelectedMacro((prev) => {
      if (prev === idx) return null;
      if (prev > idx) return prev - 1;
      return prev;
    });
  }, [setMacros]);

  const handleUpdateMacroName = useCallback((idx, name) => {
    setMacros((prev) => prev.map((m, i) => i === idx ? { ...m, name } : m));
  }, [setMacros]);

  const handleUpdateMacroSteps = useCallback((idx, steps) => {
    setMacros((prev) => prev.map((m, i) => i === idx ? { ...m, steps } : m));
  }, [setMacros]);

  const handleRunMacro = useCallback(async (index) => {
    if (!isConnected) return;
    const ok = await send({ cmd: "run_macro", index });
    if (!ok) addToast("Failed to run macro", "error");
  }, [isConnected, send, addToast]);

  const handleSaveMacros = useCallback(async () => {
    if (!isConnected) return;
    const ok = await send({ cmd: "set_macros", data: { macros: stepsToDeviceCode(macros) } });
    if (!ok) addToast("Failed to save macros", "error");
    else addToast("Macros saved", "success");
  }, [isConnected, send, macros, addToast]);

  const handleMacroProgress = useCallback((msg) => {
    setMacroProgress({ index: msg.index, step: msg.step, total: msg.total });
    if (msg.step >= msg.total) setTimeout(() => setMacroProgress(null), 1500);
  }, []);

  useEffect(() => {
    onMacroProgress?.(handleMacroProgress);
  }, [onMacroProgress, handleMacroProgress]);

  return (
    <MacroContext.Provider
      value={{
        macros, selectedMacro, macroProgress,
        setSelectedMacro,
        handleAddMacro, handleRemoveMacro,
        handleUpdateMacroName, handleUpdateMacroSteps,
        handleRunMacro, handleSaveMacros, handleMacroProgress,
      }}
    >
      {children}
    </MacroContext.Provider>
  );
}
