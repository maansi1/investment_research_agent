interface Props {
  risks: string[];
}

export function RiskGauge({ risks }: Props) {
  const count = risks.length;
  // 1-2 risks = low, 3 = moderate, 4+ = elevated. A heuristic, not a scored model.
  const level = count <= 2 ? "LOW" : count === 3 ? "MODERATE" : "ELEVATED";
  const color = level === "LOW" ? "#7A9E3C" : level === "MODERATE" ? "#C9A227" : "#B3462C";
  const maxDots = 6;

  return (
    <div className="gauge-panel">
      <div className="gauge-header">
        <span>Risk load</span>
        <span className="gauge-label" style={{ color }}>
          {level}
        </span>
      </div>
      <div className="gauge-dots">
        {Array.from({ length: maxDots }).map((_, i) => (
          <span
            key={i}
            className="gauge-dot"
            style={{ background: i < count ? color : "rgba(236,232,223,0.1)" }}
          />
        ))}
      </div>
      <p className="gauge-body">
        {count} factor{count === 1 ? "" : "s"} identified across financial, sentiment, and market signals.
      </p>
    </div>
  );
}
