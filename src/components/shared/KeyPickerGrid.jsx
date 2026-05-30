import { KEY_CATEGORIES } from "../../constants/hidCodes";

const ALL_CATEGORIES = { ...KEY_CATEGORIES, Makra: [], Tekst: [] };

export default function KeyPickerGrid({ activeTab, onTabChange, baseKey, onSelect, macros, strings, onAddMacro }) {
  const macroItems = macros.map((m, i) => ({ label: m.name || `M:${i}`, value: `M:${i}` }));
  const stringItems = strings.map((s, i) => ({
    label: `"${s.length > 20 ? s.slice(0, 20) + "..." : s}"`,
    value: `T:${i}`,
  }));

  const cats = { ...ALL_CATEGORIES };
  cats.Makra = macroItems;
  cats.Tekst = stringItems;
  const items = cats[activeTab] || [];

  return (
    <div>
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
        {Object.keys(cats).map((cat) => (
          <button
            key={cat}
            onClick={() => onTabChange(cat)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all font-label-md ${
              activeTab === cat
                ? "bg-surface-container-high text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 max-h-[240px] overflow-y-auto">
        {activeTab === "Makra" && macroItems.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-on-surface-variant mb-3">No macros defined</p>
            <button
              onClick={() => { onAddMacro(); }}
              className="px-4 py-2 bg-primary-container text-on-primary-container rounded-full text-xs font-medium glow-primary hover:bg-inverse-primary transition-colors"
            >
              + Create macro
            </button>
          </div>
        )}

        {activeTab === "Tekst" && stringItems.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-on-surface-variant">No strings defined</p>
          </div>
        )}

        {(activeTab !== "Makra" || macroItems.length > 0) && (activeTab !== "Tekst" || stringItems.length > 0) && (
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => onSelect("")}
              className={`py-2 rounded-lg text-xs border transition-all font-code-sm ${
                baseKey === ""
                  ? "bg-secondary-container/20 border-secondary/50 text-secondary"
                  : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              (None)
            </button>
            {items.map((k) => {
              const val = typeof k === "string" ? k : k.value;
              const lbl = typeof k === "string" ? k : k.label;
              const isSelected = baseKey === val || baseKey === lbl;
              return (
                <button
                  key={val}
                  onClick={() => onSelect(val)}
                  className={`py-2 rounded-lg text-xs border transition-all truncate font-code-sm ${
                    isSelected
                      ? "bg-secondary-container/20 border-secondary/50 text-secondary"
                      : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {lbl}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
