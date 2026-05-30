import { useState, useCallback, useRef } from "react";
import { LayoutContext } from "../hooks/useLayout";

export function LayoutProvider({ children, layers, setLayers, activeLayer, setActiveLayer, send, isConnected }) {
  const [activeKey, setActiveKey] = useState(null);
  const [activeEncoderAction, setActiveEncoderAction] = useState(null);
  const [activeKeysMap, setActiveKeysMap] = useState({});
  const [editingLayerName, setEditingLayerName] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [encoderAnim, setEncoderAnim] = useState({ rotation: 0, glow: false });
  const encoderAnimTimeout = useRef(null);

  const fireEncoder = useCallback((dir) => {
    clearTimeout(encoderAnimTimeout.current);
    const rot = dir === "left" ? -18 : dir === "right" ? 18 : 0;
    setEncoderAnim({ rotation: rot, glow: true });
    encoderAnimTimeout.current = setTimeout(() => {
      setEncoderAnim({ rotation: 0, glow: false });
    }, 400);
  }, []);

  const fireKey = useCallback((rIdx, cIdx) => {
    const keyId = `${rIdx}-${cIdx}`;
    setActiveKeysMap((prev) => ({ ...prev, [keyId]: true }));
    setTimeout(() => {
      setActiveKeysMap((prev) => {
        const next = { ...prev };
        delete next[keyId];
        return next;
      });
    }, 200);
  }, []);

  const updateKey = useCallback(
    (row, col, value) => {
      setLayers((prev) =>
        prev.map((l, li) =>
          li === activeLayer
            ? {
                ...l,
                keys: l.keys.map((r, ri) =>
                  ri === row ? r.map((k, ci) => (ci === col ? value : k)) : r,
                ),
              }
            : l,
        ),
      );
      setActiveKey(null);
    },
    [activeLayer, setLayers],
  );

  const updateEncoder = useCallback(
    (type, value) => {
      setLayers((prev) =>
        prev.map((l, li) =>
          li === activeLayer
            ? { ...l, encoder: { ...l.encoder, [type]: value } }
            : l,
        ),
      );
      setActiveEncoderAction(null);
    },
    [activeLayer, setLayers],
  );

  const handleLayerChange = useCallback(
    (i) => {
      setActiveLayer(i);
      if (isConnected) {
        send({ cmd: "set_layer", layer: i });
      }
    },
    [isConnected, send, setActiveLayer],
  );

  const startRename = useCallback((i, currentName) => {
    setEditingLayerName(i);
    setRenameValue(currentName);
  }, []);

  const commitRename = useCallback(
    (i) => {
      if (renameValue.trim()) {
        setLayers((prev) =>
          prev.map((l, li) =>
            li === i ? { ...l, name: renameValue.trim() } : l,
          ),
        );
      }
      setEditingLayerName(null);
    },
    [renameValue, setLayers],
  );

  const handleKeyState = useCallback(
    (msg) => {
      if (msg.row >= 4) {
        const dir = msg.col === 0 ? "left" : msg.col === 1 ? "right" : "button";
        fireEncoder(dir);
        return;
      }
      const keyId = `${msg.row}-${msg.col}`;
      setActiveKeysMap((prev) => {
        const next = { ...prev };
        if (msg.isPressed) next[keyId] = true;
        else delete next[keyId];
        return next;
      });
    },
    [fireEncoder],
  );

  return (
    <LayoutContext.Provider
      value={{
        layers,
        activeLayer,
        activeKey,
        activeEncoderAction,
        activeKeysMap,
        editingLayerName,
        renameValue,
        encoderAnim,
        setActiveKey,
        setActiveEncoderAction,
        setEditingLayerName,
        setRenameValue,
        updateKey,
        updateEncoder,
        handleLayerChange,
        startRename,
        commitRename,
        fireEncoder,
        fireKey,
        handleKeyState,
        encoderAnimTimeout,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}
