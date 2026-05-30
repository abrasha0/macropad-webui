import { useLayout } from "../../hooks/useLayout";
import { useDevice } from "../../hooks/useDevice";

export default function LayerTabs() {
  const { layers, activeLayer, handleLayerChange, startRename, editingLayerName, renameValue, commitRename, setEditingLayerName, setRenameValue } = useLayout();
  const { deviceLayer } = useDevice();

  return (
    <div className="flex gap-1 bg-surface-container p-1.5 rounded-xl border border-outline-variant/30 shrink-0">
      {layers.map((l, i) => (
        <div key={i} className="relative">
          {editingLayerName === i ? (
            <input
              type="text"
              value={renameValue}
              autoFocus
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => commitRename(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename(i);
                if (e.key === "Escape") setEditingLayerName(null);
              }}
              className="px-3 py-2 rounded-lg text-sm bg-surface-container-high text-primary border border-primary outline-none w-28 font-label-md"
            />
          ) : (
            <button
              onClick={() => handleLayerChange(i)}
              onDoubleClick={() => startRename(i, l.name)}
              className={`relative px-3 py-2 rounded-lg text-sm transition-all font-label-md ${
                activeLayer === i
                  ? "bg-surface-container-high text-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50"
              }`}
            >
              {l.name}
              {deviceLayer === i && (
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-tertiary connected-dot" />
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
