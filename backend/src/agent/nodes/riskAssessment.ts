import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../../llm";
import { GraphState, log } from "../state";

export async function riskAssessment(state: GraphState): Promise<Partial<GraphState>> {
  const response = await llm.invoke([
    new SystemMessage(
      "You are a risk analyst reviewing research already gathered about a company. Based ONLY on the " +
        "context provided (do not invent new facts), list 3-5 concrete investment risk factors as short " +
        "bullet points (e.g. market/competitive risk, financial/data-quality risk, regulatory risk, " +
        "execution risk, sentiment risk). Return ONLY the bullet points, one per line, no numbering, no " +
        "preamble."
    ),
    new HumanMessage(
      `Company: ${state.companyName}\n\n` +
        `Company profile:\n${state.companyProfile}\n\n` +
        `Research notes:\n${state.webResearch.join("\n\n")}\n\n` +
        `Financial summary:\n${state.financialSummary}\n\n` +
        `Sentiment:\n${state.newsSentiment}`
    ),
  ]);

  const bullets = String(response.content)
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);

  return {
    riskFactors: bullets,
    logs: log("riskAssessment", `Identified ${bullets.length} key risk factors.`),
  };
}
