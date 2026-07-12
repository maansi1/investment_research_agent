import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

const tavily = new TavilySearchResults({
  maxResults: 5,
  apiKey: process.env.TAVILY_API_KEY,
});

export interface SearchHit {
  title: string;
  url: string;
  content: string;
}

/**
 * Runs a web search and returns a normalized list of hits.
 * Tavily can return either a JSON string or an array depending on version,
 * so we defensively handle both.
 */
export async function webSearch(query: string): Promise<SearchHit[]> {
  const raw = await tavily.invoke(query);

  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Tavily returned a plain string (e.g. an error message) - wrap it.
      return [{ title: query, url: "", content: raw }];
    }
  }

  if (!Array.isArray(parsed)) return [];

  return parsed.map((item: any) => ({
    title: item.title ?? "",
    url: item.url ?? "",
    content: item.content ?? "",
  }));
}

/** Flattens search hits into a single text blob suitable for feeding an LLM prompt. */
export function formatHits(hits: SearchHit[]): string {
  if (hits.length === 0) return "No relevant results found.";
  return hits
    .map((h, i) => `[${i + 1}] ${h.title}\n${h.content}\nSource: ${h.url}`)
    .join("\n\n");
}
