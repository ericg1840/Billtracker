import { useState } from "react";
import type { Transaction } from "../transactionTypes";
import { parseTransactionCsv } from "../transactionImport";

interface Props {
  existing: Transaction[];
  onImport: (transactions: Transaction[], summary: string) => void;
  onClose: () => void;
}

export default function TransactionImportModal({ existing, onImport, onClose }: Props) {
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    file
      .text()
      .then((text) => {
        const result = parseTransactionCsv(text, existing);
        if (result.addedCount === 0 && result.skippedCount > 0 && result.duplicateCount === 0) {
          setError("No valid transaction rows found. Expected an Apple Card-style export.");
          return;
        }
        const parts = [`Imported ${result.addedCount} transaction${result.addedCount === 1 ? "" : "s"}`];
        if (result.duplicateCount > 0) parts.push(`skipped ${result.duplicateCount} already-imported`);
        if (result.skippedCount > 0) parts.push(`skipped ${result.skippedCount} unrecognized`);
        const summaryText = parts.join(", ") + ".";
        setSummary(summaryText);
        onImport(result.transactions, summaryText);
      })
      .catch(() => setError("Failed to read that file."));
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Import Transactions</h2>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: -8 }}>
          Upload a card transaction export (like Apple Card's CSV) with columns for date, description,
          merchant, category, type, and amount. Purchases, refunds, cash back, and payments are all
          recognized.
        </p>

        <div className="import-choices">
          <label className="btn btn-primary">
            Choose CSV File
            <input type="file" accept=".csv,text/csv" hidden onChange={handleFile} />
          </label>
          {summary && <p className="import-summary">{summary}</p>}
          {error && <p className="form-error">{error}</p>}
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
