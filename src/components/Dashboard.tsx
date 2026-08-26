import type { Bill } from "../types";
import { billsDueSoon, billsForMonth, isPaid, monthLabel, monthTotals } from "../billLogic";
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
  const monthBills = billsForMonth(bills, selectedMonth);
  const billCount = monthBills.length;
  const unpaidCount = monthBills.filter((b) => !isPaid(b, selectedMonth)).length;
  const paidPct = totals.total > 0 ? Math.round((totals.paid / totals.total) * 100) : 0;

  return (
    <div className="dashboard">
      <div className="hero">
        <div className="hero-heading">
          <span className="hero-badge">
            <span className="hero-badge-dot" />
            {monthLabel(selectedMonth)} · {billCount} bill{billCount === 1 ? "" : "s"} tracked
          </span>
          <span className="hero-title">Hey there! Let's tackle those bills 👋</span>
          <span className="hero-subtitle">
            See what's due, mark it paid, and keep an eye on where your money's going.
          </span>
        </div>
      </div>

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
        <div className="summary-card total">
          <span className="summary-label">Total Due</span>
          <div className="summary-value-row">
            <span className="summary-value">${totals.total.toFixed(2)}</span>
            <span className="summary-pill total">
              {billCount} bill{billCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <div className="summary-card paid">
          <span className="summary-label">Paid</span>
          <div className="summary-value-row">
            <span className="summary-value paid">${totals.paid.toFixed(2)}</span>
            <span className="summary-pill paid">{paidPct}%</span>
          </div>
          <div className="summary-progress">
            <div className="summary-progress-fill" style={{ width: `${paidPct}%` }} />
          </div>
        </div>
        <div className="summary-card remaining">
          <span className="summary-label">Remaining</span>
          <div className="summary-value-row">
            <span className="summary-value remaining">${totals.remaining.toFixed(2)}</span>
            <span className="summary-pill remaining">
              {unpaidCount} left
            </span>
          </div>
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
