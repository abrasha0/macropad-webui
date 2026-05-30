import { Play, Save, Plus, Trash2, ArrowRight, Timer, GripVertical } from "lucide-react";
import { useState } from "react";
import { useMacro } from "../../hooks/useMacro";
import { useDevice } from "../../hooks/useDevice";
import KeyPickerGrid from "../shared/KeyPickerGrid";

function StepBlock({ step, index, onChange, onRemove }) {
  const keyLabel = step.keycode === 0 ? "Wait" : (step.keycode || "—");
  const isWait = step.keycode === 0;

  return (
    <div className="flex items-center gap-3 group">
      <GripVertical size={14} className="text-outline-variant cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className={`flex flex-col items-center ${isWait ? "opacity-60" : ""}`}>
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-inner relative overflow-hidden transition-colors cursor-pointer border-2 ${
            isWait
              ? "bg-surface-container-lowest border-outline-variant"
              : "bg-surface-variant border-outline-variant hover:border-primary"
          }`}
          onClick={() => onChange(index, { keycode: 0, delay: step.delay })}
        >
          {isWait ? (
            <Timer size={18} className="text-outline" />
          ) : (
            <span className="font-code-sm text-code-sm text-on-surface font-semibold truncate px-1">{keyLabel}</span>
          )}
        </div>
        <span className="font-label-md text-[10px] text-on-surface-variant mt-1.5">
          {isWait ? "Delay" : `Step ${index + 1}`}
        </span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="bg-secondary/10 border border-secondary/30 px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer hover:bg-secondary/20 transition-colors min-w-[60px] justify-center">
          <Timer size={12} className="text-secondary" />
          <input
            type="number"
            min={0}
            max={9999}
            value={step.delay}
            onChange={(e) => onChange(index, { ...step, delay: Math.max(0, parseInt(e.target.value) || 0) })}
            className="w-12 bg-transparent text-center font-code-sm text-[11px] text-secondary outline-none"
          />
          <span className="font-code-sm text-[10px] text-secondary">ms</span>
        </div>
      </div>

      <button
        onClick={() => onRemove(index)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-on-surface-variant hover:text-error rounded hover:bg-surface-variant"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

export default function MacroEditor() {
  const {
    macros, strings, selectedMacro,
    handleUpdateMacroSteps, handleUpdateMacroName,
    handleRunMacro, handleSaveMacros, handleAddMacro,
  } = useMacro();
  const { isConnected } = useDevice();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerStepIndex, setPickerStepIndex] = useState(null);

  const macro = selectedMacro !== null ? macros[selectedMacro] : null;

  if (!macro) {
    return (
      <div className="flex-1 flex flex-col bg-surface-container border border-outline-variant/30 rounded-[1.5rem] overflow-hidden shadow-lg shadow-black/20">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-on-surface-variant font-body-md text-body-md">
              Select a macro from the library
            </p>
            <p className="text-outline text-xs mt-2">or create a new one</p>
          </div>
        </div>
      </div>
    );
  }

  const steps = macro.steps || [];

  const updateStep = (idx, updated) => {
    const newSteps = steps.map((s, i) => (i === idx ? updated : s));
    handleUpdateMacroSteps(selectedMacro, newSteps);
  };

  const removeStep = (idx) => {
    handleUpdateMacroSteps(selectedMacro, steps.filter((_, i) => i !== idx));
  };

  const addStep = () => {
    handleUpdateMacroSteps(selectedMacro, [...steps, { keycode: 0, delay: 50 }]);
  };

  const handleKeySelect = (val) => {
    if (pickerStepIndex !== null) {
      updateStep(pickerStepIndex, { ...steps[pickerStepIndex], keycode: val });
    }
    setShowPicker(false);
    setPickerStepIndex(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-surface-container border border-outline-variant/30 rounded-[1.5rem] overflow-hidden shadow-lg shadow-black/20">
      <div className="p-5 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-highest/30 shrink-0">
        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={macro.name}
            onChange={(e) => handleUpdateMacroName(selectedMacro, e.target.value)}
            className="font-headline-md text-headline-md text-primary font-bold bg-transparent outline-none border-b border-transparent focus:border-primary w-full"
          />
          <p className="font-label-md text-label-md text-on-surface-variant mt-1">
            {steps.length} step{steps.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handleRunMacro(selectedMacro)}
            disabled={!isConnected || steps.length === 0}
            className="px-4 py-2 rounded-full bg-surface-variant text-on-surface-variant hover:text-on-surface font-label-md text-label-md flex items-center gap-2 transition-colors border border-outline-variant/50 hover:border-outline-variant disabled:opacity-30"
          >
            <Play size={16} />
            Test
          </button>
          <button
            onClick={handleSaveMacros}
            disabled={!isConnected}
            className="px-4 py-2 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(124,77,255,0.3)] disabled:opacity-30"
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-surface-dim/50 relative">
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: "radial-gradient(#cac3d8 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10 flex flex-wrap items-center gap-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <StepBlock step={step} index={i} onChange={updateStep} onRemove={removeStep} />
              {i < steps.length - 1 && (
                <div className="flex items-center gap-2 text-secondary">
                  <ArrowRight size={14} className="opacity-70" />
                </div>
              )}
            </div>
          ))}
          <button
            onClick={addStep}
            className="flex items-center gap-1 text-outline hover:text-primary transition-colors pl-2"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {showPicker && (
        <div className="fixed inset-0 bg-surface/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setShowPicker(false)}>
          <div className="bg-surface-container border border-outline-variant/30 rounded-xl max-w-lg w-full shadow-2xl p-container-padding" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Select Key for Step {pickerStepIndex + 1}</h3>
            <KeyPickerGrid
              activeTab="Litery & Cyfry"
              onTabChange={() => {}}
              baseKey={steps[pickerStepIndex]?.keycode || ""}
              onSelect={handleKeySelect}
              macros={macros}
              strings={strings}
              onAddMacro={handleAddMacro}
            />
          </div>
        </div>
      )}
    </div>
  );
}
