import { useState, useCallback, useEffect } from "react";
import { ToastProvider } from "./contexts/ToastContext";
import { DeviceProvider } from "./contexts/DeviceContext";
import { useDevice } from "./hooks/useDevice";
import { LayoutProvider } from "./contexts/LayoutContext";
import { MacroProvider } from "./contexts/MacroContext";
import ToastContainer from "./components/shared/Toast";
import LayoutShell from "./components/layout/LayoutShell";
import SerialMonitor from "./components/monitor/SerialMonitor";
import LayoutView from "./components/layout-view/LayoutView";
import MacrosView from "./components/macros-view/MacrosView";
import MacroProgressBar from "./components/shared/MacroProgressBar";
import SystemView from "./components/system-view/SystemView";
import { DEFAULT_LAYERS, DEFAULT_MACROS, DEFAULT_STRINGS } from "./constants/defaults";
import { deviceLayersToUI, macroCodeToSteps } from "./utils/keycode";

function AppContent() {
  const [activeTab, setActiveTab] = useState("layout");
  const { send, isConnected, setDomainHandler } = useDevice();

  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [macros, setMacros] = useState(DEFAULT_MACROS);
  const [strings, setStrings] = useState(DEFAULT_STRINGS);
  const [activeLayer, setActiveLayer] = useState(0);

  const handleSerialMessage = useCallback(
    (msg) => {
      switch (msg.cmd) {
        case "config": {
          const rawLayers = msg.data?.layers;
          const rawEncoder = msg.data?.encoder;
          const rawMacros = msg.data?.macros;
          const rawStrings = msg.data?.strings;
          if (Array.isArray(rawLayers) && rawLayers.length > 0) {
            setLayers((prev) =>
              deviceLayersToUI(rawLayers, rawEncoder, prev, macros, strings),
            );
          }
          if (Array.isArray(rawMacros)) {
            setMacros(macroCodeToSteps(rawMacros));
          }
          if (Array.isArray(rawStrings)) {
            setStrings(rawStrings);
          }
          break;
        }
        case "macros": {
          if (Array.isArray(msg.data)) {
            setMacros(macroCodeToSteps(msg.data));
          }
          if (Array.isArray(msg.strings)) {
            setStrings(msg.strings);
          }
          break;
        }
        default:
          break;
      }
    },
    [macros, strings],
  );

  useEffect(() => {
    setDomainHandler(handleSerialMessage);
  }, [handleSerialMessage, setDomainHandler]);

  const handleAddMacro = useCallback(() => {
    const idx = macros.length;
    setMacros((prev) => [...prev, { name: `Macro ${idx}`, steps: [] }]);
  }, [macros.length]);

  const renderTopContent = () => {
    switch (activeTab) {
      case "layout":
        return (
          <LayoutProvider
            layers={layers}
            setLayers={setLayers}
            activeLayer={activeLayer}
            setActiveLayer={setActiveLayer}
            send={send}
            isConnected={isConnected}
          >
            <LayoutView macros={macros} strings={strings} onAddMacro={handleAddMacro} />
          </LayoutProvider>
        );
      case "macros":
        return (
          <MacroProvider macros={macros} setMacros={setMacros} strings={strings} setStrings={setStrings}>
            <MacroProgressBar />
            <MacrosView />
          </MacroProvider>
        );
      case "system":
        return (
          <SystemView
            layers={layers}
            setLayers={setLayers}
            macros={macros}
            setMacros={setMacros}
            strings={strings}
            setStrings={setStrings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <LayoutShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      topContent={renderTopContent()}
      bottomContent={<SerialMonitor />}
    />
  );
}

export default function App() {
  return (
    <ToastProvider>
      <DeviceProvider>
        <AppContent />
        <ToastContainer />
      </DeviceProvider>
    </ToastProvider>
  );
}
