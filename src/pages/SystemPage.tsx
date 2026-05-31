import DeviceInfoCard from "../components/system-view/DeviceInfoCard";
import GlobalSettingsCard from "../components/system-view/GlobalSettingsCard";
import ManagementCard from "../components/system-view/ManagementCard";

export default function SystemPage({
  layers,
  setLayers,
  macros,
  setMacros,
  strings,
  setStrings,
}: {
  layers: any[];
  setLayers: (v: any) => void;
  macros: any[];
  setMacros: (v: any) => void;
  strings: string[];
  setStrings: (v: any) => void;
}) {
  return (
    <div>
      <h1
        style={{
          fontSize: "var(--text-2xl)",
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: 4,
        }}
      >
        System Configuration
      </h1>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-5)" }}>
        Manage device settings, firmware, and core parameters.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "var(--space-5)",
        }}
      >
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
    </div>
  );
}
