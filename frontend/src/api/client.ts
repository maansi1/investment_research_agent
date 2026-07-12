import { ResearchResult } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

export interface StreamCallbacks {
  onStep: (node: string, partialState: any) => void;
  onDone: (result: ResearchResult) => void;
  onError: (message: string) => void;
}

/**
 * Connects to the backend's SSE endpoint and streams step-by-step agent
 * progress. Returns a cleanup function to close the connection early.
 */
export function streamResearch(companyName: string, callbacks: StreamCallbacks): () => void {
  const url = `${API_URL}/api/research/stream?company=${encodeURIComponent(companyName)}`;
  const source = new EventSource(url);

  source.addEventListener("step", (e: MessageEvent) => {
    const payload = JSON.parse(e.data);
    callbacks.onStep(payload.node, payload.state);
  });

  source.addEventListener("done", (e: MessageEvent) => {
    const result = JSON.parse(e.data) as ResearchResult;
    callbacks.onDone(result);
    source.close();
  });

  source.addEventListener("error", (e: MessageEvent) => {
    try {
      const payload = JSON.parse((e as any).data);
      callbacks.onError(payload.message || "Something went wrong.");
    } catch {
      callbacks.onError("Connection to the research agent was lost.");
    }
    source.close();
  });

  return () => source.close();
}

/** Fallback non-streaming call (useful for quick testing via curl too). */
export async function runResearch(companyName: string): Promise<ResearchResult> {
  const res = await fetch(`${API_URL}/api/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Research failed");
  }
  return res.json();
}
