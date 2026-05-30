import { getKeyDisplayString } from "../../utils/keycode";
import { useLayout } from "../../hooks/useLayout";
import EncoderWheel from "./EncoderWheel";

export default function KeyGridVisualizer({ macros, strings }) {
  const { layers, activeLayer, activeKeysMap, setActiveKey, setActiveEncoderAction, fireEncoder, encoderAnim } = useLayout();
  const currentLayer = layers[activeLayer];

  if (!currentLayer) return null;

  return (
    <div className="flex-[2] bg-surface-container/50 backdrop-blur-lg border border-outline-variant/30 rounded-xl flex items-center justify-center p-6 relative overflow-hidden min-h-0">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="flex gap-10 items-center z-10">
        <div className="grid grid-cols-4 gap-unit bg-surface-container-lowest p-unit rounded-lg border border-outline-variant/50 shadow-inner">
          {currentLayer.keys.map((row, rIdx) =>
            row.map((key, cIdx) => {
              const pressed = !!activeKeysMap[`${rIdx}-${cIdx}`];
              return (
                <button
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => setActiveKey({ rIdx, cIdx })}
                  className={`keycap w-14 h-14 bg-surface-variant border-b-4 border-surface-container-highest rounded-[16px] flex items-center justify-center font-code-sm text-code-sm text-on-surface-variant hover:bg-surface-container-high relative ${
                    pressed ? "keycap-active" : ""
                  }`}
                >
                  <span className="truncate max-w-[90%] text-[10px] leading-tight">
                    {getKeyDisplayString(key, macros, strings)}
                  </span>
                </button>
              );
            }),
          )}
        </div>

        <EncoderWheel
          encoder={currentLayer.encoder}
          onEdit={(type) => setActiveEncoderAction({ type, action: currentLayer.encoder?.[type] || "" })}
          onAnim={(dir) => fireEncoder(dir)}
          animRotation={encoderAnim.rotation}
          animGlow={encoderAnim.glow}
          macros={macros}
          strings={strings}
        />
      </div>
    </div>
  );
}
