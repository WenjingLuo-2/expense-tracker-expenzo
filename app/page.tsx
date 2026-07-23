"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useExpenses } from "@/hooks/useExpenses";
import { useToast } from "@/hooks/useToast";
import {
  categoryTotals,
  averagePerDay,
  monthlyTotals,
  sumAmount,
  totalThisMonth,
} from "@/lib/analytics";
import { SummaryCards } from "@/components/SummaryCards";
import { CategoryChart } from "@/components/CategoryChart";
import { MonthlyChart } from "@/components/MonthlyChart";
import { ExpenseList } from "@/components/ExpenseList";
import { Modal } from "@/components/Modal";
import { ExpenseForm } from "@/components/ExpenseForm";
import { Toast } from "@/components/Toast";
import { PageSkeleton } from "@/components/PageSkeleton";
import type { NewExpense } from "@/hooks/useExpenses";

export default function DashboardPage() {
  const { expenses, loading, error, addExpense } = useExpenses();
  const { toast, showToast, dismissToast } = useToast();
  const [adding, setAdding] = useState(false);

  const stats = useMemo(() => {
    const cats = categoryTotals(expenses);
    return {
      total: sumAmount(expenses),
      thisMonth: totalThisMonth(expenses),
      avgPerDay: averagePerDay(expenses),
      categories: cats,
      topCategory: cats[0] ?? null,
      monthly: monthlyTotals(expenses, 6),
    };
  }, [expenses]);

  const recent = expenses.slice(0, 5);

  async function handleAdd(value: NewExpense) {
    try {
      await addExpense(value);
      setAdding(false);
      showToast("Expense added");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to add expense", "error");
    }
  }

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Your spending at a glance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add expense
        </button>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <SummaryCards
        total={stats.total}
        thisMonth={stats.thisMonth}
        avgPerDay={stats.avgPerDay}
        topCategory={stats.topCategory}
        count={expenses.length}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Spending by category</h2>
          <CategoryChart data={stats.categories} total={stats.total} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Last 6 months</h2>
          <MonthlyChart data={stats.monthly} />
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Recent expenses</h2>
          <Link
            href="/expenses"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            View all →
          </Link>
        </div>
        {expenses.length === 0 ? (
          <EmptyState onAdd={() => setAdding(true)} />
        ) : (
          <ExpenseList
            expenses={recent}
            onEdit={() => showToast("Open the Expenses page to edit", "info")}
            onDelete={() => showToast("Open the Expenses page to delete", "info")}
          />
        )}
      </section>

      <Modal open={adding} title="Add expense" onClose={() => setAdding(false)}>
        <ExpenseForm onSubmit={handleAdd} onCancel={() => setAdding(false)} />
      </Modal>

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-3xl">
        💸
      </div>
      <p className="text-base font-semibold text-slate-800">No expenses yet</p>
      <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
        Add your first expense to start seeing summaries and spending insights.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
      >
        Add your first expense
      </button>
    </div>
  );
}
