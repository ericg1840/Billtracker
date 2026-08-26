import { useEffect, useState } from "react";
import type { Transaction } from "../transactionTypes";
import {
  availableMonths,
  netSpend,
  totalCashBack,
  totalPayments,
  totalRefunds,
  transactionsForMonth,
  txMonthLabel,
} from "../transactionLogic";
import TransactionCategoryChart from "./TransactionCategoryChart";
import TransactionTable from "./TransactionTable";
import TransactionImportModal from "./TransactionImportModal";
import { ChevronLeft, ChevronRight, FileUp } from "lucide-react";

interface Props {
  transactions: Transaction[];
  onImport: (transactions: Transaction[], summary: string) => void;
  onDelete: (id: string) => void;
}

export default function TransactionsView({ transactions, onImport, onDelete }: Props) {
  const months = availableMonths(transactions);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    if (months.length === 0) {
      setSelectedMonth(null);
    } else if (!selectedMonth || !months.includes(selectedMonth)) {
      setSelectedMonth(months[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [months.join(",")]);

  const monthTransactions = selectedMonth ? transactionsForMonth(transactions, selectedMonth) : [];
  const spend = netSpend(monthTransactions);
  const cashBack = totalCashBack(monthTransactions);
  const refunds = totalRefunds(monthTransactions);
  const payments = totalPayments(monthTransactions);

  const monthIndex = selectedMonth ? months.indexOf(selectedMonth) : -1;

  return (
    <div className="dashboard">
      <div className="hero">
        <div className="hero-heading">
          <span className="hero-badge">
            <span className="hero-badge-dot" />
            {months.length} month{months.length === 1 ? "" : "s"} imported
          </span>
          <span className="hero-title">Where's it all going? 💳</span>
          <span className="hero-subtitle">
            Import a card export to see purchases, refunds, and cash back in one place.
          </span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowImport(true)}>
          <FileUp size={16} /> Import CSV
        </button>
      </div>

      {months.length === 0 ? (
        <div className="empty-state">
          No transactions yet. Import a card CSV export to get started.
        </div>
      ) : (
        <>
          <div className="month-nav">
            <button
              className="btn icon-btn"
              disabled={monthIndex >= months.length - 1}
              onClick={() => setSelectedMonth(months[monthIndex + 1])}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="month-label">{selectedMonth ? txMonthLabel(selectedMonth) : ""}</span>
            <button
              className="btn icon-btn"
              disabled={monthIndex <= 0}
              onClick={() => setSelectedMonth(months[monthIndex - 1])}
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="summary-strip">
            <div className="summary-card total">
              <span className="summary-label">Net Spend</span>
              <div className="summary-value-row">
                <span className="summary-value">${spend.toFixed(2)}</span>
              </div>
              <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
                ${refunds.toFixed(2)} refunded this month
              </span>
            </div>
            <div className="summary-card paid">
              <span className="summary-label">Cash Back</span>
              <div className="summary-value-row">
                <span className="summary-value paid">${cashBack.toFixed(2)}</span>
              </div>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Daily Cash earned</span>
            </div>
            <div className="summary-card remaining">
              <span className="summary-label">Payments</span>
              <div className="summary-value-row">
                <span className="summary-value" style={{ color: "var(--text)" }}>
                  ${payments.toFixed(2)}
                </span>
              </div>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Paid toward balance — not spend
              </span>
            </div>
          </div>

          <div className="chart-grid" style={{ gridTemplateColumns: "1fr" }}>
            <TransactionCategoryChart transactions={monthTransactions} />
          </div>

          <TransactionTable transactions={monthTransactions} onDelete={onDelete} />
        </>
      )}

      {showImport && (
        <TransactionImportModal
          existing={transactions}
          onImport={(added, summary) => {
            onImport(added, summary);
            setShowImport(false);
          }}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}
