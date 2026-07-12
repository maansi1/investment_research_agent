import { useRef, useState } from "react";
import { streamResearch } from "../api/client";
import { ResearchResult } from "../types";

export function useResearchRun() {
  const [loading, setLoading] = useState(false);
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const run = (companyName: string) => {
    cleanupRef.current?.();
    setLoading(true);
    setResult(null);
    setError(null);
    setCompletedStages(new Set());
    setActiveStage("identifyCompany");

    cleanupRef.current = streamResearch(companyName, {
      onStep: (node) => {
        setCompletedStages((prev) => new Set(prev).add(node));
        setActiveStage(node);
      },
      onDone: (finalResult) => {
        setResult(finalResult);
        setLoading(false);
        setActiveStage(null);
      },
      onError: (message) => {
        setError(message);
        setLoading(false);
        setActiveStage(null);
      },
    });
  };

  return { run, loading, completedStages, activeStage, result, error };
}
