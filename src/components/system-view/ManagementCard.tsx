import { useDevice } from "../../hooks/useDevice";
import { useToast } from "../../hooks/useToast";
import { DEFAULT_LAYERS, DEFAULT_MACROS, DEFAULT_STRINGS } from "../../constants/defaults";
import { uiLayersToDevice, stepsToDeviceCode, macroCodeToSteps, deviceLayersToUI } from "../../utils/keycode";

export default function ManagementCard({
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
  const { send, isConnected } = useDevice();
  const { addToast } = useToast();

  const handleSave = async () => {
    if (!isConnected) return;
    const { layers: dl, encoder: de } = uiLayersToDevice(layers);
    const ok = await send({
      cmd: "set_config",
      data: {
        layers: dl,
        encoder: de,
        macros: stepsToDeviceCode(macros),
        strings,
      },
    });
    if (!ok) addToast("Failed to save configuration", "error");
    else addToast("Configuration saved to device", "success");
  };

  const handleExport = () => {
    const { layers: dl, encoder: de } = uiLayersToDevice(layers);
    const config = {
      layers: dl,
      encoder: de,
      macros: stepsToDeviceCode(macros),
      strings,
      _layerNames: layers.map((l: any) => l.name),
      _version: 2,
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "macropad-config.json";
    a.click();
    URL.revokeObjectURL(url);
    addToast("Configuration exported", "success");
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev: any) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data.layers || !Array.isArray(data.layers)) {
            addToast("Invalid configuration file", "error");
            return;
          }
          const names =
            data._layerNames ||
            DEFAULT_LAYERS.map((l: any) => l.name);
          const newLayers = deviceLayersToUI(
            data.layers,
            data.encoder,
            layers,
            data.macros || [],
            data.strings || []
          );
          newLayers.forEach((l: any, i: number) => {
            l.name = names[i] || `Layer ${i}`;
          });
          setLayers(newLayers);
          if (Array.isArray(data.macros))
            setMacros(macroCodeToSteps(data.macros));
          if (Array.isArray(data.strings)) setStrings(data.strings);
          addToast("Configuration imported", "success");
        } catch (err: any) {
          addToast(`Error parsing file: ${err.message}`, "error");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    setLayers(DEFAULT_LAYERS);
    setMacros(DEFAULT_MACROS);
    setStrings(DEFAULT_STRINGS);
    addToast("Reset to defaults", "info");
  };

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-5)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          paddingBottom: "var(--space-3)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span style={{ fontSize: 16, color: "var(--text-primary)" }}>⏱</span>
        <span
          style={{
            fontSize: "var(--text-md)",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Management
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        <button
          disabled
          style={{
            width: "100%",
            padding: "var(--space-3)",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "var(--accent)",
            color: "#000",
            fontWeight: 600,
            cursor: "not-allowed",
            fontSize: "var(--text-sm)",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-2)",
            opacity: 0.6,
          }}
        >
          ⚡ Flash Firmware
        </button>

        <div
          style={{
            display: "flex",
            gap: "var(--space-2)",
          }}
        >
          <button
            onClick={handleExport}
            style={{
              flex: 1,
              padding: "var(--space-3)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--bg-surface-2)",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: "var(--text-sm)",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-1)",
            }}
          >
            ↑ Export
          </button>
          <button
            onClick={handleImport}
            style={{
              flex: 1,
              padding: "var(--space-3)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--bg-surface-2)",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: "var(--text-sm)",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-1)",
            }}
          >
            ↓ Import
          </button>
        </div>

        <button
          onClick={handleReset}
          style={{
            width: "100%",
            padding: "var(--space-3)",
            borderRadius: "var(--radius-md)",
            border: "1px solid rgba(248,113,113,0.4)",
            background: "var(--danger-bg)",
            color: "var(--danger)",
            cursor: "pointer",
            fontSize: "var(--text-sm)",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-2)",
            transition: "background 0.12s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(248,113,113,0.2)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "var(--danger-bg)")
          }
        >
          ⚠ Reset to Defaults
        </button>
      </div>
    </div>
  );
}
