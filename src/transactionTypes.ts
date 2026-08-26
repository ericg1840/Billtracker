export type TransactionType = "Purchase" | "Credit" | "Debit" | "Payment";

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD (Transaction Date)
  clearingDate?: string; // YYYY-MM-DD
  description: string;
  merchant: string;
  category: string;
  type: TransactionType;
  amount: number; // sign preserved from source export
  purchasedBy?: string;
  source: "csv";
  createdAt: string;
}
