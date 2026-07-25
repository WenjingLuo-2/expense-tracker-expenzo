"use client";

import { useExpenses } from "@/hooks/useExpenses";
import { MonthlyInsights } from "@/components/MonthlyInsights";
import { PageSkeleton } from "@/components/PageSkeleton";

export default function InsightsPage() {
  const { expenses, loading, error } = useExpenses();

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Insights</h1>
        <p className="text-sm text-slate-500">A monthly snapshot of your spending.</p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <MonthlyInsights expenses={expenses} />
    </div>
  );
}
