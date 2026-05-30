import DeviceInfoCard from "./DeviceInfoCard";
import GlobalSettingsCard from "./GlobalSettingsCard";
import ManagementCard from "./ManagementCard";

export default function SystemView({ layers, setLayers, macros, setMacros, strings, setStrings }) {
  return (
    <div className="flex-1 grid grid-cols-3 gap-gutter min-h-0">
      <DeviceInfoCard />
      <GlobalSettingsCard />
      <ManagementCard
        layers={layers}
        setLayers={setLayers}
        macros={macros}
        setMacros={setMacros}
        strings={strings}
        setStrings={setStrings}
      />
    </div>
  );
}
