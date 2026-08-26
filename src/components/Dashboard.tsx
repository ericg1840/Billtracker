import type { Bill } from "../types";
import { billsDueSoon, monthTotals } from "../billLogic";
import TrendChart from "./TrendChart";
import CategoryChart from "./CategoryChart";
import BillList from "./BillList";
import { AlertTriangle } from "lucide-react";

interface Props {
  bills: Bill[];
  selectedMonth: string;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onTogglePaid: (bill: Bill) => void;
}

export default function Dashboard({ bills, selectedMonth, onEdit, onDelete, onTogglePaid }: Props) {
  const totals = monthTotals(bills, selectedMonth);
  const dueSoon = billsDueSoon(bills);

  return (
    <div className="dashboard">
      {dueSoon.length > 0 && (
        <div className="due-soon-widget">
          <AlertTriangle size={18} />
          <span>
            {dueSoon.length} bill{dueSoon.length > 1 ? "s" : ""} due soon or overdue:{" "}
            {dueSoon.map((b) => b.name).join(", ")}
          </span>
        </div>
      )}

      <div className="summary-strip">
        <div className="summary-card">
          <span className="summary-label">Total Due</span>
          <span className="summary-value">${totals.total.toFixed(2)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Paid</span>
          <span className="summary-value paid">${totals.paid.toFixed(2)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Remaining</span>
          <span className="summary-value remaining">${totals.remaining.toFixed(2)}</span>
        </div>
      </div>

      <div className="chart-grid">
        <TrendChart bills={bills} monthKey={selectedMonth} />
        <CategoryChart bills={bills} monthKey={selectedMonth} />
      </div>

      <BillList
        bills={bills}
        monthKey={selectedMonth}
        onEdit={onEdit}
        onDelete={onDelete}
        onTogglePaid={onTogglePaid}
      />
    </div>
  );
}
