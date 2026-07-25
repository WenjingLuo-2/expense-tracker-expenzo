"use client";

import type { Expense } from "@/lib/types";
import {
  budgetStreak,
  categoryTotals,
  currentMonthExpenses,
  sumAmount,
} from "@/lib/analytics";
import { getCategoryMeta } from "@/lib/categories";
import { formatCurrency } from "@/lib/format";

const RADIUS = 70;
const STROKE = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DEFAULT_MONTHLY_BUDGET = 2000; // dollars; no budget-settings UI yet

interface MonthlyInsightsProps {
  expenses: Expense[];
  /** Monthly spending target used to derive the daily budget for the streak. */
  monthlyBudget?: number;
}

export function MonthlyInsights({
  expenses,
  monthlyBudget = DEFAULT_MONTHLY_BUDGET,
}: MonthlyInsightsProps) {
  const monthExpenses = currentMonthExpenses(expenses);
  const categories = categoryTotals(monthExpenses);
  const total = sumAmount(monthExpenses);
  const top3 = categories.slice(0, 3);

  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dailyBudget = monthlyBudget / daysInMonth;
  const streak = budgetStreak(expenses, dailyBudget);

  // Donut arcs, drawn from every category with spending this month.
  const segments = categories.filter((c) => c.total > 0);
  let offset = 0;
  const arcs = segments.map((seg) => {
    const meta = getCategoryMeta(seg.category);
    const length = (seg.percentage / 100) * CIRCUMFERENCE;
    const arc = {
      color: meta.hex,
      dasharray: `${length} ${CIRCUMFERENCE - length}`,
      dashoffset: -offset,
    };
    offset += length;
    return arc;
  });

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
      <header className="mb-6 border-b border-dashed border-slate-200 pb-4 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Monthly Insights</h2>
        <p className="mt-1 text-sm text-slate-500">{monthLabel}</p>
      </header>

      {segments.length === 0 ? (
        <div className="rounded-xl bg-slate-50 py-12 text-center text-sm text-slate-400">
          No spending recorded this month yet.
        </div>
      ) : (
        <>
          {/* Donut with a "Spending" label in the middle */}
          <div className="relative mx-auto h-48 w-48">
            <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
              <circle cx="90" cy="90" r={RADIUS} fill="none" stroke="#f1f5f9" strokeWidth={STROKE} />
              {arcs.map((arc, i) => (
                <circle
                  key={i}
                  cx="90"
                  cy="90"
                  r={RADIUS}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={STROKE}
                  strokeDasharray={arc.dasharray}
                  strokeDashoffset={arc.dashoffset}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-lg bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100">
                Spending
              </span>
            </div>
          </div>

          {/* Top 3 categories */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Top categories</h3>
              <span className="text-xs font-medium text-slate-400">Top 3</span>
            </div>
            <ul className="space-y-2.5">
              {top3.map((seg) => {
                const meta = getCategoryMeta(seg.category);
                return (
                  <li key={seg.category} className="flex items-center gap-3">
                    <span
                      className="h-8 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: meta.hex }}
                      aria-hidden
                    />
                    <span className="text-lg" aria-hidden>
                      {meta.icon}
                    </span>
                    <span className="flex-1 text-sm font-medium text-slate-700">
                      {seg.category}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-slate-900">
                      {formatCurrency(seg.total)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}

      {/* Budget streak (dashed card, echoing the sketch) */}
      <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-300 p-5 text-center">
        <p className="text-sm font-medium text-slate-500">Budget Streak</p>
        <p className="my-1 text-4xl font-extrabold tabular-nums text-emerald-600">{streak}</p>
        <p className="text-sm text-slate-500">
          {streak === 1 ? "day" : "days"} under budget
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <span aria-hidden>🔥</span>
          Target {formatCurrency(dailyBudget)}/day
        </div>
      </div>
    </section>
  );
}
