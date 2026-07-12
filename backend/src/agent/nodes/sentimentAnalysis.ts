import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../../llm";
import { formatHits, webSearch } from "../tools/webSearch";
import { GraphState, log } from "../state";

export async function sentimentAnalysis(state: GraphState): Promise<Partial<GraphState>> {
  const hits = await webSearch(
    `${state.companyName} controversy lawsuit regulatory issue criticism OR praise`
  );
  const context = formatHits(hits);

  const response = await llm.invoke([
    new SystemMessage(
      "You are a media/sentiment analyst. Based on the search results, classify the overall public " +
        "and press sentiment toward this company as POSITIVE, NEUTRAL, MIXED, or NEGATIVE, then give a " +
        "1-2 sentence justification citing the specific themes (e.g. product reception, leadership " +
        "controversy, litigation, regulatory scrutiny, customer sentiment). If there isn't enough signal, " +
        "say sentiment is UNCLEAR and why. Keep the whole answer under 100 words. Start your answer with " +
        "the single-word label on its own, e.g. 'MIXED.'"
    ),
    new HumanMessage(`Company: ${state.companyName}\n\nSearch results:\n${context}`),
  ]);

  return {
    newsSentiment: String(response.content),
    logs: log("sentimentAnalysis", "Assessed public/press sentiment."),
  };
}
