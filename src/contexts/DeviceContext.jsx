import { useState, useCallback, useRef, useEffect } from "react";
import { useSerial } from "../hooks/useSerial";
import { useToast } from "../hooks/useToast";
import { DeviceContext } from "../hooks/useDevice";

export function DeviceProvider({ children }) {
  const { connect, send, disconnect, isConnected } = useSerial();
  const { addToast } = useToast();

  const [deviceLayer, setDeviceLayer] = useState(null);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [serialLogs, setSerialLogs] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState(null);

  const domainHandlerRef = useRef(null);
  const setDomainHandler = useCallback((handler) => {
    domainHandlerRef.current = handler;
  }, []);

  const addLog = useCallback((message, level = "info") => {
    const now = new Date();
    const time = now.toTimeString().slice(0, 8) + "." + String(now.getMilliseconds()).padStart(3, "0");
    setSerialLogs((prev) => [...prev.slice(-500), { message, level, time }]);
  }, []);

  const clearLogs = useCallback(() => {
    setSerialLogs([]);
  }, []);

  const handleSerialMessage = useCallback(
    (msg) => {
      addLog(JSON.stringify(msg), "raw");

      switch (msg.cmd) {
        case "config": {
          setConfigLoaded(true);
          if (Array.isArray(msg.data?.layers) && msg.data.layers.length > 0) {
            setDeviceInfo((prev) => ({
              ...prev,
              version: msg.data?._version ? `v${msg.data._version}` : prev?.version,
            }));
            addToast("Configuration loaded from device", "success");
            addLog("Loaded configuration from device", "info");
          } else {
            addToast("Device returned empty config — using defaults", "warn");
            addLog("Empty configuration in response", "warn");
          }
          break;
        }
        case "key_state": {
          // handled by LayoutView — just log
          break;
        }
        case "layer_change": {
          const l = msg.layer;
          setDeviceLayer(l);
          addLog(`Device switched to layer ${l}`, "info");
          break;
        }
        case "status": {
          const ok = msg.status === "success";
          addToast(msg.msg || (ok ? "Operation successful" : "Operation failed"), ok ? "success" : "error");
          addLog(msg.msg || msg.status, ok ? "info" : "error");
          break;
        }
        case "log": {
          addLog(msg.msg, msg.level ?? "info");
          if (msg.level === "error") addToast(`[Device] ${msg.msg}`, "error");
          if (msg.level === "warn") addToast(`[Device] ${msg.msg}`, "warn");
          break;
        }
        case "macros": {
          addLog("Loaded macros from device", "info");
          break;
        }
        case "macro_progress": {
          // handled by MacrosView
          break;
        }
        default:
          break;
      }

      domainHandlerRef.current?.(msg);
    },
    [addLog, addToast],
  );

  const handleError = useCallback(
    (err) => {
      const msg = typeof err === "string" ? err : err.message || "Unknown error";
      addToast(msg, "error");
      addLog(msg, "error");
    },
    [addToast, addLog],
  );

  const handleConnect = useCallback(async () => {
    if (isConnected) {
      await disconnect();
      addToast("Disconnected from device", "info");
      addLog("Disconnected", "info");
      setDeviceLayer(null);
      setConfigLoaded(false);
      return;
    }
    await connect(handleSerialMessage, handleError);
  }, [isConnected, connect, disconnect, handleSerialMessage, handleError, addToast, addLog]);

  const connectedOnce = useRef(false);
  useEffect(() => {
    if (!isConnected) {
      connectedOnce.current = false;
      return;
    }
    if (connectedOnce.current) return;
    connectedOnce.current = true;
    addToast("Connected to device!", "success");
    addLog("Connected. Fetching configuration...", "info");
    const t = setTimeout(async () => {
      await send({ cmd: "get_config" });
      await send({ cmd: "get_layer" });
      await send({ cmd: "get_macros" });
    }, 600);
    return () => clearTimeout(t);
  }, [isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <DeviceContext.Provider
      value={{
        isConnected,
        connect: handleConnect,
        send,
        disconnect,
        deviceLayer,
        configLoaded,
        serialLogs,
        addLog,
        clearLogs,
        setConfigLoaded,
        setDeviceLayer,
        setDomainHandler,
        deviceInfo,
        setDeviceInfo,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}
