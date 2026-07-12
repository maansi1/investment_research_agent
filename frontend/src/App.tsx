import { useState } from "react";
import { SearchBar } from "./components/SearchBar";
import { ResearchPanel } from "./components/ResearchPanel";
import { useResearchRun } from "./hooks/useResearchRun";
import "./App.css";

type Mode = "single" | "compare";

export default function App() {
  const [mode, setMode] = useState<Mode>("single");
  const single = useResearchRun();
  const compareA = useResearchRun();
  const compareB = useResearchRun();

  const [companyA, setCompanyA] = useState("");
  const [companyB, setCompanyB] = useState("");

  const bothCompareLoading = compareA.loading || compareB.loading;

  const handleCompareSubmit = () => {
    if (!companyA.trim() || !companyB.trim()) return;
    compareA.run(companyA.trim());
    compareB.run(companyB.trim());
  };

  return (
    <div className="app">
      <header>
        <p className="eyebrow">The Research Desk</p>
        <h1>AI Investment Research Agent</h1>
        <p className="subtitle">
          Name a company. The desk investigates end to end, then stamps a verdict: invest or pass.
        </p>

        <div className="mode-toggle no-print">
          <button className={mode === "single" ? "active" : ""} onClick={() => setMode("single")}>
            Single
          </button>
          <button className={mode === "compare" ? "active" : ""} onClick={() => setMode("compare")}>
            Compare
          </button>
        </div>
      </header>

      {mode === "single" && (
        <>
          <SearchBar onSubmit={single.run} disabled={single.loading} />
          <ResearchPanel
            panelId="single-result"
            loading={single.loading}
            completedStages={single.completedStages}
            activeStage={single.activeStage}
            result={single.result}
            error={single.error}
          />
        </>
      )}

      {mode === "compare" && (
        <>
          <div className="compare-inputs no-print">
            <input
              type="text"
              placeholder="Company A, e.g. Zomato"
              value={companyA}
              onChange={(e) => setCompanyA(e.target.value)}
              disabled={bothCompareLoading}
            />
            <input
              type="text"
              placeholder="Company B, e.g. Swiggy"
              value={companyB}
              onChange={(e) => setCompanyB(e.target.value)}
              disabled={bothCompareLoading}
            />
            <button
              onClick={handleCompareSubmit}
              disabled={bothCompareLoading || !companyA.trim() || !companyB.trim()}
            >
              {bothCompareLoading ? "Researching..." : "Compare"}
            </button>
          </div>

          <div className="compare-grid">
            <ResearchPanel
              panelId="compare-result-a"
              loading={compareA.loading}
              completedStages={compareA.completedStages}
              activeStage={compareA.activeStage}
              result={compareA.result}
              error={compareA.error}
            />
            <ResearchPanel
              panelId="compare-result-b"
              loading={compareB.loading}
              completedStages={compareB.completedStages}
              activeStage={compareB.activeStage}
              result={compareB.result}
              error={compareB.error}
            />
          </div>
        </>
      )}
    </div>
  );
}
