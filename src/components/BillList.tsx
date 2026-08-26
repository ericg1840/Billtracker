import { useState } from "react";
import type { Bill, BillStatus } from "../types";
import { billsForMonth, billStatus } from "../billLogic";
import BillRow from "./BillRow";

interface Props {
  bills: Bill[];
  monthKey: string;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onTogglePaid: (bill: Bill) => void;
}

type Filter = "all" | BillStatus;

const FILTERS: { key: Filter; label: string; emoji: string }[] = [
  { key: "all", label: "All bills", emoji: "✨" },
  { key: "due-soon", label: "Due soon", emoji: "⏰" },
  { key: "overdue", label: "Overdue", emoji: "🚨" },
  { key: "paid", label: "Paid", emoji: "🎉" },
];

export default function BillList({ bills, monthKey, onEdit, onDelete, onTogglePaid }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const applicable = billsForMonth(bills, monthKey).sort((a, b) => a.name.localeCompare(b.name));

  const counts: Record<Filter, number> = {
    all: applicable.length,
    paid: 0,
    "due-soon": 0,
    overdue: 0,
    upcoming: 0,
  };
  for (const bill of applicable) {
    counts[billStatus(bill, monthKey)]++;
  }

  const visible = filter === "all" ? applicable : applicable.filter((b) => billStatus(b, monthKey) === filter);

  return (
    <>
      <div className="filter-chips">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-chip ${filter === f.key ? "active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.emoji} {f.label}
            <span className="filter-chip-count">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {applicable.length === 0 ? (
        <div className="empty-state">No bills for this month.</div>
      ) : visible.length === 0 ? (
        <div className="empty-state">No bills match this filter.</div>
      ) : (
        <div className="bill-list">
          {visible.map((bill) => (
            <BillRow
              key={bill.id}
              bill={bill}
              monthKey={monthKey}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePaid={onTogglePaid}
            />
          ))}
        </div>
      )}
    </>
  );
}
