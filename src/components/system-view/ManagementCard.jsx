import { Save, Download, Upload, RotateCcw, RefreshCw, Terminal } from "lucide-react";
import { useDevice } from "../../hooks/useDevice";
import { useToast } from "../../hooks/useToast";
import { DEFAULT_LAYERS, DEFAULT_MACROS, DEFAULT_STRINGS } from "../../constants/defaults";
import { uiLayersToDevice, stepsToDeviceCode, macroCodeToSteps, deviceLayersToUI } from "../../utils/keycode";

export default function ManagementCard({ layers, setLayers, macros, setMacros, strings, setStrings }) {
  const { send, isConnected } = useDevice();
  const { addToast } = useToast();

  const handleSave = async () => {
    if (!isConnected) return;
    const { layers: deviceLayers, encoder: deviceEncoder } = uiLayersToDevice(layers);
    const ok = await send({
      cmd: "set_config",
      data: {
        layers: deviceLayers,
        encoder: deviceEncoder,
        macros: stepsToDeviceCode(macros),
        strings: strings,
      },
    });
    if (!ok) addToast("Failed to save configuration", "error");
    else addToast("Configuration saved to device", "success");
  };

  const handleExport = () => {
    const { layers: deviceLayers, encoder: deviceEncoder } = uiLayersToDevice(layers);
    const config = {
      layers: deviceLayers,
      encoder: deviceEncoder,
      macros: stepsToDeviceCode(macros),
      strings: strings,
      _layerNames: layers.map((l) => l.name),
      _version: 2,
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
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
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data.layers || !Array.isArray(data.layers)) {
            addToast("Invalid configuration file", "error");
            return;
          }
          const names = data._layerNames || DEFAULT_LAYERS.map((l) => l.name);
          const newLayers = deviceLayersToUI(data.layers, data.encoder, layers, data.macros || [], data.strings || []);
          newLayers.forEach((l, i) => { l.name = names[i] || `Layer ${i}`; });
          setLayers(newLayers);
          if (Array.isArray(data.macros)) setMacros(macroCodeToSteps(data.macros));
          if (Array.isArray(data.strings)) setStrings(data.strings);
          addToast("Configuration imported", "success");
        } catch (err) {
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
    <div className="glass-panel rounded-xl p-container-padding flex flex-col gap-6">
      <div className="flex items-center gap-2 text-error">
        <Terminal size={20} />
        <h3 className="font-headline-md text-headline-md">Management</h3>
      </div>
      <div className="flex-1 flex flex-col gap-3">
        <button
          onClick={handleSave}
          disabled={!isConnected}
          className="w-full py-3.5 bg-surface-container-low border border-primary-container/50 text-primary-container rounded-full font-label-md text-label-md hover:bg-primary-container/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-30"
        >
          <Save size={16} />
          Save to Device
        </button>

        <button
          className="w-full py-3.5 bg-surface-container-low border border-outline-variant/50 text-outline rounded-full font-label-md text-label-md hover:bg-surface-variant transition-colors flex items-center justify-center gap-2 cursor-not-allowed opacity-50"
          title="Coming soon"
        >
          <RefreshCw size={16} />
          Flash Firmware
        </button>

        <div className="border-t border-outline-variant/20 my-1" />

        <button
          onClick={handleExport}
          className="w-full py-3.5 bg-surface-container-low border border-outline-variant/50 text-on-surface-variant rounded-full font-label-md text-label-md hover:bg-surface-variant transition-colors flex items-center justify-center gap-2"
        >
          <Download size={16} />
          Export JSON
        </button>

        <button
          onClick={handleImport}
          className="w-full py-3.5 bg-surface-container-low border border-outline-variant/50 text-on-surface-variant rounded-full font-label-md text-label-md hover:bg-surface-variant transition-colors flex items-center justify-center gap-2"
        >
          <Upload size={16} />
          Import JSON
        </button>

        <div className="border-t border-outline-variant/20 my-1" />

        <button
          onClick={handleReset}
          className="w-full py-3.5 bg-error-container/20 border border-error/50 text-error rounded-full font-label-md text-label-md hover:bg-error-container/40 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} />
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
