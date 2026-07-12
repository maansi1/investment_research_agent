export type Verdict = "INVEST" | "PASS";

export interface Decision {
  verdict: Verdict;
  confidence: number; // 0-100
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
  period: string; // e.g. "FY2023"
  revenue: number;
}

export interface FinancialChart {
  available: boolean;
  currency: string;
  unit: string; // e.g. "millions"
  series: FinancialChartPoint[];
  note: string; // explains why unavailable, or the source basis
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

