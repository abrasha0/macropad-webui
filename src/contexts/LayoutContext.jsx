import { useState, useCallback, useRef } from "react";
import { LayoutContext } from "../hooks/useLayout";

export function LayoutProvider({ children, layers, setLayers, activeLayer, setActiveLayer, send, isConnected }) {
  const [activeKey, setActiveKey] = useState(null);
  const [activeEncoderAction, setActiveEncoderAction] = useState(null);
  const [editingLayerName, setEditingLayerName] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [encoderAnim, setEncoderAnim] = useState({ rotation: 0, glow: false });
  const animTimer = useRef(null);

  const fireEncoder = useCallback((dir) => {
    clearTimeout(animTimer.current);
    setEncoderAnim({ rotation: dir === "left" ? -18 : dir === "right" ? 18 : 0, glow: true });
    animTimer.current = setTimeout(() => setEncoderAnim({ rotation: 0, glow: false }), 400);
  }, []);

  const updateKey = useCallback((row, col, value) => {
    setLayers((prev) =>
      prev.map((l, li) =>
        li === activeLayer
          ? { ...l, keys: l.keys.map((r, ri) => ri === row ? r.map((k, ci) => ci === col ? value : k) : r) }
          : l
      )
    );
    setActiveKey(null);
  }, [activeLayer, setLayers]);

  const updateEncoder = useCallback((type, value) => {
    setLayers((prev) =>
      prev.map((l, li) => li === activeLayer ? { ...l, encoder: { ...l.encoder, [type]: value } } : l)
    );
    setActiveEncoderAction(null);
  }, [activeLayer, setLayers]);

  const handleLayerChange = useCallback((i) => {
    setActiveLayer(i);
    if (isConnected) send({ cmd: "set_layer", layer: i });
  }, [isConnected, send, setActiveLayer]);

  const startRename = useCallback((i, name) => {
    setEditingLayerName(i);
    setRenameValue(name);
  }, []);

  const commitRename = useCallback((i) => {
    if (renameValue.trim())
      setLayers((prev) => prev.map((l, li) => li === i ? { ...l, name: renameValue.trim() } : l));
    setEditingLayerName(null);
  }, [renameValue, setLayers]);

  return (
    <LayoutContext.Provider
      value={{
        layers, activeLayer, activeKey, activeEncoderAction,
        editingLayerName, renameValue, encoderAnim,
        setActiveKey, setActiveEncoderAction,
        setEditingLayerName, setRenameValue,
        updateKey, updateEncoder, handleLayerChange,
        startRename, commitRename, fireEncoder,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}
