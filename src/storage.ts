import type { Bill } from "./types";
import { getTransactions, saveTransactions } from "./transactionStorage";
import type { Transaction } from "./transactionTypes";

const STORAGE_KEY = "bill-tracker:bills";

export function getBills(): Bill[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Bill[];
  } catch {
    return [];
  }
}

export function saveBills(bills: Bill[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
}

export interface BackupResult {
  bills: Bill[];
  transactions: Transaction[];
}

export function exportBackup(): void {
  const bills = getBills();
  const transactions = getTransactions();
  const blob = new Blob(
    [JSON.stringify({ bills, transactions, exportedAt: new Date().toISOString() }, null, 2)],
    { type: "application/json" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bill-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importBackup(json: string): BackupResult {
  const parsed = JSON.parse(json);
  const bills: Bill[] = Array.isArray(parsed) ? parsed : parsed.bills ?? [];
  const transactions: Transaction[] = Array.isArray(parsed) ? [] : parsed.transactions ?? [];
  if (!Array.isArray(bills)) {
    throw new Error("Invalid backup file: expected a list of bills.");
  }
  saveBills(bills);
  saveTransactions(transactions);
  return { bills, transactions };
}
