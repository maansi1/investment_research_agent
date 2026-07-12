import { z } from "zod";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../../llm";
import { GraphState, log } from "../state";
import { Decision } from "../../types";

const DecisionSchema = z.object({
  verdict: z.enum(["INVEST", "PASS"]).describe("Final investment recommendation."),
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe("Confidence in this verdict, 0-100."),
  reasoning: z
    .string()
    .describe("A 3-6 sentence explanation of the verdict, weighing the evidence gathered."),
  keyPositives: z
    .array(z.string())
    .describe("2-4 short bullet points that support investing."),
  keyRisks: z
    .array(z.string())
    .describe("2-4 short bullet points that argue against investing, or that temper confidence."),
});

export async function decisionSynthesis(state: GraphState): Promise<Partial<GraphState>> {
  const structuredLlm = llm.withStructuredOutput<Decision>(DecisionSchema, {
    name: "investment_decision",
  });

  const decision = await structuredLlm.invoke([
    new SystemMessage(
      "You are a senior investment analyst making a final INVEST or PASS call on a company, based " +
        "strictly on the research dossier provided below. Weigh business fundamentals, financial signals, " +
        "market sentiment, and risk factors together. Be decisive - avoid hedging into a vague middle " +
        "ground; pick INVEST or PASS and justify it. If the underlying data was too thin or unreliable to " +
        "responsibly analyze, that itself is a reason to lean PASS with lower confidence, and you should " +
        "say so explicitly in the reasoning."
    ),
    new HumanMessage(
      `Company: ${state.companyName}\n\n` +
        `Company profile:\n${state.companyProfile}\n\n` +
        (state.stockData
          ? `Live market data: ${state.stockData.symbol} trading at ${state.stockData.price} ` +
            `(${state.stockData.changePercent >= 0 ? "+" : ""}${state.stockData.changePercent.toFixed(2)}% today), ` +
            `day range ${state.stockData.low}-${state.stockData.high}.\n\n`
          : "Live market data: not available (likely private/unlisted).\n\n") +
        `Research notes:\n${state.webResearch.join("\n\n")}\n\n` +
        `Financial summary:\n${state.financialSummary}\n\n` +
        `Sentiment:\n${state.newsSentiment}\n\n` +
        `Risk factors:\n${state.riskFactors.map((r) => `- ${r}`).join("\n")}`
    ),
  ]);

  return {
    decision,
    logs: log(
      "decisionSynthesis",
      `Final verdict: ${decision.verdict} (confidence ${decision.confidence}%).`
    ),
  };
}
