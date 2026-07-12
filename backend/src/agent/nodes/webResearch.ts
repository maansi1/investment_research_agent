import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../../llm";
import { formatHits, webSearch } from "../tools/webSearch";
import { GraphState, log } from "../state";

export async function webResearchNode(state: GraphState): Promise<Partial<GraphState>> {
  const [news, competitive] = await Promise.all([
    webSearch(`${state.companyName} latest news 2026`),
    webSearch(`${state.companyName} competitors market position growth strategy`),
  ]);

  const context = `Recent news:\n${formatHits(news)}\n\nCompetitive landscape:\n${formatHits(
    competitive
  )}`;

  const response = await llm.invoke([
    new SystemMessage(
      "You are a financial research assistant. Summarize the following raw search results into " +
        "two short sections: (1) 'Recent developments' - notable recent news, product launches, " +
        "leadership changes, or events; (2) 'Competitive position' - who it competes with and how it " +
        "is positioned. Be factual and concise (max ~150 words total). Do not invent facts not present " +
        "in the search results."
    ),
    new HumanMessage(`Company: ${state.companyName}\n\n${context}`),
  ]);

  return {
    webResearch: [String(response.content)],
    logs: log("webResearch", "Gathered recent news and competitive positioning."),
  };
}
