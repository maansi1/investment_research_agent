import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StockSnapshot } from "../types";

interface Props {
  data: StockSnapshot;
}

export function StockPriceChart({ data }: Props) {
  const isUp = data.change >= 0;
  const chartData = data.candles.map((c) => ({ date: c.date, close: c.close }));

  return (
    <div className="stock-panel">
      <div className="stock-ticker-row">
        <span className="stock-symbol">{data.symbol}</span>
        <span className="stock-price">{data.price.toFixed(2)}</span>
        <span className={`stock-change ${isUp ? "up" : "down"}`}>
          {isUp ? "▲" : "▼"} {Math.abs(data.change).toFixed(2)} ({data.changePercent.toFixed(2)}%)
        </span>
      </div>
      <div className="stock-range-row">
        <span>OPEN {data.open.toFixed(2)}</span>
        <span>HIGH {data.high.toFixed(2)}</span>
        <span>LOW {data.low.toFixed(2)}</span>
        <span>PREV CLOSE {data.previousClose.toFixed(2)}</span>
      </div>
      {chartData.length > 1 ? (
        <div className="stock-chart">
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isUp ? "#C9A227" : "#B3462C"} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={isUp ? "#C9A227" : "#B3462C"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis domain={["auto", "auto"]} hide />
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
              <Area
                type="monotone"
                dataKey="close"
                stroke={isUp ? "#C9A227" : "#B3462C"}
                strokeWidth={2}
                fill="url(#priceFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className="chart-caption">~3 month daily close, via Finnhub</p>
        </div>
      ) : (
        <p className="chart-caption">Price history unavailable for this symbol on the free data tier.</p>
      )}
    </div>
  );
}
