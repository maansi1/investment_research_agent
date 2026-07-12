import { Router, Request, Response } from "express";
import { researchGraph } from "../agent/graph";
import { ResearchResult } from "../types";

export const researchRouter = Router();

function buildInitialState(companyName: string) {
  return {
    companyName,
    companyProfile: "",
    stockData: null,
    webResearch: [],
    financialSummary: "",
    financialChart: { available: false, currency: "", unit: "", series: [], note: "" },
    newsSentiment: "",
    riskFactors: [],
    decision: undefined,
    logs: [],
  };
}

function toResult(companyName: string, finalState: any): ResearchResult {
  return {
    companyName,
    companyProfile: finalState.companyProfile,
    webResearch: finalState.webResearch,
    financialSummary: finalState.financialSummary,
    financialChart: finalState.financialChart,
    stockData: finalState.stockData,
    newsSentiment: finalState.newsSentiment,
    riskFactors: finalState.riskFactors,
    decision: finalState.decision,
    logs: finalState.logs,
  };
}

/**
 * POST /api/research
 * Body: { companyName: string }
 * Runs the full graph and returns the final result in one response.
 * Simple to call with curl/Postman; no streaming.
 */
researchRouter.post("/", async (req: Request, res: Response) => {
  const companyName = String(req.body?.companyName || "").trim();
  if (!companyName) {
    return res.status(400).json({ error: "companyName is required" });
  }

  try {
    const finalState = await researchGraph.invoke(buildInitialState(companyName));
    return res.json(toResult(companyName, finalState));
  } catch (err: any) {
    console.error("Research failed:", err);
    return res.status(500).json({ error: err?.message || "Research failed" });
  }
});

/**
 * GET /api/research/stream?company=NAME
 * Server-Sent Events endpoint. Emits one event per completed graph node so
 * the frontend can show live progress, then a final "done" event with the
 * full result.
 */
researchRouter.get("/stream", async (req: Request, res: Response) => {
  const companyName = String(req.query.company || "").trim();
  if (!companyName) {
    return res.status(400).json({ error: "company query param is required" });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    let accumulated: any = buildInitialState(companyName);

    for await (const chunk of await researchGraph.stream(buildInitialState(companyName))) {
      // chunk looks like { [nodeName]: partialState }
      const [nodeName, partial] = Object.entries(chunk)[0] as [string, any];
      accumulated = { ...accumulated, ...partial };
      if (partial.webResearch) {
        accumulated.webResearch = [...(accumulated.webResearch || []), ...partial.webResearch].filter(
          (v, i, arr) => arr.indexOf(v) === i
        );
      }
      if (partial.riskFactors) {
        accumulated.riskFactors = partial.riskFactors;
      }
      if (partial.logs) {
        accumulated.logs = [...(accumulated.logs || []), ...partial.logs];
      }
      send("step", { node: nodeName, state: partial });
    }

    send("done", toResult(companyName, accumulated));
  } catch (err: any) {
    console.error("Streaming research failed:", err);
    send("error", { message: err?.message || "Research failed" });
  } finally {
    res.end();
  }
});
