import { Terminal, Trash2, Copy, ArrowDown } from "lucide-react";
import { useDevice } from "../../hooks/useDevice";
import { useAutoScroll } from "../../hooks/useAutoScroll";

const LOG_LEVEL_COLORS = {
  error: "text-error",
  warn: "text-secondary",
  info: "text-on-surface",
  raw: "text-outline",
};

const SOURCE_COLORS = {
  SYS: "text-tertiary font-bold",
  EVT: "text-secondary font-bold",
  RX: "text-primary font-bold",
  TX: "text-primary-fixed-dim font-bold",
};

function parseSourceTag(message) {
  const match = message.match(/^\[(\w+)\]/);
  if (match) {
    return { source: match[1], rest: message.slice(match[0].length).trim() };
  }
  return { source: null, rest: message };
}

function LogLine({ log }) {
  const time = log.time;
  const { source, rest } = parseSourceTag(log.message);
  const sourceCls = source ? SOURCE_COLORS[source] || "text-tertiary" : null;
  const msgCls = LOG_LEVEL_COLORS[log.level] || "text-on-surface";

  return (
    <div className="flex gap-3 px-1 rounded hover:bg-surface-variant/10 leading-relaxed">
      <span className="text-outline-variant w-24 shrink-0 font-code-sm text-code-sm select-none">{time}</span>
      {source ? (
        <>
          <span className={`${sourceCls} w-12 shrink-0 font-code-sm text-code-sm`}>[{source}]</span>
          <span className={`${msgCls} font-code-sm text-code-sm`}>{rest}</span>
        </>
      ) : (
        <span className={`${msgCls} font-code-sm text-code-sm`}>{log.message}</span>
      )}
    </div>
  );
}

export default function SerialMonitor() {
  const { serialLogs, clearLogs } = useDevice();
  const { containerRef, isAtBottom, handleScroll, scrollToBottom } = useAutoScroll([serialLogs.length]);

  const handleCopy = () => {
    const text = serialLogs
      .map((l) => `${l.time}  ${l.message}`)
      .join("\n");
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full bg-terminal-black rounded-xl border border-outline-variant/20 flex flex-col overflow-hidden shadow-inner min-h-0">
      <div className="flex items-center justify-between px-4 py-2 border-b border-outline-variant/20 bg-surface-container/30 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-on-surface-variant" />
          <span className="font-label-md text-label-md text-on-surface-variant tracking-wider">SERIAL MONITOR</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={scrollToBottom}
            className={`p-1.5 rounded transition-colors ${
              isAtBottom
                ? "text-outline-variant"
                : "text-primary hover:bg-surface-variant"
            }`}
            title="Scroll to bottom"
          >
            <ArrowDown size={14} />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 text-on-surface-variant hover:text-on-surface rounded hover:bg-surface-variant transition-colors"
            title="Copy logs"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={clearLogs}
            className="p-1.5 text-on-surface-variant hover:text-on-surface rounded hover:bg-surface-variant transition-colors"
            title="Clear logs"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-0.5 min-h-0"
      >
        {serialLogs.length === 0 ? (
          <div className="text-outline-variant font-code-sm text-code-sm italic">
            No messages yet...
          </div>
        ) : (
          serialLogs.map((log, i) => <LogLine key={i} log={log} />)
        )}
      </div>
    </div>
  );
}
