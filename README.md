# AI Investment Research Agent

Built for the InsideIIM × Altuni AI Labs take-home assignment.

Given a company name, the agent researches it (profile, recent news, competitive
position, financial signals, sentiment, risk factors) and returns a decisive
**INVEST / PASS** call with reasoning, confidence, and supporting evidence — shown
live as the agent works through each research stage.

---

## Overview

- **Input:** a company name (public or private, Indian or global).
- **Process:** a LangGraph.js pipeline runs seven sequential stages — identify
  the company, check for live market data, gather news/competitive research,
  analyze financial signals, gauge press/public sentiment, extract risk
  factors, then synthesize a final decision.
- **Output:** an INVEST/PASS verdict rendered as a stamped decision, with an
  animated confidence ring, 3-6 sentence reasoning, key positives/risks, a
  live stock price + 3-month price chart (for public companies), a revenue
  trend chart (only when real reported figures were found), sentiment and
  risk gauges, and the full research dossier underneath (collapsible), so the
  verdict is auditable rather than a black box.
- **UX:** the frontend streams progress live via Server-Sent Events through a
  numbered pipeline timeline, styled as an analyst's research desk (dark
  ledger palette, serif masthead, monospace data readouts). A **Compare**
  mode runs two companies side by side, and each result can be exported to
  PDF via the browser's print dialog.

---

## How to run it

### Prerequisites
- Node.js 18.18+ and npm
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) — genuine
  ongoing free tier, no credit card required (used for the LLM)
- A [Tavily API key](https://tavily.com/) — free tier, 1,000 credits/month, no
  credit card required (used for web search)
- A [Finnhub API key](https://finnhub.io/register) — free tier, 60 calls/min,
  no credit card required (used for live stock price + price history; optional
  — the agent just skips market data and notes the company as
  private/unlisted if this is left blank)

All three keys are free to obtain and free to use at this project's scale —
no payment method needed anywhere in this stack.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env and paste in GEMINI_API_KEY, TAVILY_API_KEY, and (optionally) FINNHUB_API_KEY
npm run dev
```

Backend runs at `http://localhost:8787`. Health check: `GET /health`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL defaults to http://localhost:8787, change only if needed
npm run dev
```

Frontend runs at `http://localhost:5173`. Open it, type a company name, hit
**Research**.

### Testing the backend alone (no UI)
```bash
curl -X POST http://localhost:8787/api/research \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Zomato"}'
```

### Deploying
- **Backend → Render.** A `render.yaml` is included at the repo root (Blueprint
  deploy): connect the repo in the Render dashboard → "New +" → "Blueprint" →
  it will pick up `render.yaml` automatically. Set `GEMINI_API_KEY`,
  `TAVILY_API_KEY`, `FINNHUB_API_KEY`, and `CORS_ORIGIN` (your Vercel frontend
  URL) as env vars when prompted — they're marked `sync: false` so Render asks
  for them rather than storing them in the repo.
- **Frontend → Vercel.** A `vercel.json` is included in `frontend/`. Import the
  repo in Vercel, set root directory to `frontend`, framework auto-detects as
  Vite, and set `VITE_API_URL` to your deployed Render backend URL.

*(Live link, if deployed: add it here before submitting.)*

### Quick smoke test
Once the backend is running, `./test-run.sh "Zomato"` hits `/health` then runs
one full research call and pretty-prints the JSON result — faster than
clicking through the UI while you're debugging.

---

## How it works

### Architecture
```
React (Vite) ──POST/SSE──▶ Express ──▶ LangGraph.js StateGraph ──▶ Google Gemini
     UI                     routes        (7-node pipeline)         + Tavily search
                                                                     + Finnhub market data
```

### The graph (`backend/src/agent/graph.ts`)
A linear `StateGraph` with one shared state object that every node appends to:

1. **identifyCompany** — searches for a general company overview, has the LLM
   produce a short profile (sector, public/private status, scale).
2. **marketData** — pure data-fetch node, no LLM call: resolves the company
   name to a ticker via Finnhub and pulls a live quote + ~3-month daily price
   history. Silently returns `null` for private/unlisted companies or
   unresolved tickers — nothing downstream depends on this succeeding.
3. **webResearch** — searches recent news + competitive positioning, LLM
   summarizes both into a short brief.
4. **financialAnalysis** — searches for revenue/profit/valuation signals. Runs
   two LLM calls in parallel: a free-text summary, and a **strict structured
   extraction** (Zod schema) that only returns a chartable revenue series if
   the search results explicitly state real figures for 2+ periods — never
   estimated or interpolated. This is what backs the revenue trend chart, and
   is why that chart is often absent (see trade-offs below).
5. **sentimentAnalysis** — searches for controversy/praise/regulatory issues,
   LLM classifies overall sentiment (POSITIVE/NEUTRAL/MIXED/NEGATIVE/UNCLEAR).
6. **riskAssessment** — pure LLM reasoning (no new search) over everything
   gathered so far, producing 3-5 concrete risk bullets.
7. **decisionSynthesis** — LLM call with a Zod-enforced structured output
   (`withStructuredOutput`) producing `{ verdict, confidence, reasoning,
   keyPositives, keyRisks }`, factoring in live market data when available.
   This is the only node forced into strict JSON, since it's the one the UI
   renders as the headline result.

Every node also appends a log entry, and the streaming endpoint emits one SSE
event per completed node so the frontend timeline lights up stage-by-stage in
real time — built with `researchGraph.stream(...)`.

### Backend
Express with two endpoints:
- `POST /api/research` — runs the graph, returns the full result at once.
- `GET /api/research/stream` — SSE version, streams a `step` event per node,
  then a final `done` event.

### Frontend
Plain React + Vite (no extra state library needed for this scope). A
`useResearchRun` hook encapsulates one streaming run's state (timeline
progress, result, error), reused by both **Single** mode and **Compare**
mode (which just runs two independent hook instances side by side — no
backend changes needed for comparison). `ResearchPanel` renders the shared
result view: `VerdictCard` (stamped verdict + animated confidence ring),
`StockPriceChart` / `FinancialTrendChart` (Recharts), `SentimentGauge` /
`RiskGauge`, and collapsible numbered `ResearchSection`s for the full
dossier. PDF export uses the browser's native print dialog against a
dedicated print stylesheet, rather than a PDF-generation library.

The visual design is deliberately styled as an analyst's research note
rather than a generic SaaS dashboard: a dark ledger palette, a serif
(Fraunces) masthead paired with monospace (IBM Plex Mono) data readouts for
prices/tickers/confidence numbers, and the verdict rendered as a rotated
stamp — leaning into the "research desk" metaphor rather than a template.

---

## Key decisions & trade-offs

- **Google Gemini (`gemini-2.5-flash`) as the LLM, not a paid-only provider.**
  The assignment allows any LLM provider, and I picked Gemini specifically
  because Google offers a genuine ongoing free tier (no credit card, no
  expiration) rather than a one-time trial credit — so this project runs at
  literally zero cost to grade or extend. `backend/src/llm.ts` isolates this
  choice to one file; swapping to Claude or GPT is a two-line change since
  LangChain.js chat models share a common interface.

- **Linear pipeline over a fully agentic/branching graph.** LangGraph supports
  conditional edges and looping agents (e.g., an LLM deciding which tool to
  call next, or looping back to re-research). I chose a fixed, linear sequence
  instead because the research sub-tasks here are well-defined and don't
  depend on each other's *results* to decide *what to search next* — a
  linear pipeline is simpler to reason about, cheaper (fewer LLM calls
  deciding "what to do next"), and easier to debug/demo. **Left out:** a more
  autonomous version where the agent dynamically decides which sources to dig
  into deeper based on what it finds (e.g., digging deeper into financials
  only if the initial pass looks concerning). Noted under "what I'd improve."

- **Tavily for general web search + Finnhub only for live market data.** A
  proper research agent would ideally pull all structured data from paid
  fundamentals APIs. I split the difference: Finnhub (free tier) supplies
  *real* price/quote numbers for public companies, since fabricating a price
  chart would be actively misleading. For financials, I still lean on web
  search + a strict extraction prompt (see below) rather than a paid
  fundamentals API, to keep the agent working uniformly for **both public and
  private/startup companies** — a fundamentals API returns nothing for a
  private startup, which is a realistic and common case for an investment
  research tool.

- **The revenue trend chart only renders with real, explicitly-reported
  numbers.** `financialAnalysis` runs a second, strict structured-extraction
  LLM call (Zod schema, `available: boolean`) that is explicitly instructed
  to return `available: false` rather than estimate or interpolate figures.
  In practice this means the chart is often absent — that's intentional: a
  fabricated-looking chart in an investment tool is worse than no chart, so
  the UI shows an honest "no reliable data" note instead in that case.

- **Market data (`marketData` node) fails silently and never blocks the
  pipeline.** Private companies, unlisted startups, and many non-US tickers
  won't resolve on Finnhub's free tier. The node returns `null` rather than
  throwing, and every downstream node (including the final decision) treats
  "no market data" as a valid, expected state rather than an error.

- **Structured output only on nodes where it backs a real chart or the final
  verdict.** Zod + LangChain's `withStructuredOutput` is used for the revenue
  series and the final decision — both feed UI elements that need parseable
  fields. Other nodes (profile, news, sentiment, risk) return free text,
  since they're for human-readable transparency in the dossier, not machine
  parsing — structuring them too would add overhead without benefit.

- **SSE streaming over polling or WebSockets.** SSE is one-directional
  (server → client), which is all this needs, and is simpler to implement
  and deploy on Render/Vercel than a WebSocket server.

- **Compare mode reuses the single-run pipeline twice, not a new backend
  endpoint.** Two independent `useResearchRun` hook instances just open two
  SSE connections in parallel. Simpler than adding batch/multi-company
  support to the graph itself, at the cost of two full LLM/search passes
  running concurrently (which is also just... how comparing two companies
  should work).

- **PDF export via `window.print()` + a print stylesheet, not a PDF library.**
  Avoids adding `puppeteer` (heavy, awkward on serverless/Render free tier)
  or a client-side PDF renderer. The trade-off is the user goes through the
  browser's print dialog and chooses "Save as PDF" rather than a one-click
  download — acceptable for this scope, noted under "what I'd improve."

- **Decisive verdicts, no "maybe."** The decision prompt explicitly asks the
  model to commit to INVEST or PASS rather than hedge, and to let a low
  confidence score (rather than a middle verdict) express uncertainty. This
  matches the assignment's framing of the task as a real decision.

- **No persistence layer.** Each research run is stateless/in-memory; nothing
  is saved to a database. Given the 7-day scope, I chose to spend the time on
  the agent's research quality, market data, and visual design rather than a
  history/auth layer, though I've built full-stack apps with Postgres/Prisma
  before and would add this readily (see "what I'd improve").

- **Ambiguity call:** the brief didn't specify what "research" should consist
  of. I picked profile + news + competitive position + financial signals +
  sentiment + risk as a reasonably complete set that generalizes across
  public companies, Indian startups, and global private companies alike.

---

## Example runs

> Run the agent locally (`npm run dev` in both `backend/` and `frontend/`) and
> paste 2-3 real outputs here before submitting — e.g. one large public
> company (to show off the stock chart), one Indian startup (to show the
> "private, no market data" path), and one company you'd expect the agent to
> pass on. I've left this section templated rather than fabricated, since the
> whole point of the assignment is to show the agent's *actual* output.

**Example structure per run:**
```
### <Company Name>
Verdict: INVEST / PASS (confidence: XX%)
Reasoning: ...
Key positives: ...
Key risks: ...
Market data: <ticker + price, or "private/unlisted">
Revenue chart: <available, or "insufficient public data">
```

---

## What I would improve with more time

- **Adaptive/agentic research:** let the model decide which additional
  searches to run based on what it's already found (e.g., LangGraph
  conditional edges or a tool-calling ReAct loop), instead of a fixed
  sequence of searches.
- **A real fundamentals API** (e.g. Alpha Vantage / FMP) for public companies
  specifically, to get full income-statement-level data rather than
  relying on the LLM to spot explicitly-stated figures in search snippets.
- **Source citations in the UI** — surface the actual URLs behind each
  research section so a user can verify claims, not just trust the summary.
- **A proper PDF generation service** (e.g. a small Puppeteer/Playwright
  render step) for one-click download instead of the browser print dialog.
- **Persistence + history** (Postgres/Prisma, matching my usual stack) so past
  research runs are saved and comparable over time, and so re-researching the
  same company doesn't repeat identical searches within a short window
  (basic caching) — this would also let Compare mode save and revisit past
  comparisons.
- **Automated tests** for each node (mocking the LLM/search/market-data calls)
  and an end-to-end test of the graph.
- **Auth**, so this could be a real multi-user internal tool rather than a
  single-session demo.

---

## LLM chat session transcripts

Per the bonus instructions: this project was built in conversation with
Claude (Anthropic). To export the transcript before submitting, use the
"..." menu on this conversation in Claude → export/copy, save it as
`transcripts/build-session.md` (or `.pdf`) in this repo, and include it in
your final zip. It covers the full build: architecture decisions, the
LangGraph pipeline design, and the trade-offs documented above.
