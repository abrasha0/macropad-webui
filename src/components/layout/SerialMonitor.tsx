import { useCallback, useState, useMemo } from "react";
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

const LOG_FONT_SIZE = 8;
const LOG_LEVELS = ["raw", "info", "warn", "error", "success"] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

function LogLine({
  log,
}: {
  log: { message: string; time: string; level?: string };
}) {
  const tagMatch = log.message.match(/^\[(\w+)\]/);
  const tag = tagMatch ? tagMatch[1] : null;
  const tagColor = tag ? TAG_COLORS[tag] || "var(--text-secondary)" : null;
  const levelColor = !tag
    ? LEVEL_COLORS[log.level || "raw"] || "var(--text-secondary)"
    : null;
  const lineColor = tagColor || levelColor || "var(--text-secondary)";
  const rest = tagMatch
    ? log.message.slice(tagMatch[0].length).trim()
    : log.message;

  return (
    <div
      style={{
        display: "flex",
        gap: "var(--space-2)",
        fontSize: LOG_FONT_SIZE,
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
  const {
    containerRef,
    handleScroll,
    scrollToBottom,
    autoScrollEnabled,
    setAutoScrollEnabled,
  } = useAutoScroll([serialLogs.length]);

  const [logTypeFilter, setLogTypeFilter] = useState<
    "all" | "raw" | "formatted"
  >("formatted");
  const [levelFilters, setLevelFilters] = useState<Set<LogLevel>>(
    new Set(LOG_LEVELS)
  );

  const filteredLogs = useMemo(
    () =>
      serialLogs.filter((log) => {
        if (logTypeFilter === "raw" && log.level !== "raw") return false;
        if (logTypeFilter === "formatted" && log.level === "raw") return false;
        if (log.level && !LOG_LEVELS.includes(log.level as LogLevel))
          return true;
        if (!levelFilters.has(log.level as LogLevel)) return false;
        return true;
      }),
    [serialLogs, logTypeFilter, levelFilters]
  );

  const toggleLevel = useCallback((level: LogLevel) => {
    setLevelFilters((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  }, []);

  const copyLogs = useCallback(() => {
    const text = filteredLogs.map((l) => `${l.time} ${l.message}`).join("\n");
    navigator.clipboard.writeText(text);
  }, [filteredLogs]);

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
          gap: "var(--space-1)",
          padding: "var(--space-1) var(--space-3)",
          borderBottom: "1px solid var(--border-subtle)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            flexShrink: 0,
            marginRight: "var(--space-3)",
          }}
        >
          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>⊡</span>
          <span
            style={{
              fontSize: LOG_FONT_SIZE,
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
              background: isConnected
                ? "var(--status-connected)"
                : "var(--status-disconnected)",
            }}
          />
          <span style={{ fontSize: 9, color: "var(--text-muted)" }}>
            {isConnected ? "COM3: 115200" : "Disconnected"}
          </span>
        </div>

        <span style={{ fontSize: 9, color: "var(--border)", flexShrink: 0 }}>|</span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {(["all", "raw", "formatted"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setLogTypeFilter(opt)}
                style={{
                  padding: "2px 4px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 8,
                  fontFamily: "inherit",
                  background:
                    logTypeFilter === opt
                      ? "var(--bg-surface-2)"
                      : "transparent",
                  color:
                    logTypeFilter === opt
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          <span style={{ fontSize: 9, color: "var(--border)", flexShrink: 0 }}>
            |
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-1)",
              flexWrap: "nowrap",
              overflow: "hidden",
            }}
          >
            {LOG_LEVELS.map((level) => {
              const active = levelFilters.has(level);
              return (
                <button
                  key={level}
                  onClick={() => toggleLevel(level)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "2px 3px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 8,
                    fontFamily: "inherit",
                    color: active
                      ? LEVEL_COLORS[level] || "var(--text-primary)"
                      : "var(--text-muted)",
                    opacity: active ? 1 : 0.45,
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 6, lineHeight: 1 }}>●</span>
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-1)",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => {
              if (autoScrollEnabled) {
                setAutoScrollEnabled(false);
              } else {
                setAutoScrollEnabled(true);
                scrollToBottom();
              }
            }}
            title={autoScrollEnabled ? "Autoscroll ON" : "Autoscroll OFF"}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 9,
              fontFamily: "inherit",
              color: autoScrollEnabled
                ? "var(--accent)"
                : "var(--text-muted)",
              padding: "2px 4px",
              borderRadius: "var(--radius-sm)",
            }}
          >
            ▼
          </button>
          <button
            onClick={copyLogs}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: LOG_FONT_SIZE,
              color: "var(--text-secondary)",
              padding: "2px 6px",
              borderRadius: "var(--radius-sm)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-secondary)")
            }
          >
            Copy
          </button>
          <button
            onClick={clearLogs}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: LOG_FONT_SIZE,
              color: "var(--text-secondary)",
              padding: "2px 6px",
              borderRadius: "var(--radius-sm)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-secondary)")
            }
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
        {filteredLogs.map((log, i) => (
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
