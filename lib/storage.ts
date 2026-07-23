import type { Expense, Category } from "./types";
import { CATEGORY_NAMES } from "./categories";

const STORAGE_KEY = "expense-tracker.expenses.v1";

function isValidExpense(value: unknown): value is Expense {
  if (typeof value !== "object" || value === null) return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.date === "string" &&
    typeof e.amount === "number" &&
    Number.isFinite(e.amount) &&
    typeof e.category === "string" &&
    CATEGORY_NAMES.includes(e.category as Category) &&
    typeof e.description === "string" &&
    typeof e.createdAt === "string"
  );
}

export function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidExpense);
  } catch (err) {
    // Corrupt or inaccessible storage — fail soft with an empty list.
    console.error("Failed to load expenses from localStorage:", err);
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (err) {
    console.error("Failed to save expenses to localStorage:", err);
    throw new Error("Could not save your changes. Storage may be full or unavailable.");
  }
}

/** Generate a reasonably unique id without adding a dependency. */
export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
