import type { Expense } from "./types";

function escapeCell(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function expensesToCsv(expenses: Expense[]): string {
  const header = ["Date", "Category", "Description", "Tag", "Amount"];
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    e.description,
    e.tag,
    e.amount.toFixed(2),
  ]);
  return [header, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n");
}

/** Trigger a browser download of the expenses as a CSV file. */
export function downloadCsv(expenses: Expense[], filename = "expenses.csv"): void {
  const csv = expensesToCsv(expenses);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
