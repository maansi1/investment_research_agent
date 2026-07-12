import { useState } from "react";

interface Props {
  index: number;
  title: string;
  content: string | string[];
  defaultOpen?: boolean;
}

export function ResearchSection({ index, title, content, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const items = Array.isArray(content) ? content : [content];

  return (
    <div className="research-section">
      <button className="section-toggle" onClick={() => setOpen(!open)}>
        <span className="section-index">{String(index).padStart(2, "0")}</span>
        <span className="section-title">{title}</span>
        <span className="section-chevron no-print">{open ? "−" : "+"}</span>
      </button>
      <div className="section-body" style={{ display: open ? "block" : "none" }}>
        {items.map((item, i) => (
          <p key={i}>{item}</p>
        ))}
      </div>
    </div>
  );
}
