import type { Bill } from "../types";
import { amountForMonth, billStatus, dueDateForMonth, isPaid } from "../billLogic";
import { getCategoryStyle } from "../categoryStyle";
import { Pencil, Trash2, Check } from "lucide-react";

interface Props {
  bill: Bill;
  monthKey: string;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onTogglePaid: (bill: Bill) => void;
}

const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  overdue: "Overdue",
  "due-soon": "Due soon",
  upcoming: "Upcoming",
};

export default function BillRow({ bill, monthKey, onEdit, onDelete, onTogglePaid }: Props) {
  const status = billStatus(bill, monthKey);
  const amount = amountForMonth(bill, monthKey);
  const due = dueDateForMonth(bill, monthKey);
  const paid = isPaid(bill, monthKey);
  const { icon: CategoryIcon, color, soft } = getCategoryStyle(bill.category);

  function togglePaid() {
    const nextPaid = !paid;
    let actualAmount = bill.amount;
    if (nextPaid) {
      const input = window.prompt(
        `Actual amount for ${bill.name} (${monthKey})?`,
        String(amount)
      );
      if (input === null) return;
      const parsed = Number(input);
      actualAmount = Number.isFinite(parsed) ? parsed : amount;
    }
    const nextBill: Bill = {
      ...bill,
      paidHistory: { ...bill.paidHistory, [monthKey]: nextPaid },
      amountHistory: nextPaid
        ? { ...bill.amountHistory, [monthKey]: actualAmount }
        : bill.amountHistory,
    };
    onTogglePaid(nextBill);
  }

  return (
    <div className={`bill-row status-${status}`}>
      <div className="bill-row-main">
        <div className="bill-icon-avatar" style={{ background: soft }}>
          <CategoryIcon size={16} color={color} strokeWidth={2} />
        </div>
        <div className="bill-row-text">
          <span className="bill-name">{bill.name}</span>
          <span className="bill-category">{bill.category}</span>
        </div>
      </div>
      <div className="bill-row-due">
        {due ? due.toLocaleDateString() : bill.type === "monthly" ? `Day ${bill.dueDay}` : "—"}
      </div>
      <div className="bill-row-amount">${amount.toFixed(2)}</div>
      <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>
      <div className="bill-row-actions">
        <button className="icon-btn" onClick={() => onEdit(bill)} aria-label="Edit">
          <Pencil size={16} />
        </button>
        <button className="icon-btn" onClick={() => onDelete(bill.id)} aria-label="Delete">
          <Trash2 size={16} />
        </button>
        <button
          className={`status-toggle status-${status}`}
          onClick={togglePaid}
          aria-label={paid ? "Mark unpaid" : "Mark paid"}
          title={paid ? "Mark unpaid" : "Mark paid"}
        >
          {paid && <Check size={14} strokeWidth={3} />}
        </button>
      </div>
    </div>
  );
}
