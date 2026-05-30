import { getKeyDisplayString } from "../../utils/keycode";

export default function EncoderWheel({ encoder, onEdit, onAnim, animRotation, animGlow, macros, strings }) {
  const handleClick = (type) => {
    if (onAnim) onAnim(type);
    setTimeout(() => onEdit(type), 180);
  };

  const leftLabel = getKeyDisplayString(encoder?.left, macros, strings);
  const rightLabel = getKeyDisplayString(encoder?.right, macros, strings);
  const pressLabel = getKeyDisplayString(encoder?.button, macros, strings);

  const cx = 100, cy = 120, outerR = 55, innerR = 24;

  return (
    <svg viewBox="0 0 200 230" className="w-full max-w-[180px] mx-auto select-none">
      <text x={cx} y="26" textAnchor="middle" className="text-xs font-medium transition-all duration-200 fill-on-surface-variant">
        {leftLabel !== "\u2014" ? `← ${leftLabel}` : ""}
      </text>
      <text x={cx} y="224" textAnchor="middle" className="text-xs font-medium transition-all duration-200 fill-on-surface-variant">
        {rightLabel !== "\u2014" ? `→ ${rightLabel}` : ""}
      </text>

      <g onClick={() => handleClick("left")} className="cursor-pointer">
        <rect x="0" y={cy - 60} width="50" height="120" fill="transparent" />
        <circle cx="22" cy={cy} r="24" fill={animGlow ? "rgba(124,77,255,0.15)" : "transparent"} className="transition-all duration-200" />
        <polygon points={`32,${cy - 20} 32,${cy + 20} 10,${cy}`} fill={animGlow ? "var(--color-primary)" : "none"} stroke={animGlow ? "var(--color-primary)" : "var(--color-outline-variant)"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-200" />
      </g>

      <g onClick={() => handleClick("right")} className="cursor-pointer">
        <rect x="150" y={cy - 60} width="50" height="120" fill="transparent" />
        <circle cx="178" cy={cy} r="24" fill={animGlow ? "rgba(124,77,255,0.15)" : "transparent"} className="transition-all duration-200" />
        <polygon points={`168,${cy - 20} 168,${cy + 20} 190,${cy}`} fill={animGlow ? "var(--color-primary)" : "none"} stroke={animGlow ? "var(--color-primary)" : "var(--color-outline-variant)"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-200" />
      </g>

      <g style={{ transform: `rotate(${animRotation}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: "transform 0.15s ease-out" }}>
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={animGlow ? "var(--color-primary)" : "var(--color-surface-variant)"} strokeWidth="10" strokeDasharray="6 8" className="transition-all duration-200" />
        <circle cx={cx} cy={cy} r={outerR - 6} fill={animGlow ? "rgba(124,77,255,0.12)" : "var(--color-surface-container-low)"} stroke={animGlow ? "rgba(124,77,255,0.3)" : "transparent"} strokeWidth="1" className="transition-all duration-200" />
        <circle cx={cx} cy={cy} r={outerR - 10} fill="none" stroke={animGlow ? "var(--color-primary)" : "var(--color-surface-container-highest)"} strokeWidth="1.5" className="transition-all duration-200" />
        <line x1={cx} y1={cy - outerR + 14} x2={cx} y2={cy - outerR + 28} stroke={animGlow ? "var(--color-primary)" : "var(--color-outline)"} strokeWidth="3" strokeLinecap="round" className="transition-all duration-200" />
      </g>

      <g onClick={() => handleClick("button")} className="cursor-pointer">
        <circle cx={cx} cy={cy} r={innerR + 10} fill="transparent" />
        {animGlow && <circle cx={cx} cy={cy} r={innerR + 6} fill="none" stroke="rgba(124,77,255,0.5)" strokeWidth="3" className="transition-all duration-200" />}
        <circle cx={cx} cy={cy} r={innerR} fill={animGlow ? "var(--color-primary-container)" : "var(--color-surface-container-high)"} stroke={animGlow ? "var(--color-primary)" : "var(--color-outline-variant)"} strokeWidth="2" className="transition-all duration-200" />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" className={`text-[10px] font-semibold transition-all duration-200 ${animGlow ? "fill-on-primary-container" : "fill-on-surface-variant"}`}>
          {pressLabel !== "\u2014" ? pressLabel : "⏺"}
        </text>
      </g>
    </svg>
  );
}
