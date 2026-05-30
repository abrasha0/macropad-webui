import { Settings2 } from "lucide-react";

function TodoSetting({ label, description }) {
  return (
    <div className="flex items-center justify-between px-2 py-3 bg-surface-container-lowest/50 rounded-xl border border-dashed border-outline-variant/30">
      <div>
        <p className="font-label-md text-label-md text-on-surface">{label}</p>
        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">{description}</p>
      </div>
      <span className="px-3 py-1 bg-surface-variant rounded-full font-label-md text-[10px] text-outline">TODO</span>
    </div>
  );
}

export default function GlobalSettingsCard() {
  return (
    <div className="glass-panel rounded-xl p-container-padding flex flex-col gap-6">
      <div className="flex items-center gap-2 text-secondary">
        <Settings2 size={20} />
        <h3 className="font-headline-md text-headline-md">Global Settings</h3>
      </div>
      <div className="space-y-4 flex-1">
        <TodoSetting
          label="Bluetooth Device Name"
          description="Set the BLE advertising name"
        />
        <TodoSetting
          label="WebUI Theme"
          description="Select color scheme"
        />
      </div>
    </div>
  );
}
