import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Bill } from "../types";
import { trendData } from "../billLogic";

interface Props {
  bills: Bill[];
  monthKey: string;
  monthsBack?: number;
}

const PALETTE = [
  "oklch(72% 0.15 85)",
  "oklch(70% 0.14 215)",
  "oklch(68% 0.15 152)",
  "oklch(68% 0.17 40)",
  "oklch(68% 0.17 350)",
];

export default function TrendChart({ bills, monthKey, monthsBack = 6 }: Props) {
  const data = trendData(bills, monthsBack, monthKey);

  return (
    <div className="chart-card">
      <h3>Spend Trend</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
            tickFormatter={(v: string) => v.split(" ")[0]}
            axisLine={{ stroke: "oklch(89% 0.02 290)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(v: number) => `$${v}`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => [`$${Number(v).toFixed(2)}`, "Total"]}
            cursor={{ fill: "oklch(93% 0.015 290)" }}
          />
          <Bar dataKey="total" radius={[8, 8, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={entry.month}
                fill={i === data.length - 1 ? "oklch(58% 0.22 290)" : PALETTE[i % PALETTE.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
