import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { Transaction } from "../transactionTypes";
import { categoryBreakdown } from "../transactionLogic";
import { txCategoryColor } from "../transactionCategoryStyle";

interface Props {
  transactions: Transaction[];
}

export default function TransactionCategoryChart({ transactions }: Props) {
  const data = categoryBreakdown(transactions);

  if (data.length === 0) {
    return (
      <div className="chart-card">
        <h3>Spend by Category</h3>
        <div className="empty-state">No spend to break down for this month.</div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>Spend by Category</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={85}
            paddingAngle={2}
            cornerRadius={6}
          >
            {data.map((entry) => (
              <Cell key={entry.category} fill={txCategoryColor(entry.category)} stroke="none" />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
