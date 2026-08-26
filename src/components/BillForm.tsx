import { useState } from "react";
import type { Bill, BillType } from "../types";
import { DEFAULT_CATEGORIES, KNOWN_PROVIDERS } from "../types";

const OTHER_OPTION = "__other__";

interface Props {
  bill: Bill | null;
  prefill?: {
    name?: string | null;
    amount?: number | null;
    dueDate?: string | null;
    source?: "pdf" | "csv";
  };
  onSave: (bill: Bill) => void;
  onClose: () => void;
}

export default function BillForm({ bill, prefill, onSave, onClose }: Props) {
  const isEdit = !!bill;
  const initialName = bill?.name ?? prefill?.name ?? "";
  const initialProvider = KNOWN_PROVIDERS.find((p) => p.name === initialName);
  const [nameOption, setNameOption] = useState(initialProvider ? initialProvider.name : OTHER_OPTION);
  const [customName, setCustomName] = useState(initialProvider ? "" : initialName);
  const [category, setCategory] = useState(bill?.category ?? initialProvider?.category ?? DEFAULT_CATEGORIES[0]);
  const [amount, setAmount] = useState(String(bill?.amount ?? prefill?.amount ?? ""));
  const [type, setType] = useState<BillType>(bill?.type ?? (prefill?.dueDate ? "onetime" : "monthly"));
  const [dueDay, setDueDay] = useState(String(bill?.dueDay ?? 1));
  const [dueDate, setDueDate] = useState(bill?.dueDate ?? prefill?.dueDate ?? "");
  const [notes, setNotes] = useState(bill?.notes ?? "");

  const isAutoDetected = !isEdit && !!prefill?.source;
  const name = nameOption === OTHER_OPTION ? customName : nameOption;

  function handleNameOptionChange(value: string) {
    setNameOption(value);
    const provider = KNOWN_PROVIDERS.find((p) => p.name === value);
    if (provider) {
      setCategory(provider.category);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!name.trim() || !Number.isFinite(parsedAmount) || parsedAmount < 0) return;

    const next: Bill = {
      id: bill?.id ?? crypto.randomUUID(),
      name: name.trim(),
      category,
      amount: parsedAmount,
      type,
      notes: notes.trim() || undefined,
      paidHistory: bill?.paidHistory ?? {},
      amountHistory: bill?.amountHistory ?? {},
      source: bill?.source ?? prefill?.source ?? "manual",
      createdAt: bill?.createdAt ?? new Date().toISOString(),
    };
    if (type === "monthly") {
      next.dueDay = Math.min(31, Math.max(1, Math.round(Number(dueDay)) || 1));
    } else {
      next.dueDate = dueDate;
    }
    onSave(next);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? "Edit Bill" : "Add Bill"}</h2>

        {isAutoDetected && (
          <div className="auto-detected-banner">
            Auto-detected from {prefill?.source?.toUpperCase()} — please confirm every field below.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bill-form">
          <label>
            Name
            <select value={nameOption} onChange={(e) => handleNameOptionChange(e.target.value)}>
              {KNOWN_PROVIDERS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
              <option value={OTHER_OPTION}>Other…</option>
            </select>
          </label>

          {nameOption === OTHER_OPTION && (
            <label>
              Bill name
              <input value={customName} onChange={(e) => setCustomName(e.target.value)} required />
            </label>
          )}

          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {DEFAULT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label>
            Amount
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>

          <label>
            Recurrence
            <select value={type} onChange={(e) => setType(e.target.value as BillType)}>
              <option value="monthly">Monthly</option>
              <option value="onetime">One-time</option>
            </select>
          </label>

          {type === "monthly" ? (
            <label>
              Due day of month
              <input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
              />
            </label>
          ) : (
            <label>
              Due date
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </label>
          )}

          <label>
            Notes
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
