import { Settings2, Terminal, HelpCircle } from "lucide-react";

const PAGE_TITLES = {
  layout: "Layout Editor",
  macros: "Macro Editor",
  system: "System Settings",
};

export default function TopBar({ activeTab }) {
  return (
    <header className="h-16 flex items-center justify-between px-margin-desktop w-full bg-background/80 backdrop-blur-md z-40">
      <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
        {PAGE_TITLES[activeTab] || "MacroForge"}
      </h2>
      <div className="flex items-center gap-2">
        {[
          { icon: Settings2, label: "Device config" },
          { icon: Terminal, label: "Terminal" },
          { icon: HelpCircle, label: "Help" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            title={label}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 transition-colors"
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
    </header>
  );
}
