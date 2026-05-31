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
  const [activeKeysMap, setActiveKeysMap] = useState({});

  const domainHandler = useRef(null);
  const setDomainHandler = useCallback((fn) => { domainHandler.current = fn; }, []);

  const addLog = useCallback((message, level = "info") => {
    const now = new Date();
    const ms = String(now.getMilliseconds()).padStart(3, "0");
    const time = now.toTimeString().slice(0, 8) + "." + ms;
    setSerialLogs((prev) => [...prev.slice(-500), { message, level, time }]);
  }, []);

  const clearLogs = useCallback(() => setSerialLogs([]), []);

  const pressKey = useCallback((rIdx, cIdx) => {
    const id = `${rIdx}-${cIdx}`;
    setActiveKeysMap((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setActiveKeysMap((prev) => { const n = { ...prev }; delete n[id]; return n; }), 250);
  }, []);

  const fireEncoder = useCallback((dir) => {
    const id = `enc-${dir}`;
    setActiveKeysMap((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setActiveKeysMap((prev) => { const n = { ...prev }; delete n[id]; return n; }), 300);
  }, []);

  const handleKeyState = useCallback((msg) => {
    if (msg.row >= 4) {
      const dir = msg.col === 0 ? "left" : msg.col === 1 ? "right" : "button";
      fireEncoder(dir);
    } else {
      const id = `${msg.row}-${msg.col}`;
      setActiveKeysMap((prev) => {
        const n = { ...prev };
        if (msg.isPressed) n[id] = true;
        else delete n[id];
        return n;
      });
    }
  }, [fireEncoder]);

  const handleSerialMessage = useCallback((msg) => {
    if (msg.cmd && msg.cmd !== "key_state") {
      addLog(`[${msg.cmd.toUpperCase()}] ${JSON.stringify(msg.data || msg)}`, "raw");
    } else if (msg.cmd !== "key_state") {
      addLog(JSON.stringify(msg), "raw");
    }

    switch (msg.cmd) {
      case "config": {
        setConfigLoaded(true);
        if (Array.isArray(msg.data?.layers) && msg.data.layers.length > 0) {
          setDeviceInfo((prev) => ({
            ...prev,
            version: msg.data?._version ? `v${msg.data._version}` : prev?.version,
          }));
          addToast("Configuration loaded from device", "success");
          addLog("Configuration loaded successfully", "info");
        } else {
          addLog("Empty configuration — using defaults", "warn");
        }
        break;
      }
      case "key_state": {
        handleKeyState(msg);
        break;
      }
      case "layer_change": {
        setDeviceLayer(msg.layer);
        addLog(`Device switched to layer ${msg.layer}`, "info");
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
        if (msg.level === "error" || msg.level === "warn")
          addToast(`[Device] ${msg.msg}`, msg.level);
        break;
      }
      default:
        break;
    }

    domainHandler.current?.(msg);
  }, [addLog, addToast, handleKeyState]);

  const handleError = useCallback((err) => {
    const msg = typeof err === "string" ? err : err.message || "Unknown error";
    addToast(msg, "error");
    addLog(msg, "error");
  }, [addToast, addLog]);

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
    if (!isConnected) { connectedOnce.current = false; return; }
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
        activeKeysMap,
        pressKey,
        fireEncoder,
        handleKeyState,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}
