import { z } from "zod";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../../llm";
import { formatHits, webSearch } from "../tools/webSearch";
import { GraphState, log } from "../state";
import { FinancialChart } from "../../types";

const FinancialChartSchema = z.object({
  available: z
    .boolean()
    .describe("True only if at least 2 periods of an actual reported revenue figure are present in the search results."),
  currency: z.string().describe("e.g. 'USD', 'INR'. Set to an empty string if not available."),
  unit: z.string().describe("e.g. 'millions', 'crore'. Set to an empty string if not available."),
  series: z
    .array(z.object({ period: z.string(), revenue: z.number().describe("The revenue figure. Use 0 if not available.") }))
    .describe("Chronological list of period label + revenue figure. Empty array if not available."),
  note: z
    .string()
    .describe(
      "One sentence: either the source basis for the numbers, or why no chart could be built (e.g. 'private company, no reported financials found')."
    ),
});

export async function financialAnalysis(state: GraphState): Promise<Partial<GraphState>> {
  const hits = await webSearch(
    `${state.companyName} revenue profit financial results earnings valuation`
  );
  const context = formatHits(hits);

  const [summaryResponse, chartData] = await Promise.all([
    llm.invoke([
      new SystemMessage(
        "You are a financial analyst. From the search results below, extract whatever financial " +
          "signals are available: revenue/profit trends, growth rate, margins, valuation, funding rounds " +
          "(if private/startup), or stock performance (if public). Clearly flag any figure you are unsure " +
          "about as approximate. If the search results contain little to no reliable financial data, say so " +
          "explicitly rather than fabricating numbers - this is important since this analysis feeds an " +
          "investment decision. Keep it under 150 words."
      ),
      new HumanMessage(`Company: ${state.companyName}\n\nSearch results:\n${context}`),
    ]),
    llm
      .withStructuredOutput<FinancialChart>(FinancialChartSchema, { name: "financial_chart" })
      .invoke([
        new SystemMessage(
          "Extract a chartable revenue time series ONLY if the search results explicitly state real " +
            "reported revenue figures for at least two distinct periods (e.g. two fiscal years or quarters). " +
            "Never estimate, interpolate, or invent numbers. If the data isn't explicitly present, set " +
            "available to false and return an empty series - this matters because fabricated numbers in an " +
            "investment tool are actively harmful."
        ),
        new HumanMessage(`Company: ${state.companyName}\n\nSearch results:\n${context}`),
      ]),
  ]);

  return {
    financialSummary: String(summaryResponse.content),
    financialChart: chartData,
    logs: log(
      "financialAnalysis",
      chartData.available
        ? `Summarized financial signals; extracted a ${chartData.series.length}-period revenue series.`
        : "Summarized financial signals; no reliable structured revenue data found for a chart."
    ),
  };
}
