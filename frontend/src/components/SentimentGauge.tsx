import { parseSentimentLabel } from "../types";

interface Props {
  text: string;
}

const SCALE = ["NEGATIVE", "MIXED", "UNCLEAR", "NEUTRAL", "POSITIVE"] as const;
const COLORS: Record<string, string> = {
  NEGATIVE: "#B3462C",
  MIXED: "#C9A227",
  UNCLEAR: "#5B6B73",
  NEUTRAL: "#3E7C8C",
  POSITIVE: "#7A9E3C",
};

export function SentimentGauge({ text }: Props) {
  const label = parseSentimentLabel(text);
  const activeIndex = SCALE.indexOf(label);
  const body = text.replace(/^(POSITIVE|NEUTRAL|MIXED|NEGATIVE|UNCLEAR)\.?\s*/i, "");

  return (
    <div className="gauge-panel">
      <div className="gauge-header">
        <span>Sentiment</span>
        <span className="gauge-label" style={{ color: COLORS[label] }}>
          {label}
        </span>
      </div>
      <div className="gauge-track">
        {SCALE.map((point, i) => (
          <div
            key={point}
            className="gauge-segment"
            style={{
              background: i <= activeIndex ? COLORS[label] : "rgba(236,232,223,0.1)",
            }}
          />
        ))}
      </div>
      <p className="gauge-body">{body}</p>
    </div>
  );
}
