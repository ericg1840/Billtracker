import Papa from "papaparse";
import type { Transaction, TransactionType } from "./transactionTypes";

export interface TransactionImportResult {
  transactions: Transaction[];
  addedCount: number;
  duplicateCount: number;
  skippedCount: number;
}

const VALID_TYPES: TransactionType[] = ["Purchase", "Credit", "Debit", "Payment"];

function findKey(row: Record<string, string>, candidates: string[]): string | undefined {
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const match = keys.find((k) => k.trim().toLowerCase() === candidate);
    if (match) return match;
  }
  return undefined;
}

function parseDate(raw: string): string | null {
  const trimmed = raw.trim();
  const mdy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (mdy) {
    const [, m, d, y] = mdy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const d = new Date(trimmed);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}

/** Existing transactions get a dedupe signature so re-importing an overlapping
 * statement export doesn't double-count the same rows. */
function signature(t: Pick<Transaction, "date" | "description" | "amount" | "purchasedBy">): string {
  return `${t.date}|${t.description}|${t.amount}|${t.purchasedBy ?? ""}`;
}

export function parseTransactionCsv(text: string, existing: Transaction[]): TransactionImportResult {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const existingSignatures = new Set(existing.map(signature));
  const transactions: Transaction[] = [];
  let skippedCount = 0;
  let duplicateCount = 0;

  for (const row of parsed.data) {
    const dateKey = findKey(row, ["transaction date", "date"]);
    const clearingKey = findKey(row, ["clearing date"]);
    const descKey = findKey(row, ["description"]);
    const merchantKey = findKey(row, ["merchant"]);
    const categoryKey = findKey(row, ["category"]);
    const typeKey = findKey(row, ["type"]);
    const amountKey = findKey(row, ["amount (usd)", "amount"]);
    const purchasedByKey = findKey(row, ["purchased by"]);

    const dateRaw = dateKey ? row[dateKey]?.trim() : "";
    const date = dateRaw ? parseDate(dateRaw) : null;
    const amountRaw = amountKey ? row[amountKey]?.trim() : "";
    const amount = amountRaw ? Number(amountRaw.replace(/[$,]/g, "")) : NaN;
    const typeRaw = (typeKey ? row[typeKey]?.trim() : "") as TransactionType;

    if (!date || !Number.isFinite(amount) || !VALID_TYPES.includes(typeRaw)) {
      skippedCount++;
      continue;
    }

    const clearingRaw = clearingKey ? row[clearingKey]?.trim() : "";
    const clearingDate = clearingRaw ? parseDate(clearingRaw) ?? undefined : undefined;

    const t: Transaction = {
      id: crypto.randomUUID(),
      date,
      clearingDate,
      description: descKey ? row[descKey]?.trim() ?? "" : "",
      merchant: merchantKey ? row[merchantKey]?.trim() ?? "" : "",
      category: categoryKey ? row[categoryKey]?.trim() || "Other" : "Other",
      type: typeRaw,
      amount,
      purchasedBy: purchasedByKey ? row[purchasedByKey]?.trim() || undefined : undefined,
      source: "csv",
      createdAt: new Date().toISOString(),
    };

    // Only dedupe against previously-imported data, never against other rows
    // in this same file — two genuinely separate purchases can share the
    // same date/description/amount (e.g. buying the same item twice).
    if (existingSignatures.has(signature(t))) {
      duplicateCount++;
      continue;
    }
    transactions.push(t);
  }

  return {
    transactions,
    addedCount: transactions.length,
    duplicateCount,
    skippedCount,
  };
}
