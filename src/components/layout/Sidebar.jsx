import { Grid3X3, Keyboard, Settings, RefreshCw } from "lucide-react";
import ConnectionStatus from "../device/ConnectionStatus";

const NAV_ITEMS = [
  { id: "layout", label: "Layout", icon: Grid3X3 },
  { id: "macros", label: "Macros", icon: Keyboard },
  { id: "system", label: "System", icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-surface-container border-r border-outline-variant/30 flex flex-col py-margin-desktop z-50">
      <div className="px-container-padding mb-8">
        <h1 className="font-headline-md text-[24px] leading-[32px] font-bold text-primary tracking-tight">MacroForge</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">Configurator v2.4</p>
      </div>

      <div className="px-container-padding mb-6">
        <ConnectionStatus />
      </div>

      <nav className="flex-1 flex flex-col gap-unit px-container-padding">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex items-center gap-unit px-container-padding py-3 rounded-full transition-all duration-200 active:scale-95 font-label-md text-label-md ${
                isActive
                  ? "bg-surface-container-high text-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50"
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="px-container-padding mt-auto">
        <button className="flex items-center gap-unit px-container-padding py-3 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-variant/50 transition-all duration-200 w-full font-label-md text-label-md">
          <RefreshCw size={20} />
          Update
        </button>
      </div>
    </aside>
  );
}
