import { getStockSnapshot } from "../tools/stockData";
import { GraphState, log } from "../state";

/**
 * Attempts to resolve the company to a live ticker and fetch a price
 * snapshot + recent price history via Finnhub. Silently no-ops for
 * private/unlisted companies or when FINNHUB_API_KEY isn't set - the rest
 * of the pipeline doesn't depend on this succeeding.
 */
export async function marketData(state: GraphState): Promise<Partial<GraphState>> {
  const snapshot = await getStockSnapshot(state.companyName);

  return {
    stockData: snapshot,
    logs: log(
      "marketData",
      snapshot
        ? `Found live market data for ${snapshot.symbol}.`
        : "No public market data found (likely private/unlisted, or ticker unresolved)."
    ),
  };
}
