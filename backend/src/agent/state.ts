import { Annotation } from "@langchain/langgraph";
import { Decision, FinancialChart, ResearchLogEntry, StockSnapshot } from "../types";

const appendReducer = <T,>() => ({
  reducer: (a: T[], b: T[]) => a.concat(b),
  default: () => [] as T[],
});

export const ResearchState = Annotation.Root({
  // Input
  companyName: Annotation<string>(),

  // Produced by identifyCompany
  companyProfile: Annotation<string>({
    reducer: (_a, b) => b,
    default: () => "",
  }),

  // Produced by marketData
  stockData: Annotation<StockSnapshot | null>({
    reducer: (_a, b) => b,
    default: () => null,
  }),

  // Produced by webResearch
  webResearch: Annotation<string[]>(appendReducer<string>()),

  // Produced by financialAnalysis
  financialSummary: Annotation<string>({
    reducer: (_a, b) => b,
    default: () => "",
  }),
  financialChart: Annotation<FinancialChart>({
    reducer: (_a, b) => b,
    default: () => ({ available: false, currency: "", unit: "", series: [], note: "" }),
  }),

  // Produced by sentimentAnalysis
  newsSentiment: Annotation<string>({
    reducer: (_a, b) => b,
    default: () => "",
  }),

  // Produced by riskAssessment
  riskFactors: Annotation<string[]>(appendReducer<string>()),

  // Produced by decisionSynthesis
  decision: Annotation<Decision | undefined>({
    reducer: (_a, b) => b,
    default: () => undefined,
  }),

  // Populated by every node for UI/audit transparency
  logs: Annotation<ResearchLogEntry[]>(appendReducer<ResearchLogEntry>()),
});

export type GraphState = typeof ResearchState.State;

export function log(stage: string, message: string): ResearchLogEntry[] {
  return [{ stage, message, timestamp: new Date().toISOString() }];
}
