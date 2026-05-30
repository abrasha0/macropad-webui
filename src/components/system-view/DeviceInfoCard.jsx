import { Cpu } from "lucide-react";
import { useDevice } from "../../hooks/useDevice";

export default function DeviceInfoCard() {
  const { deviceInfo, isConnected } = useDevice();

  const info = [
    { label: "Firmware Version", value: deviceInfo?.version || "\u2014" },
    { label: "Build Date", value: deviceInfo?.buildDate || "\u2014" },
    { label: "Architecture", value: deviceInfo?.architecture || "\u2014" },
  ];

  return (
    <div className="glass-panel rounded-xl p-container-padding flex flex-col gap-6">
      <div className="flex items-center gap-2 text-primary">
        <Cpu size={20} />
        <h3 className="font-headline-md text-headline-md">Device Info</h3>
      </div>
      <div className="space-y-3 flex-1">
        {info.map(({ label, value }) => (
          <div
            key={label}
            className="bg-surface-container-low p-3 rounded-full border border-outline-variant/30 flex justify-between items-center px-5"
          >
            <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
            <span className="font-code-sm text-code-sm text-tertiary">{value}</span>
          </div>
        ))}
      </div>
      {!isConnected && (
        <div className="px-5 py-2 bg-surface-variant rounded-full font-label-md text-label-md text-outline text-center">
          Connect device to see info
        </div>
      )}
    </div>
  );
}
