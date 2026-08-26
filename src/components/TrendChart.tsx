import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Bill } from "../types";
import { trendData } from "../billLogic";

interface Props {
  bills: Bill[];
  monthKey: string;
  monthsBack?: number;
}

export default function TrendChart({ bills, monthKey, monthsBack = 6 }: Props) {
  const data = trendData(bills, monthsBack, monthKey);

  return (
    <div className="chart-card">
      <h3>Spend Trend</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} tickFormatter={(v: string) => v.split(" ")[0]} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `$${v}`} />
          <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, "Total"]} />
          <Line type="monotone" dataKey="total" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
