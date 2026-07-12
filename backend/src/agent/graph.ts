import { StateGraph, START, END } from "@langchain/langgraph";
import { ResearchState } from "./state";
import { identifyCompany } from "./nodes/identifyCompany";
import { marketData } from "./nodes/marketData";
import { webResearchNode } from "./nodes/webResearch";
import { financialAnalysis } from "./nodes/financialAnalysis";
import { sentimentAnalysis } from "./nodes/sentimentAnalysis";
import { riskAssessment } from "./nodes/riskAssessment";
import { decisionSynthesis } from "./nodes/decisionSynthesis";

/**
 * Linear research pipeline:
 *
 *   identifyCompany -> marketData -> webResearch -> financialAnalysis
 *   -> sentimentAnalysis -> riskAssessment -> decisionSynthesis
 *
 * Each node only appends to shared state, so the final decision node sees
 * the full accumulated dossier. A linear graph was chosen over a
 * fully agentic/branching one deliberately - see README "Key decisions".
 * marketData is a pure data-fetch node (no LLM call) and silently no-ops
 * for private/unlisted companies.
 */
const workflow = new StateGraph(ResearchState)
  .addNode("identifyCompany", identifyCompany)
  .addNode("marketData", marketData)
  .addNode("webResearchNode", webResearchNode)
  .addNode("financialAnalysis", financialAnalysis)
  .addNode("sentimentAnalysis", sentimentAnalysis)
  .addNode("riskAssessment", riskAssessment)
  .addNode("decisionSynthesis", decisionSynthesis)
  .addEdge(START, "identifyCompany")
  .addEdge("identifyCompany", "marketData")
  .addEdge("marketData", "webResearchNode")
  .addEdge("webResearchNode", "financialAnalysis")
  .addEdge("financialAnalysis", "sentimentAnalysis")
  .addEdge("sentimentAnalysis", "riskAssessment")
  .addEdge("riskAssessment", "decisionSynthesis")
  .addEdge("decisionSynthesis", END);

export const researchGraph = workflow.compile();
