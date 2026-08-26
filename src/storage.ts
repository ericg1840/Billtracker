import type { Bill } from "./types";

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

export function exportBackup(): void {
  const bills = getBills();
  const blob = new Blob([JSON.stringify({ bills, exportedAt: new Date().toISOString() }, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bill-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importBackup(json: string): Bill[] {
  const parsed = JSON.parse(json);
  const bills: Bill[] = Array.isArray(parsed) ? parsed : parsed.bills;
  if (!Array.isArray(bills)) {
    throw new Error("Invalid backup file: expected a list of bills.");
  }
  saveBills(bills);
  return bills;
}
