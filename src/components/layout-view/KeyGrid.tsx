import { useLayout } from "../../hooks/useLayout";
import { useDevice } from "../../hooks/useDevice";
import KeyCap from "./KeyCap";
import Encoder from "./Encoder";

export default function KeyGrid({
  macros,
  strings,
}: {
  macros: any[];
  strings: string[];
}) {
  const { layers, activeLayer, activeKey, setActiveKey, encoderAnim, fireEncoder } = useLayout();
  const { activeKeysMap } = useDevice();
  const layer = layers[activeLayer];

  if (!layer) return null;

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        padding: "var(--space-5)",
        borderRadius: "var(--radius-lg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-6)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 56px)",
          gap: "var(--space-2)",
        }}
      >
        {layer.keys.map((row: string[], rIdx: number) =>
          row.map((cell: string, cIdx: number) => {
            const pressed = !!activeKeysMap[`${rIdx}-${cIdx}`];
            const selected = activeKey?.rIdx === rIdx && activeKey?.cIdx === cIdx;
            return (
              <KeyCap
                key={`${rIdx}-${cIdx}`}
                label={cell}
                selected={selected}
                pressed={pressed}
                onClick={() => setActiveKey({ rIdx, cIdx })}
                macros={macros}
                strings={strings}
              />
            );
          })
        )}
      </div>

      <div
        onClick={() => {
          fireEncoder("right");
        }}
        style={{ cursor: "pointer" }}
      >
        <Encoder
          animRotation={encoderAnim.rotation}
          animActive={encoderAnim.glow}
        />
      </div>
    </div>
  );
}
