import { useState, useCallback } from "react";
import { MacroContext } from "../hooks/useMacro";
import { useDevice } from "../hooks/useDevice";
import { useToast } from "../hooks/useToast";
import { macroCodeToSteps, stepsToDeviceCode } from "../utils/keycode";

export function MacroProvider({ children, macros, setMacros, strings, setStrings }) {
  const { send, isConnected } = useDevice();
  const { addToast } = useToast();
  const [selectedMacro, setSelectedMacro] = useState(null);
  const [macroProgress, setMacroProgress] = useState(null);

  const handleAddMacro = useCallback(() => {
    const idx = macros.length;
    setMacros((prev) => [...prev, { name: `Macro ${idx}`, steps: [] }]);
    setSelectedMacro(idx);
  }, [macros.length, setMacros]);

  const handleRemoveMacro = useCallback(
    (idx) => {
      setMacros((prev) => prev.filter((_, i) => i !== idx));
      if (selectedMacro === idx) setSelectedMacro(null);
      else if (selectedMacro > idx) setSelectedMacro((prev) => prev - 1);
    },
    [selectedMacro, setMacros],
  );

  const handleUpdateMacroName = useCallback(
    (idx, name) => {
      setMacros((prev) => prev.map((m, i) => (i === idx ? { ...m, name } : m)));
    },
    [setMacros],
  );

  const handleUpdateMacroSteps = useCallback(
    (idx, steps) => {
      setMacros((prev) => prev.map((m, i) => (i === idx ? { ...m, steps } : m)));
    },
    [setMacros],
  );

  const handleAddString = useCallback(
    (text) => setStrings((prev) => [...prev, text]),
    [setStrings],
  );

  const handleRemoveString = useCallback(
    (idx) => setStrings((prev) => prev.filter((_, i) => i !== idx)),
    [setStrings],
  );

  const handleUpdateString = useCallback(
    (idx, text) => setStrings((prev) => prev.map((s, i) => (i === idx ? text : s))),
    [setStrings],
  );

  const handleRunMacro = useCallback(
    async (index) => {
      if (!isConnected) return;
      const ok = await send({ cmd: "run_macro", index });
      if (!ok) addToast("Failed to run macro", "error");
    },
    [isConnected, send, addToast],
  );

  const handleFetchMacros = useCallback(async () => {
    if (!isConnected) return;
    const ok = await send({ cmd: "get_macros" });
    if (!ok) addToast("Failed to fetch macros", "error");
  }, [isConnected, send, addToast]);

  const handleSaveMacros = useCallback(async () => {
    if (!isConnected) return;
    const ok = await send({
      cmd: "set_macros",
      data: { macros: stepsToDeviceCode(macros), strings },
    });
    if (!ok) addToast("Failed to save macros", "error");
    else addToast("Macros saved", "success");
  }, [isConnected, send, macros, strings, addToast]);

  const handleMacroProgress = useCallback((msg) => {
    setMacroProgress({ index: msg.index, step: msg.step, total: msg.total });
    if (msg.step >= msg.total) {
      setTimeout(() => setMacroProgress(null), 1500);
    }
  }, []);

  const handleMacrosMsg = useCallback(
    (msg) => {
      if (Array.isArray(msg.data)) setMacros(macroCodeToSteps(msg.data));
      if (Array.isArray(msg.strings)) setStrings(msg.strings);
    },
    [setMacros, setStrings],
  );

  return (
    <MacroContext.Provider
      value={{
        macros,
        strings,
        selectedMacro,
        macroProgress,
        setSelectedMacro,
        handleAddMacro,
        handleRemoveMacro,
        handleUpdateMacroName,
        handleUpdateMacroSteps,
        handleAddString,
        handleRemoveString,
        handleUpdateString,
        handleRunMacro,
        handleFetchMacros,
        handleSaveMacros,
        handleMacroProgress,
        handleMacrosMsg,
      }}
    >
      {children}
    </MacroContext.Provider>
  );
}
