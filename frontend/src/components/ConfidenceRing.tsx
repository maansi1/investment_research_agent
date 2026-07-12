import { useEffect, useState } from "react";

interface Props {
  confidence: number;
  color: string;
}

export function ConfidenceRing({ confidence, color }: Props) {
  const [animated, setAnimated] = useState(0);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimated(confidence));
    return () => cancelAnimationFrame(raf);
  }, [confidence]);

  const offset = circumference - (animated / 100) * circumference;

  return (
    <div className="confidence-ring">
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={radius} fill="none" stroke="rgba(236,232,223,0.12)" strokeWidth="6" />
        <circle
          cx="42"
          cy="42"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 42 42)"
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="confidence-ring-label">
        <span className="confidence-ring-number">{Math.round(animated)}</span>
        <span className="confidence-ring-percent">%</span>
      </div>
    </div>
  );
}
