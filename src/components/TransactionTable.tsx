import { useMemo, useState } from "react";
import type { Transaction } from "../transactionTypes";
import { txCategoryColor } from "../transactionCategoryStyle";
import { Trash2 } from "lucide-react";

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TYPE_LABEL: Record<string, string> = {
  Purchase: "Purchase",
  Credit: "Refund",
  Debit: "Cash back",
  Payment: "Payment",
};

const TYPE_BADGE_CLASS: Record<string, string> = {
  Purchase: "badge-upcoming",
  Credit: "badge-paid",
  Debit: "badge-paid",
  Payment: "badge-due-soon",
};

export default function TransactionTable({ transactions, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [purchaser, setPurchaser] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.category))).sort(),
    [transactions]
  );
  const purchasers = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.purchasedBy).filter(Boolean))).sort() as string[],
    [transactions]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions
      .filter((t) => category === "all" || t.category === category)
      .filter((t) => purchaser === "all" || t.purchasedBy === purchaser)
      .filter(
        (t) =>
          !q || t.description.toLowerCase().includes(q) || t.merchant.toLowerCase().includes(q)
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, search, category, purchaser]);

  if (transactions.length === 0) {
    return <div className="empty-state">No transactions for this month.</div>;
  }

  return (
    <div className="chart-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: 16, borderBottom: "1px solid var(--border)" }}>
        <input
          className="tx-search"
          placeholder="Search description or merchant…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {purchasers.length > 1 && (
          <select value={purchaser} onChange={(e) => setPurchaser(e.target.value)}>
            <option value="all">Everyone</option>
            {purchasers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No transactions match your filters.</div>
      ) : (
        <div className="tx-table">
          {filtered.map((t) => (
            <div key={t.id} className="tx-row">
              <div className="tx-row-main">
                <span
                  className="tx-category-dot"
                  style={{ background: txCategoryColor(t.category) }}
                  aria-hidden
                />
                <div className="tx-row-text">
                  <span className="tx-desc">{t.merchant || t.description}</span>
                  <span className="tx-meta">
                    {t.category}
                    {t.purchasedBy ? ` · ${t.purchasedBy}` : ""}
                  </span>
                </div>
              </div>
              <span className="tx-date">{new Date(t.date + "T00:00:00").toLocaleDateString()}</span>
              <span className={`badge ${TYPE_BADGE_CLASS[t.type] ?? "badge-upcoming"}`}>
                {TYPE_LABEL[t.type] ?? t.type}
              </span>
              <span className={`tx-amount ${t.amount < 0 ? "negative" : ""}`}>
                {t.amount < 0 ? "-" : ""}${Math.abs(t.amount).toFixed(2)}
              </span>
              <button className="icon-btn" onClick={() => onDelete(t.id)} aria-label="Delete transaction">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
