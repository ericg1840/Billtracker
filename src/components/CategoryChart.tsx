import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { Bill } from "../types";
import { categoryBreakdown } from "../billLogic";

interface Props {
  bills: Bill[];
  monthKey: string;
}

const COLORS = ["#5b8def", "#f5a623", "#7ed321", "#bd10e0", "#50e3c2", "#e94b3c"];

export default function CategoryChart({ bills, monthKey }: Props) {
  const data = categoryBreakdown(bills, monthKey);

  if (data.length === 0) {
    return (
      <div className="chart-card">
        <h3>By Category</h3>
        <div className="empty-state">No data for this month.</div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>By Category</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
            {data.map((entry, i) => (
              <Cell key={entry.category} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
