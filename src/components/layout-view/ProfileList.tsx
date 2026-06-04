import { useCallback } from "react";
import { useLayout } from "../../hooks/useLayout";
import { useDevice } from "../../hooks/useDevice";
import SectionLabel from "../ui/SectionLabel";
import { uiLayersToDevice } from "../../utils/binding";

export default function ProfileList({
  macros,
}: {
  macros: any[];
}) {
  const {
    layers,
    activeLayer,
    editingLayerName,
    renameValue,
    handleLayerChange,
    startRename,
    commitRename,
    setRenameValue,
    setEditingLayerName,
  } = useLayout();
  const { deviceLayer, isConnected, send, addLog } = useDevice();

  const handleAddProfile = () => {
    /* TODO: implement adding profiles */
  };

  const handleSaveAll = useCallback(async () => {
    const { layers: dl, encoder: de } = uiLayersToDevice(layers);
    addLog("Saving configuration to device...", "info");
    const ok = await send({ cmd: "set_config", data: { layers: dl, encoder: de, macros } });
    if (!ok) addLog("Failed to save configuration", "error");
    else addLog("Configuration saved", "success");
  }, [layers, macros, send, addLog]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <SectionLabel>PROFILES</SectionLabel>
        <button
          onClick={handleAddProfile}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            background: "transparent",
            cursor: "pointer",
            color: "var(--text-muted)",
            fontSize: "var(--text-sm)",
            fontFamily: "inherit",
            lineHeight: 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-accent)";
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          +
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
        }}
      >
        {layers.map((layer: any, i: number) => {
          const isEditing = activeLayer === i;
          const isDeviceActive = deviceLayer === i;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "stretch",
                gap: 2,
              }}
            >
              <button
                onClick={() => handleLayerChange(i)}
                onDoubleClick={() => startRename(i, layer.name)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  padding: "var(--space-2) var(--space-3)",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: isEditing
                    ? "rgba(200,255,0,0.08)"
                    : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  transition: "all 0.12s ease",
                  ...(isEditing
                    ? { borderLeft: "2px solid var(--accent)" }
                    : {}),
                }}
                onMouseEnter={(e) => {
                  if (!isEditing)
                    e.currentTarget.style.background = "var(--bg-surface)";
                }}
                onMouseLeave={(e) => {
                  if (!isEditing)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                  }}
                >
                  {isDeviceActive && (
                    <span
                      style={{
                        fontSize: 8,
                        color: "var(--status-connected)",
                      }}
                    >
                      ●
                    </span>
                  )}
                  {editingLayerName === i ? (
                    <input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => commitRename(i)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename(i);
                        if (e.key === "Escape") setEditingLayerName(null);
                      }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        background: "var(--bg-input)",
                        border: "1px solid var(--accent)",
                        borderRadius: "var(--radius-sm)",
                        padding: "2px 4px",
                        color: "var(--text-primary)",
                        fontSize: "var(--text-sm)",
                        fontFamily: "inherit",
                        outline: "none",
                        width: "100%",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: "var(--text-sm)",
                        fontWeight: 500,
                        color: isEditing
                          ? "var(--text-accent)"
                          : "var(--text-primary)",
                      }}
                    >
                      {layer.name}
                    </span>
                  )}
                </div>
                {isEditing && (
                  <span
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--text-muted)",
                      marginTop: 2,
                    }}
                  >
                    editing
                  </span>
                )}
                {isDeviceActive && !isEditing && (
                  <span
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--text-muted)",
                      marginTop: 2,
                    }}
                  >
                    active on device
                  </span>
                )}
              </button>

              {isConnected && !isDeviceActive && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    send({ cmd: "set_layer", layer: i });
                  }}
                  title="Set active on device"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 16,
                    flexShrink: 0,
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    fontSize: 6,
                    lineHeight: 1,
                    transition: "color 0.12s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-muted)";
                  }}
                >
                  ●
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isConnected && (
        <button
          onClick={handleSaveAll}
          style={{
            width: "100%",
            padding: "var(--space-2) var(--space-3)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            background: "transparent",
            cursor: "pointer",
            color: "var(--text-muted)",
            fontSize: "var(--text-xs)",
            fontFamily: "inherit",
            transition: "all 0.12s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-accent)";
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          Save all to device
        </button>
      )}
    </div>
  );
}
