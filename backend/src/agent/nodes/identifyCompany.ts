import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../../llm";
import { formatHits, webSearch } from "../tools/webSearch";
import { GraphState, log } from "../state";

export async function identifyCompany(state: GraphState): Promise<Partial<GraphState>> {
  const hits = await webSearch(`${state.companyName} company overview business sector`);
  const context = formatHits(hits);

  const response = await llm.invoke([
    new SystemMessage(
      "You are a financial research assistant. Given raw web search snippets about a " +
        "company, write a concise 3-5 sentence profile: what the company does, its sector/industry, " +
        "whether it is publicly listed (and its ticker/exchange if you can tell), and its rough scale " +
        "(revenue/employees/market presence) if mentioned. If the company appears to be private, unlisted, " +
        "or you cannot find reliable information, say so plainly instead of guessing."
    ),
    new HumanMessage(
      `Company name: ${state.companyName}\n\nSearch results:\n${context}`
    ),
  ]);

  return {
    companyProfile: String(response.content),
    logs: log("identifyCompany", `Built company profile for "${state.companyName}".`),
  };
}
