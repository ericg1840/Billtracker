import { useState } from "react";
import type { Bill } from "../types";
import { parseCsv } from "../csvImport";
import { extractFromPdf, type PdfExtractionResult } from "../pdfExtract";
import BillForm from "./BillForm";

interface Props {
  onImport: (bills: Bill[], summary: string) => void;
  onClose: () => void;
}

type Mode = "choose" | "csv" | "pdf-review";

export default function ImportModal({ onImport, onClose }: Props) {
  const [mode, setMode] = useState<Mode>("choose");
  const [csvSummary, setCsvSummary] = useState<string | null>(null);
  const [pdfResult, setPdfResult] = useState<PdfExtractionResult | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function handleCsvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      const result = parseCsv(text);
      const summary = `Imported ${result.addedCount} bill${result.addedCount === 1 ? "" : "s"}, skipped ${result.skippedCount}.`;
      setCsvSummary(summary);
      onImport(result.bills, summary);
    });
  }

  async function handlePdfFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setPdfError(null);
    try {
      const result = await extractFromPdf(file);
      setPdfResult(result);
      setMode("pdf-review");
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "Failed to read PDF.");
    } finally {
      setBusy(false);
    }
  }

  if (mode === "pdf-review" && pdfResult) {
    return (
      <BillForm
        bill={null}
        prefill={{
          name: pdfResult.guessedName,
          amount: pdfResult.guessedAmount,
          dueDate: pdfResult.guessedDueDate,
          source: "pdf",
        }}
        onSave={(bill) => onImport([bill], `Added "${bill.name}" from PDF.`)}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Import Bills</h2>

        {mode === "choose" && (
          <div className="import-choices">
            <button className="btn" onClick={() => setMode("csv")}>
              Import from CSV
            </button>
            <label className="btn">
              Upload PDF Bill
              <input type="file" accept="application/pdf" hidden onChange={handlePdfFile} />
            </label>
            {busy && <p>Extracting text from PDF…</p>}
            {pdfError && <p className="form-error">{pdfError}</p>}
          </div>
        )}

        {mode === "csv" && (
          <div className="import-csv">
            <p>
              CSV must have a header row with columns: <code>name, amount, category, dueDay</code>{" "}
              (or <code>dueDate</code> for one-time bills).
            </p>
            <label className="btn">
              Choose CSV File
              <input type="file" accept=".csv,text/csv" hidden onChange={handleCsvFile} />
            </label>
            {csvSummary && <p className="import-summary">{csvSummary}</p>}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
