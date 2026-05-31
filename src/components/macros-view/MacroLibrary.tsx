import { useMacro } from "../../hooks/useMacro";
import { useDevice } from "../../hooks/useDevice";

export default function MacroLibrary() {
  const { macros, selectedMacro, setSelectedMacro, handleAddMacro, handleRemoveMacro, handleRunMacro } = useMacro();
  const { isConnected } = useDevice();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
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
        <span
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Library
        </span>
        <button
          onClick={handleAddMacro}
          style={{
            width: 28,
            height: 28,
            borderRadius: "var(--radius-sm)",
            background: "var(--accent)",
            color: "#000",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          +
        </button>
      </div>

      <div
        style={{
          background: "var(--bg-input)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          padding: "var(--space-2) var(--space-3)",
          gap: "var(--space-2)",
        }}
      >
        <span style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>🔍</span>
        <input
          placeholder="Search macros..."
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text-primary)",
            fontSize: "var(--text-sm)",
            fontFamily: "inherit",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
          flex: 1,
          overflowY: "auto",
        }}
      >
        {macros.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "var(--space-6)",
              color: "var(--text-muted)",
              fontSize: "var(--text-sm)",
            }}
          >
            No macros defined
          </div>
        ) : (
          macros.map((m: any, i: number) => {
            const active = selectedMacro === i;
            const steps = m.steps?.length || 0;
            const totalDelay = m.steps?.reduce((acc: number, s: any) => acc + (s.delay || 0), 0) || 0;
            const totalS = (totalDelay / 1000).toFixed(1);

            return (
              <div
                key={i}
                onClick={() => setSelectedMacro(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "var(--space-3)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  transition: "all 0.12s ease",
                  ...(active
                    ? {
                        background: "rgba(200,255,0,0.08)",
                        border: "1px solid rgba(200,255,0,0.3)",
                      }
                    : {
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border)",
                      }),
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.borderColor = "var(--border-subtle)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 500,
                      color: active ? "var(--text-accent)" : "var(--text-primary)",
                    }}
                  >
                    {m.name || `Macro ${i}`}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {steps} step{steps !== 1 ? "s" : ""} &bull; {totalS}s
                  </div>
                </div>
                <div
                  style={{ display: "flex", gap: 4, opacity: active ? 1 : 0 }}
                  className="macro-actions"
                  onMouseEnter={(e) => {
                    const parent = e.currentTarget.closest("[style]");
                    if (parent) (parent as HTMLElement).style.opacity = "1";
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRunMacro(i);
                    }}
                    disabled={!isConnected}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: isConnected ? "pointer" : "not-allowed",
                      color: "var(--text-muted)",
                      padding: 2,
                      fontSize: 12,
                      opacity: 0.6,
                    }}
                    title="Run macro"
                  >
                    ▶
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveMacro(i);
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      padding: 2,
                      fontSize: 12,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                    title="Delete macro"
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
