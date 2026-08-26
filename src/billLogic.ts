import type { Bill, BillStatus } from "./types";

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function addMonths(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return monthKey(d);
}

export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

/** Due date for a bill within a given "YYYY-MM" month, or null if not applicable that month. */
export function dueDateForMonth(bill: Bill, monthKeyStr: string): Date | null {
  if (bill.type === "monthly") {
    if (!bill.dueDay) return null;
    const [y, m] = monthKeyStr.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const day = Math.min(bill.dueDay, daysInMonth);
    return new Date(y, m - 1, day);
  }
  if (bill.type === "onetime" && bill.dueDate) {
    const d = new Date(bill.dueDate + "T00:00:00");
    if (monthKey(d) !== monthKeyStr) return null;
    return d;
  }
  return null;
}

export function isPaid(bill: Bill, monthKeyStr: string): boolean {
  return !!bill.paidHistory[monthKeyStr];
}

export function amountForMonth(bill: Bill, monthKeyStr: string): number {
  return bill.amountHistory[monthKeyStr] ?? bill.amount;
}

export function billStatus(bill: Bill, monthKeyStr: string, today: Date = new Date()): BillStatus {
  if (isPaid(bill, monthKeyStr)) return "paid";
  const due = dueDateForMonth(bill, monthKeyStr);
  if (!due) return "upcoming";
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round((due.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "overdue";
  if (diffDays <= 5) return "due-soon";
  return "upcoming";
}

export function billsDueSoon(bills: Bill[], today: Date = new Date(), withinDays = 5): Bill[] {
  const thisMonth = monthKey(today);
  const nextMonth = addMonths(thisMonth, 1);
  const candidates = bills.filter((b) => b.type === "monthly" || b.dueDate);
  return candidates.filter((b) => {
    for (const mk of [thisMonth, nextMonth]) {
      const due = dueDateForMonth(b, mk);
      if (!due) continue;
      if (isPaid(b, mk)) continue;
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const diffDays = Math.round((due.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= withinDays) return true;
      if (diffDays < 0) return true; // overdue also surfaces here
    }
    return false;
  });
}

export function billsForMonth(bills: Bill[], monthKeyStr: string): Bill[] {
  return bills.filter((b) => {
    if (b.type === "monthly") return true;
    return dueDateForMonth(b, monthKeyStr) !== null;
  });
}

export function monthTotals(bills: Bill[], monthKeyStr: string) {
  const applicable = billsForMonth(bills, monthKeyStr);
  let total = 0;
  let paid = 0;
  for (const b of applicable) {
    const amt = amountForMonth(b, monthKeyStr);
    total += amt;
    if (isPaid(b, monthKeyStr)) paid += amt;
  }
  return { total, paid, remaining: total - paid };
}

export function categoryBreakdown(bills: Bill[], monthKeyStr: string) {
  const applicable = billsForMonth(bills, monthKeyStr);
  const map = new Map<string, number>();
  for (const b of applicable) {
    const amt = amountForMonth(b, monthKeyStr);
    map.set(b.category, (map.get(b.category) ?? 0) + amt);
  }
  return Array.from(map.entries()).map(([category, amount]) => ({ category, amount }));
}

export function trendData(bills: Bill[], monthsBack: number, endMonthKey: string) {
  const out: { month: string; label: string; total: number }[] = [];
  let mk = endMonthKey;
  for (let i = 0; i < monthsBack; i++) {
    out.unshift({ month: mk, label: monthLabel(mk), total: monthTotals(bills, mk).total });
    mk = addMonths(mk, -1);
  }
  return out;
}
