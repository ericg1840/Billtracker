import type { Bill } from "../types";
import { billsForMonth } from "../billLogic";
import BillRow from "./BillRow";

interface Props {
  bills: Bill[];
  monthKey: string;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onTogglePaid: (bill: Bill) => void;
}

export default function BillList({ bills, monthKey, onEdit, onDelete, onTogglePaid }: Props) {
  const applicable = billsForMonth(bills, monthKey).sort((a, b) => a.name.localeCompare(b.name));

  if (applicable.length === 0) {
    return <div className="empty-state">No bills for this month.</div>;
  }

  return (
    <div className="bill-list">
      <div className="bill-row bill-row-header">
        <div className="bill-row-main">Bill</div>
        <div className="bill-row-due">Due</div>
        <div className="bill-row-amount">Amount</div>
        <div>Status</div>
        <div>Actions</div>
      </div>
      {applicable.map((bill) => (
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
  );
}
