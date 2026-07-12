import { AgentTimeline } from "./AgentTimeline";
import { VerdictCard } from "./VerdictCard";
import { ResearchSection } from "./ResearchSection";
import { StockPriceChart } from "./StockPriceChart";
import { FinancialTrendChart } from "./FinancialTrendChart";
import { SentimentGauge } from "./SentimentGauge";
import { RiskGauge } from "./RiskGauge";
import { ResearchResult } from "../types";

interface Props {
  loading: boolean;
  completedStages: Set<string>;
  activeStage: string | null;
  result: ResearchResult | null;
  error: string | null;
  panelId: string;
}

export function ResearchPanel({ loading, completedStages, activeStage, result, error, panelId }: Props) {
  const handleExport = () => window.print();

  return (
    <div className="research-panel">
      {(loading || completedStages.size > 0) && !result && (
        <AgentTimeline completed={completedStages} active={activeStage} />
      )}

      {error && <div className="error-banner">{error}</div>}

      {result && (
        <div className="results" id={panelId}>
          <VerdictCard companyName={result.companyName} decision={result.decision} stockData={result.stockData} />

          <div className="chart-grid">
            {result.stockData ? (
              <StockPriceChart data={result.stockData} />
            ) : (
              <div className="stock-panel stock-panel-empty">
                <p className="chart-caption">No public market data — likely private or unlisted.</p>
              </div>
            )}
            <FinancialTrendChart data={result.financialChart} />
          </div>

          <div className="gauge-grid">
            <SentimentGauge text={result.newsSentiment} />
            <RiskGauge risks={result.riskFactors} />
          </div>

          <div className="research-detail">
            <div className="research-detail-header">
              <h3>Research dossier</h3>
              <button className="export-btn no-print" onClick={handleExport}>
                Export PDF
              </button>
            </div>
            <ResearchSection index={1} title="Company profile" content={result.companyProfile} />
            <ResearchSection index={2} title="News & competitive positioning" content={result.webResearch} />
            <ResearchSection index={3} title="Financial summary" content={result.financialSummary} />
            <ResearchSection index={4} title="Sentiment" content={result.newsSentiment} />
            <ResearchSection index={5} title="Risk factors" content={result.riskFactors} />
          </div>
        </div>
      )}
    </div>
  );
}
