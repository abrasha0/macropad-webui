import { useCallback } from "react";
import { useDevice } from "../../hooks/useDevice";
import { useAutoScroll } from "../../hooks/useAutoScroll";

const TAG_COLORS: Record<string, string> = {
  SYSTEM: "var(--log-system)",
  DEVICE: "var(--log-device)",
  INPUT: "var(--log-input)",
  CONFIG: "var(--log-system)",
  MACROS: "var(--log-device)",
  LAYER_CHANGE: "var(--warning)",
  STATUS: "var(--log-system)",
  SET_CONFIG: "var(--accent)",
  RUN_MACRO: "var(--action-keystroke)",
  LOG: "#A8D080",
  GET_CONFIG: "var(--text-muted)",
  GET_LAYER: "var(--text-muted)",
  GET_MACROS: "var(--text-muted)",
};

const LEVEL_COLORS: Record<string, string> = {
  error: "var(--danger)",
  warn: "var(--warning)",
  info: "var(--log-system)",
  success: "var(--log-device)",
  raw: "var(--text-secondary)",
};

function LogLine({ log }: { log: { message: string; time: string; level?: string } }) {
  const tagMatch = log.message.match(/^\[(\w+)\]/);
  const tag = tagMatch ? tagMatch[1] : null;
  const tagColor = tag ? (TAG_COLORS[tag] || "var(--text-secondary)") : null;
  const levelColor = !tag ? LEVEL_COLORS[log.level || "raw"] || "var(--text-secondary)" : null;
  const lineColor = tagColor || levelColor || "var(--text-secondary)";
  const rest = tagMatch ? log.message.slice(tagMatch[0].length).trim() : log.message;

  return (
    <div
      style={{
        display: "flex",
        gap: "var(--space-2)",
        fontSize: 9,
        fontFamily: "var(--font-mono)",
        padding: "1px 0",
        opacity: 0,
        animation: "logFadeIn 60ms ease forwards",
      }}
    >
      <span style={{ color: "var(--log-ts)", flexShrink: 0 }}>{log.time}</span>
      {tagMatch && (
        <span style={{ color: tagColor, flexShrink: 0 }}>{tagMatch[0]}</span>
      )}
      <span style={{ color: lineColor }}>{rest}</span>
    </div>
  );
}

export default function SerialMonitor() {
  const { serialLogs, clearLogs, isConnected } = useDevice();
  const { containerRef, isAtBottom, handleScroll, scrollToBottom } = useAutoScroll([serialLogs.length]);

  const copyLogs = useCallback(() => {
    const text = serialLogs
      .map((l) => `${l.time} ${l.message}`)
      .join("\n");
    navigator.clipboard.writeText(text);
  }, [serialLogs]);

  return (
    <div
      style={{
        flex: "45%",
        minHeight: 0,
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-1) var(--space-3)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>⊡</span>
          <span
            style={{
              fontSize: 10,
              color: "var(--text-muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            SERIAL MONITOR
          </span>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: isConnected ? "var(--status-connected)" : "var(--status-disconnected)",
            }}
          />
          <span style={{ fontSize: 9, color: "var(--text-muted)" }}>
            {isConnected ? "COM3: 115200" : "Disconnected"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button
            onClick={copyLogs}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 10,
              color: "var(--text-secondary)",
              padding: "2px 6px",
              borderRadius: "var(--radius-sm)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            Copy
          </button>
          <button
            onClick={clearLogs}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 10,
              color: "var(--text-secondary)",
              padding: "2px 6px",
              borderRadius: "var(--radius-sm)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            Clear
          </button>
        </div>
      </div>

      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          background: "var(--bg-app)",
          padding: "var(--space-1) var(--space-3)",
        }}
      >
        {serialLogs.map((log, i) => (
          <LogLine key={i} log={log} />
        ))}
      </div>

      <style>{`
        @keyframes logFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
