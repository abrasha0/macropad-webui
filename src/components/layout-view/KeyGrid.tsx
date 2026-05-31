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
  const { layers, activeLayer, activeKey, setActiveKey, activeEncoderAction, setActiveEncoderAction, encoderAnim, fireEncoder } = useLayout();
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
                onClick={() => {
                  setActiveKey({ rIdx, cIdx });
                  setActiveEncoderAction(null);
                }}
                macros={macros}
                strings={strings}
              />
            );
          })
        )}
      </div>

      <div
        onClick={() => {
          setActiveKey(null);
          fireEncoder("right");
          setActiveEncoderAction(
            activeEncoderAction ? null : { type: "encoder" }
          );
        }}
        style={{
          cursor: "pointer",
          opacity: activeEncoderAction ? 1 : undefined,
          filter: activeEncoderAction ? "brightness(1.2)" : undefined,
        }}
      >
        <Encoder
          animRotation={encoderAnim.rotation}
          animActive={encoderAnim.glow}
        />
      </div>
    </div>
  );
}
