import { STAGES } from "../types";

interface Props {
  completed: Set<string>;
  active: string | null;
}

export function AgentTimeline({ completed, active }: Props) {
  return (
    <ol className="timeline">
      {STAGES.map((stage, i) => {
        const isDone = completed.has(stage.key);
        const isActive = active === stage.key;
        return (
          <li key={stage.key} className={isDone ? "done" : isActive ? "active" : "pending"}>
            <span className="timeline-index">{String(i + 1).padStart(2, "0")}</span>
            <span className="timeline-label">{stage.label}</span>
            {isActive && <span className="spinner" aria-hidden />}
            {isDone && <span className="check">✓</span>}
          </li>
        );
      })}
    </ol>
  );
}
