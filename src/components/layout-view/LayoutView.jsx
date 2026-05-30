import LayerTabs from "./LayerTabs";
import KeyGridVisualizer from "./KeyGridVisualizer";
import KeyBindingPanel from "./KeyBindingPanel";

export default function LayoutView({ macros, strings, onAddMacro }) {

  return (
    <div className="flex-1 flex flex-col gap-gutter min-h-0">
      <LayerTabs />

      <div className="flex gap-gutter flex-1 min-h-0">
        <KeyGridVisualizer macros={macros} strings={strings} />
        <KeyBindingPanel macros={macros} strings={strings} onAddMacro={onAddMacro} />
      </div>
    </div>
  );
}
