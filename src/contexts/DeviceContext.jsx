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

  const handleEncoderEvent = useCallback((msg) => {
    // Explicit encoder field (most flexible)
    if (msg.encoder) {
      fireEncoder(msg.encoder);
      return true;
    }
    // Row >= 4 or col >= 4 convention (beyond 4×4 grid)
    if (msg.row >= 4 || msg.col >= 4) {
      const dir = msg.col === 0 || msg.col === 4 ? "left"
        : msg.col === 1 || msg.col === 5 ? "right"
        : "button";
      fireEncoder(dir);
      return true;
    }
    // Index >= 16 (single-index beyond 4×4 grid)
    if (msg.index >= 16 || msg.key >= 16) {
      const idx = msg.index ?? msg.key;
      const dir = idx === 16 ? "left" : idx === 17 ? "right" : "button";
      fireEncoder(dir);
      return true;
    }
    // Encoder step messages with dir field (e.g. "Encoder step: dir=-1, code=0x1002")
    if (msg.msg && msg.msg.startsWith("Encoder step:")) {
      const dir = msg.msg.includes("dir=-1") ? "left"
        : msg.msg.includes("dir=1") ? "right"
        : "button";
      fireEncoder(dir);
      return true;
    }
    // Encoder button messages (e.g. "Encoder btn PRESS (code=0x1003)")
    if (msg.msg && msg.msg.includes("Encoder btn") && msg.msg.includes("PRESS")) {
      fireEncoder("button");
      return true;
    }
    return false;
  }, [fireEncoder]);

  const handleKeyState = useCallback((msg) => {
    // Encoder via explicit encoder field or row/col/index conventions
    if (handleEncoderEvent(msg)) return;
    // Regular key press
    if (msg.row != null && msg.col != null) {
      const id = `${msg.row}-${msg.col}`;
      setActiveKeysMap((prev) => {
        const n = { ...prev };
        if (msg.isPressed) n[id] = true;
        else delete n[id];
        return n;
      });
    }
  }, [handleEncoderEvent]);

  const handleSerialMessage = useCallback((msg) => {
    if (msg.cmd) {
      addLog(`[${msg.cmd.toUpperCase()}] ${JSON.stringify(msg.data || msg)}`, "raw");
    } else {
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
        handleEncoderEvent(msg);
        if (msg.level === "error" || msg.level === "warn")
          addToast(`[Device] ${msg.msg}`, msg.level);
        break;
      }
      case "encoder": {
        handleEncoderEvent(msg);
        break;
      }
      default: {
        handleEncoderEvent(msg);
        break;
      }
    }

    domainHandler.current?.(msg);
  }, [addLog, addToast, handleKeyState, handleEncoderEvent]);

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
