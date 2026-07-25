import type { Category, Expense, ExpenseFilters } from "./types";
import { currentMonthKey } from "./format";

export interface CategoryTotal {
  category: Category;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyTotal {
  month: string; // YYYY-MM
  total: number;
}

export function filterExpenses(
  expenses: Expense[],
  filters: ExpenseFilters,
): Expense[] {
  const search = filters.search.trim().toLowerCase();
  return expenses.filter((e) => {
    if (filters.category !== "All" && e.category !== filters.category) {
      return false;
    }
    if (filters.startDate && e.date < filters.startDate) return false;
    if (filters.endDate && e.date > filters.endDate) return false;
    if (search) {
      const haystack = `${e.description} ${e.category}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

export function sumAmount(expenses: Expense[]): number {
  return expenses.reduce((acc, e) => acc + e.amount, 0);
}

export function totalThisMonth(expenses: Expense[]): number {
  const key = currentMonthKey();
  return sumAmount(expenses.filter((e) => e.date.startsWith(key)));
}

export function categoryTotals(expenses: Expense[]): CategoryTotal[] {
  const grand = sumAmount(expenses);
  const map = new Map<Category, { total: number; count: number }>();
  for (const e of expenses) {
    const entry = map.get(e.category) ?? { total: 0, count: 0 };
    entry.total += e.amount;
    entry.count += 1;
    map.set(e.category, entry);
  }
  return Array.from(map.entries())
    .map(([category, { total, count }]) => ({
      category,
      total,
      count,
      percentage: grand > 0 ? (total / grand) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/** Totals for the last `months` calendar months, oldest first. */
export function monthlyTotals(expenses: Expense[], months = 6): MonthlyTotal[] {
  const now = new Date();
  const buckets: MonthlyTotal[] = [];
  const index = new Map<string, number>();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    index.set(key, buckets.length);
    buckets.push({ month: key, total: 0 });
  }

  for (const e of expenses) {
    const key = e.date.slice(0, 7);
    const pos = index.get(key);
    if (pos !== undefined) {
      buckets[pos].total += e.amount;
    }
  }

  return buckets;
}

export function averagePerDay(expenses: Expense[]): number {
  if (expenses.length === 0) return 0;
  const key = currentMonthKey();
  const monthExpenses = expenses.filter((e) => e.date.startsWith(key));
  if (monthExpenses.length === 0) return 0;
  const now = new Date();
  const dayOfMonth = now.getDate();
  return sumAmount(monthExpenses) / dayOfMonth;
}

/** Expenses whose date falls in the current calendar month. */
export function currentMonthExpenses(expenses: Expense[]): Expense[] {
  const key = currentMonthKey();
  return expenses.filter((e) => e.date.startsWith(key));
}

/**
 * Consecutive days ending today whose total spending stayed at or under
 * `dailyBudget`. Days with no expenses count as under budget. Counting stops at
 * the first over-budget day, and never goes back before the first tracked
 * expense (so a brand-new account doesn't report an inflated streak).
 */
export function budgetStreak(expenses: Expense[], dailyBudget: number): number {
  if (dailyBudget <= 0 || expenses.length === 0) return 0;

  const perDay = new Map<string, number>();
  let earliest = expenses[0].date;
  for (const e of expenses) {
    perDay.set(e.date, (perDay.get(e.date) ?? 0) + e.amount);
    if (e.date < earliest) earliest = e.date;
  }

  let streak = 0;
  const cursor = new Date();
  for (let guard = 0; guard < 400; guard++) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (key < earliest) break; // don't count before tracking started
    if ((perDay.get(key) ?? 0) <= dailyBudget) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
