import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToast } from "../../hooks/useToast";

const CFG = {
  success: { icon: CheckCircle, cls: "border-tertiary/50 text-tertiary" },
  error: { icon: AlertCircle, cls: "border-error/50 text-error" },
  warn: { icon: AlertTriangle, cls: "border-secondary/50 text-secondary" },
  info: { icon: Info, cls: "border-primary/50 text-primary" },
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => {
        const { icon: Icon, cls } = CFG[t.level] || CFG.info;
        return (
          <div key={t.id}
            className="pointer-events-auto flex items-start gap-3 bg-surface-container border px-4 py-3 rounded-xl shadow-xl max-w-sm animate-slide-in">
            <Icon size={16} className={`shrink-0 mt-0.5 ${cls}`} />
            <span className="flex-1 text-sm text-on-surface">{t.message}</span>
            <button onClick={() => dismissToast(t.id)} className="text-outline hover:text-on-surface ml-1">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
