import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { Bill } from "../types";
import { categoryBreakdown } from "../billLogic";
import { getCategoryStyle } from "../categoryStyle";

interface Props {
  bills: Bill[];
  monthKey: string;
}

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
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={80}
            paddingAngle={2}
            cornerRadius={6}
          >
            {data.map((entry) => (
              <Cell key={entry.category} fill={getCategoryStyle(entry.category).color} stroke="none" />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
