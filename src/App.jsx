import { useState, useCallback, useEffect } from "react";
import { ToastProvider } from "./contexts/ToastContext";
import { DeviceProvider } from "./contexts/DeviceContext";
import { useDevice } from "./hooks/useDevice";
import { LayoutProvider } from "./contexts/LayoutContext";
import { MacroProvider } from "./contexts/MacroContext";
import ToastContainer from "./components/shared/Toast";
import Sidebar from "./components/layout/Sidebar";
import SerialMonitor from "./components/layout/SerialMonitor";
import LayoutPage from "./pages/LayoutPage";
import MacrosPage from "./pages/MacrosPage";
import SystemPage from "./pages/SystemPage";
import ProgressBar from "./components/shared/ProgressBar";
import {
  DEFAULT_LAYERS,
  DEFAULT_MACROS,
  DEFAULT_STRINGS,
} from "./constants/defaults";
import { deviceLayersToUI, macroCodeToSteps } from "./utils/keycode";

const BASE = 1280;
const SCALE_MOD = 0.9;

function AppContent() {
  const [activeTab, setActiveTab] = useState("layout");
  const { setDomainHandler } = useDevice();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const onResize = () =>
      setScale(Math.max(1, (innerWidth / BASE) * SCALE_MOD));
    onResize();
    addEventListener("resize", onResize);
    return () => removeEventListener("resize", onResize);
  }, []);

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
          if (Array.isArray(rawMacros)) setMacros(macroCodeToSteps(rawMacros));
          if (Array.isArray(rawStrings)) setStrings(rawStrings);
          break;
        }
        case "macros": {
          if (Array.isArray(msg.data)) setMacros(macroCodeToSteps(msg.data));
          if (Array.isArray(msg.strings)) setStrings(msg.strings);
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

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${100 / scale}vw`,
          height: `${100 / scale}vh`,
          display: "flex",
          background: "var(--bg-app)",
        }}
      >
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            minHeight: 0,
          }}
        >
          <main
            style={{
              flex: "55%",
              overflowY: "auto",
              padding: "var(--space-5)",
              minHeight: 0,
            }}
          >
            {activeTab === "layout" && (
              <LayoutProvider
                layers={layers}
                setLayers={setLayers}
                activeLayer={activeLayer}
                setActiveLayer={setActiveLayer}
              >
                <LayoutPage
                  macros={macros}
                  strings={strings}
                  setStrings={setStrings}
                  onAddMacro={handleAddMacro}
                />
              </LayoutProvider>
            )}
            {activeTab === "macros" && (
              <MacroProvider
                macros={macros}
                setMacros={setMacros}
                strings={strings}
                setStrings={setStrings}
              >
                <ProgressBar />
                <MacrosPage />
              </MacroProvider>
            )}
            {activeTab === "system" && (
              <SystemPage
                layers={layers}
                setLayers={setLayers}
                macros={macros}
                setMacros={setMacros}
                strings={strings}
                setStrings={setStrings}
              />
            )}
          </main>
          <SerialMonitor />
        </div>
      </div>
    </div>
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
