import { useEffect, useMemo, useState } from "react";
import type { Bill } from "./types";
import { getBills, saveBills, exportBackup, importBackup } from "./storage";
import { monthKey, addMonths, monthLabel } from "./billLogic";
import Dashboard from "./components/Dashboard";
import BillForm from "./components/BillForm";
import ImportModal from "./components/ImportModal";
import { Download, Upload, Plus, FileUp } from "lucide-react";
import "./styles/app.css";

export default function App() {
  const [bills, setBills] = useState<Bill[]>(() => getBills());
  const [selectedMonth, setSelectedMonth] = useState(() => monthKey(new Date()));
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    saveBills(bills);
  }, [bills]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const sortedByCreated = useMemo(
    () => [...bills].sort((a, b) => a.name.localeCompare(b.name)),
    [bills]
  );

  function upsertBill(bill: Bill) {
    setBills((prev) => {
      const idx = prev.findIndex((b) => b.id === bill.id);
      if (idx === -1) return [...prev, bill];
      const next = [...prev];
      next[idx] = bill;
      return next;
    });
    setShowForm(false);
    setEditingBill(null);
  }

  function deleteBill(id: string) {
    setBills((prev) => prev.filter((b) => b.id !== id));
  }

  function handleImportBills(newBills: Bill[], summary: string) {
    setBills((prev) => [...prev, ...newBills]);
    setToast(summary);
    setShowImport(false);
  }

  function handleBackupImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      try {
        const imported = importBackup(text);
        setBills(imported);
        setToast(`Restored ${imported.length} bills from backup.`);
      } catch (err) {
        setToast(err instanceof Error ? err.message : "Failed to import backup.");
      }
    });
    e.target.value = "";
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Bill Tracker</h1>
        <div className="header-actions">
          <button className="btn" onClick={() => setShowImport(true)}>
            <FileUp size={16} /> Import
          </button>
          <button className="btn" onClick={exportBackup}>
            <Download size={16} /> Backup
          </button>
          <label className="btn">
            <Upload size={16} /> Restore
            <input type="file" accept="application/json" hidden onChange={handleBackupImport} />
          </label>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingBill(null);
              setShowForm(true);
            }}
          >
            <Plus size={16} /> Add Bill
          </button>
        </div>
      </header>

      <div className="month-nav">
        <button className="btn" onClick={() => setSelectedMonth((m) => addMonths(m, -1))}>
          ← Prev
        </button>
        <span className="month-label">{monthLabel(selectedMonth)}</span>
        <button className="btn" onClick={() => setSelectedMonth((m) => addMonths(m, 1))}>
          Next →
        </button>
      </div>

      <Dashboard
        bills={bills}
        selectedMonth={selectedMonth}
        onEdit={(bill) => {
          setEditingBill(bill);
          setShowForm(true);
        }}
        onDelete={deleteBill}
        onTogglePaid={upsertBill}
      />

      {showForm && (
        <BillForm
          bill={editingBill}
          onSave={upsertBill}
          onClose={() => {
            setShowForm(false);
            setEditingBill(null);
          }}
        />
      )}

      {showImport && (
        <ImportModal onImport={handleImportBills} onClose={() => setShowImport(false)} />
      )}

      {toast && <div className="toast">{toast}</div>}

      {sortedByCreated.length === 0 && !showForm && (
        <div className="empty-state">
          No bills yet. Add one manually, or import from CSV/PDF to get started.
        </div>
      )}
    </div>
  );
}
