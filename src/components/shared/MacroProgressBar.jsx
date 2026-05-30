import { useMacro } from "../../hooks/useMacro";

export default function MacroProgressBar() {
  const { macroProgress } = useMacro();

  if (!macroProgress) return null;

  const pct = macroProgress.total > 0 ? Math.round((macroProgress.step / macroProgress.total) * 100) : 0;

  return (
    <div className="bg-surface-container border border-outline-variant/30 rounded-xl p-4 mb-4">
      <div className="flex justify-between items-center mb-2 text-sm">
        <span className="text-on-surface-variant font-body-md">Executing macro #{macroProgress.index}</span>
        <span className="text-primary font-code-sm">{macroProgress.step}/{macroProgress.total}</span>
      </div>
      <div className="h-2 bg-surface-container-lowest rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-container rounded-full transition-all duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
