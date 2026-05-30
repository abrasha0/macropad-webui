import MacroLibrary from "./MacroLibrary";
import MacroEditor from "./MacroEditor";

export default function MacrosView() {
  return (
    <div className="flex gap-gutter flex-1 min-h-0">
      <div className="w-1/3 min-w-0 flex flex-col min-h-0">
        <MacroLibrary />
      </div>
      <div className="flex-1 min-w-0 flex flex-col min-h-0">
        <MacroEditor />
      </div>
    </div>
  );
}
