import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, actions }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-surface/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-container border border-outline-variant/30 rounded-xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-container-padding py-4 border-b border-outline-variant/20">
            <h3 className="font-headline-md text-headline-md text-on-surface">{title}</h3>
            <button
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface rounded-full p-1 hover:bg-surface-variant transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-container-padding py-4 flex-1 overflow-y-auto">{children}</div>
        {actions && (
          <div className="px-container-padding py-4 border-t border-outline-variant/20 bg-surface-container-lowest rounded-b-xl flex justify-end gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
