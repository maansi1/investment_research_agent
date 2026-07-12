export type Verdict = "INVEST" | "PASS";

export interface Decision {
  verdict: Verdict;
  confidence: number;
  reasoning: string;
  keyPositives: string[];
  keyRisks: string[];
}

export interface ResearchLogEntry {
  stage: string;
  message: string;
  timestamp: string;
}

export interface CandlePoint {
  date: string;
  close: number;
}

export interface StockSnapshot {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  candles: CandlePoint[];
}

export interface FinancialChartPoint {
  period: string;
  revenue: number | null;
}

export interface FinancialChart {
  available: boolean;
  currency: string | null;
  unit: string | null;
  series: FinancialChartPoint[];
  note: string;
}

export interface ResearchResult {
  companyName: string;
  companyProfile: string;
  webResearch: string[];
  financialSummary: string;
  financialChart: FinancialChart;
  stockData: StockSnapshot | null;
  newsSentiment: string;
  riskFactors: string[];
  decision: Decision;
  logs: ResearchLogEntry[];
}

export const STAGES = [
  { key: "identifyCompany", label: "Identifying company" },
  { key: "marketData", label: "Checking live market data" },
  { key: "webResearchNode", label: "Researching news & positioning" },
  { key: "financialAnalysis", label: "Analyzing financials" },
  { key: "sentimentAnalysis", label: "Assessing sentiment" },
  { key: "riskAssessment", label: "Weighing risk factors" },
  { key: "decisionSynthesis", label: "Reaching a verdict" },
] as const;

/** Parses the leading sentiment label ("POSITIVE" / "MIXED" / etc.) that the
 * backend is prompted to emit at the start of its sentiment text. */
export function parseSentimentLabel(text: string): "POSITIVE" | "NEUTRAL" | "MIXED" | "NEGATIVE" | "UNCLEAR" {
  const match = text.trim().toUpperCase().match(/^(POSITIVE|NEUTRAL|MIXED|NEGATIVE|UNCLEAR)/);
  return (match?.[1] as any) || "UNCLEAR";
}
