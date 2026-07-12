/**
 * Thin wrapper around Finnhub's free tier (60 calls/min, no credit card
 * required) for stock lookups, quotes, and price history.
 *
 * This is intentionally best-effort: private companies, unlisted startups,
 * and many non-US tickers won't resolve or won't have candle data on the
 * free tier. Every function returns null on failure instead of throwing,
 * so the graph can proceed without market data when it's unavailable.
 */

const BASE_URL = "https://finnhub.io/api/v1";

function apiKey(): string {
  return process.env.FINNHUB_API_KEY || "";
}

async function finnhubGet<T>(path: string, params: Record<string, string>): Promise<T | null> {
  if (!apiKey()) return null;
  const url = new URL(BASE_URL + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set("token", apiKey());

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface CandlePoint {
  date: string; // YYYY-MM-DD
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

/** Resolves a free-text company name to the best-guess ticker symbol. */
async function lookupSymbol(companyName: string): Promise<string | null> {
  const result = await finnhubGet<{ result: Array<{ symbol: string; description: string; type: string }> }>(
    "/search",
    { q: companyName }
  );
  if (!result?.result?.length) return null;

  // Prefer common stock matches over ETFs/other instrument types.
  const bestMatch =
    result.result.find((r) => r.type === "Common Stock") || result.result[0];
  return bestMatch?.symbol || null;
}

/** Fetches a current quote + ~3 months of daily closes for a resolved symbol. */
async function fetchQuoteAndCandles(symbol: string): Promise<Omit<StockSnapshot, "symbol" | "companyName"> | null> {
  const quote = await finnhubGet<{ c: number; d: number; dp: number; h: number; l: number; o: number; pc: number }>(
    "/quote",
    { symbol }
  );
  if (!quote || quote.c === 0) return null; // c === 0 typically means "no data for this symbol"

  const to = Math.floor(Date.now() / 1000);
  const from = to - 90 * 24 * 60 * 60; // ~3 months back
  const candleResp = await finnhubGet<{ s: string; t: number[]; c: number[] }>("/stock/candle", {
    symbol,
    resolution: "D",
    from: String(from),
    to: String(to),
  });

  const candles: CandlePoint[] =
    candleResp?.s === "ok" && candleResp.t && candleResp.c
      ? candleResp.t.map((t, i) => ({
          date: new Date(t * 1000).toISOString().slice(0, 10),
          close: candleResp.c[i],
        }))
      : []; // Candle data is restricted for many symbols on the free tier - degrade gracefully.

  return {
    price: quote.c,
    change: quote.d,
    changePercent: quote.dp,
    high: quote.h,
    low: quote.l,
    open: quote.o,
    previousClose: quote.pc,
    candles,
  };
}

/**
 * Best-effort end-to-end lookup: company name -> ticker -> quote + candles.
 * Returns null for private/unlisted companies or if Finnhub isn't configured.
 */
export async function getStockSnapshot(companyName: string): Promise<StockSnapshot | null> {
  if (!apiKey()) return null;

  const symbol = await lookupSymbol(companyName);
  if (!symbol) return null;

  const data = await fetchQuoteAndCandles(symbol);
  if (!data) return null;

  return { symbol, companyName, ...data };
}
