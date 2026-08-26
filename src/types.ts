export type BillType = "monthly" | "onetime";

export type BillSource = "manual" | "csv" | "pdf";

export interface Bill {
  id: string;
  name: string;
  category: string;
  amount: number;
  type: BillType;
  dueDay?: number; // 1-31, required if type === "monthly"
  dueDate?: string; // YYYY-MM-DD, required if type === "onetime"
  notes?: string;
  paidHistory: Record<string, boolean>; // key = "YYYY-MM"
  amountHistory: Record<string, number>; // key = "YYYY-MM" -> actual amount that month
  source: BillSource;
  createdAt: string; // ISO timestamp
}

export const DEFAULT_CATEGORIES = [
  "Electric",
  "Gas",
  "Water",
  "Internet",
  "Other",
];

export type BillStatus = "paid" | "overdue" | "due-soon" | "upcoming";
