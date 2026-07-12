import { Decision, StockSnapshot } from "../types";
import { ConfidenceRing } from "./ConfidenceRing";

interface Props {
  companyName: string;
  decision: Decision;
  stockData: StockSnapshot | null;
}

export function VerdictCard({ companyName, decision, stockData }: Props) {
  const isInvest = decision.verdict === "INVEST";
  const color = isInvest ? "#C9A227" : "#B3462C";

  return (
    <div className="verdict-card">
      <div className="verdict-ticker-strip">
        <span className="verdict-company">{companyName}</span>
        {stockData && (
          <span className="verdict-ticker">
            {stockData.symbol} · {stockData.price.toFixed(2)}{" "}
            <span className={stockData.change >= 0 ? "up" : "down"}>
              {stockData.change >= 0 ? "▲" : "▼"} {Math.abs(stockData.changePercent).toFixed(2)}%
            </span>
          </span>
        )}
      </div>

      <div className="verdict-body">
        <div className={`verdict-stamp ${isInvest ? "invest" : "pass"}`}>{decision.verdict}</div>

        <div className="verdict-main">
          <p className="reasoning">{decision.reasoning}</p>

          <div className="pros-cons">
            <div>
              <h4>Key positives</h4>
              <ul>
                {decision.keyPositives.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Key risks</h4>
              <ul>
                {decision.keyRisks.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="verdict-confidence">
          <ConfidenceRing confidence={decision.confidence} color={color} />
          <span className="confidence-caption">confidence</span>
        </div>
      </div>
    </div>
  );
}
