import { Plus, Trash2, Keyboard, Play } from "lucide-react";
import { useMacro } from "../../hooks/useMacro";
import { useDevice } from "../../hooks/useDevice";

export default function MacroLibrary() {
  const { macros, selectedMacro, setSelectedMacro, handleAddMacro, handleRemoveMacro, handleRunMacro } = useMacro();
  const { isConnected } = useDevice();

  return (
    <div className="flex flex-col bg-surface-container border border-outline-variant/30 rounded-[1.5rem] overflow-hidden shadow-lg shadow-black/20">
      <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-highest/30 shrink-0">
        <h2 className="font-headline-md text-[18px] text-on-surface font-semibold">Library</h2>
        <button
          onClick={handleAddMacro}
          className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:bg-primary transition-colors shadow-[0_0_10px_rgba(124,77,255,0.4)] hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 min-h-0">
        {macros.length === 0 ? (
          <div className="text-center py-8">
            <Keyboard size={32} className="text-outline-variant mx-auto mb-2" />
            <p className="text-sm text-on-surface-variant">No macros defined</p>
            <p className="text-xs text-outline mt-1">Click + to create one</p>
          </div>
        ) : (
          macros.map((m, i) => (
            <button
              key={i}
              onClick={() => setSelectedMacro(i)}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-left group transition-all border ${
                selectedMacro === i
                  ? "bg-surface-variant/80 border-outline-variant text-primary"
                  : "bg-transparent border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Keyboard size={16} className="shrink-0" />
                <span className="font-body-md text-body-md truncate">{m.name || `Macro ${i}`}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="font-label-md text-[10px] text-outline px-1.5 py-0.5 rounded-full border border-outline-variant/30">
                  {m.steps?.length || 0} steps
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRunMacro(i); }}
                  disabled={!isConnected}
                  className="p-1.5 text-tertiary hover:bg-surface-container-high rounded-lg disabled:opacity-30 transition-colors"
                  title="Run macro"
                >
                  <Play size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveMacro(i); }}
                  className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors"
                  title="Delete macro"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
