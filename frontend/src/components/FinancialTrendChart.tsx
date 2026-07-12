import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FinancialChart } from "../types";

interface Props {
  data: FinancialChart;
}

export function FinancialTrendChart({ data }: Props) {
  if (!data.available || data.series.length < 2) {
    return (
      <div className="financial-panel financial-panel-empty">
        <p className="chart-caption">
          {data.note || "No reliably reported revenue series was found in public sources for a chart."}
        </p>
      </div>
    );
  }

  const unitLabel = [data.currency, data.unit].filter(Boolean).join(" ");

  return (
    <div className="financial-panel">
      <div className="financial-panel-header">
        <span>Revenue trend{unitLabel ? ` (${unitLabel})` : ""}</span>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data.series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="period"
            tick={{ fill: "#8B96A0", fontFamily: "IBM Plex Mono, monospace", fontSize: 11 }}
            axisLine={{ stroke: "rgba(236,232,223,0.15)" }}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: "#1A2129",
              border: "1px solid rgba(236,232,223,0.15)",
              borderRadius: 6,
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: 12,
            }}
            labelStyle={{ color: "#8B96A0" }}
          />
          <Bar dataKey="revenue" fill="#3E7C8C" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="chart-caption">{data.note}</p>
    </div>
  );
}
