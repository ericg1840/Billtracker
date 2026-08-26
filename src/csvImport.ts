import Papa from "papaparse";
import type { Bill } from "./types";

export interface CsvImportResult {
  bills: Bill[];
  addedCount: number;
  skippedCount: number;
  skippedReasons: string[];
}

function findKey(row: Record<string, string>, candidates: string[]): string | undefined {
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const match = keys.find((k) => k.trim().toLowerCase() === candidate);
    if (match) return match;
  }
  return undefined;
}

export function parseCsv(text: string): CsvImportResult {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const bills: Bill[] = [];
  let skippedCount = 0;
  const skippedReasons: string[] = [];

  for (const row of parsed.data) {
    const nameKey = findKey(row, ["name"]);
    const amountKey = findKey(row, ["amount"]);
    const categoryKey = findKey(row, ["category"]);
    const dueDayKey = findKey(row, ["dueday", "due day"]);
    const dueDateKey = findKey(row, ["duedate", "due date"]);

    const name = nameKey ? row[nameKey]?.trim() : "";
    const amountRaw = amountKey ? row[amountKey]?.trim() : "";
    const amount = amountRaw ? Number(amountRaw.replace(/[$,]/g, "")) : NaN;

    if (!name) {
      skippedCount++;
      skippedReasons.push("Missing name");
      continue;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      skippedCount++;
      skippedReasons.push(`Invalid amount for "${name}"`);
      continue;
    }

    const category = categoryKey ? row[categoryKey]?.trim() || "Other" : "Other";
    const dueDateRaw = dueDateKey ? row[dueDateKey]?.trim() : "";
    const dueDayRaw = dueDayKey ? row[dueDayKey]?.trim() : "";

    const bill: Bill = {
      id: crypto.randomUUID(),
      name,
      category,
      amount,
      type: dueDateRaw ? "onetime" : "monthly",
      paidHistory: {},
      amountHistory: {},
      source: "csv",
      createdAt: new Date().toISOString(),
    };

    if (dueDateRaw) {
      const d = new Date(dueDateRaw);
      if (!Number.isNaN(d.getTime())) {
        bill.dueDate = d.toISOString().slice(0, 10);
      } else {
        bill.dueDate = dueDateRaw;
      }
    } else {
      const day = Number(dueDayRaw);
      bill.dueDay = Number.isFinite(day) ? Math.min(31, Math.max(1, Math.round(day))) : 1;
    }

    bills.push(bill);
  }

  return {
    bills,
    addedCount: bills.length,
    skippedCount,
    skippedReasons,
  };
}
