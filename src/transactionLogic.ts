import type { Transaction } from "./transactionTypes";

export function txMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

export function txMonthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function transactionsForMonth(transactions: Transaction[], monthKeyStr: string): Transaction[] {
  return transactions.filter((t) => txMonthKey(t.date) === monthKeyStr);
}

export function availableMonths(transactions: Transaction[]): string[] {
  return Array.from(new Set(transactions.map((t) => txMonthKey(t.date)))).sort().reverse();
}

/** Net spend = purchases + credits (credits are already stored as negative amounts). */
export function netSpend(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === "Purchase" || t.type === "Credit")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function totalRefunds(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type === "Credit").reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

export function totalCashBack(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type === "Debit").reduce((sum, t) => sum + t.amount, 0);
}

export function totalPayments(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type === "Payment").reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

export function categoryBreakdown(transactions: Transaction[]) {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "Purchase" && t.type !== "Credit") continue;
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  }
  return Array.from(map.entries())
    .map(([category, amount]) => ({ category, amount }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

export function purchaserBreakdown(transactions: Transaction[]) {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "Purchase" && t.type !== "Credit") continue;
    const key = t.purchasedBy || "Unknown";
    map.set(key, (map.get(key) ?? 0) + t.amount);
  }
  return Array.from(map.entries())
    .map(([person, amount]) => ({ person, amount }))
    .sort((a, b) => b.amount - a.amount);
}
