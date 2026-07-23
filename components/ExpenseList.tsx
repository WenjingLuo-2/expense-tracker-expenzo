"use client";

import type { Expense } from "@/lib/types";
import { CategoryBadge } from "./CategoryBadge";
import { formatCurrency, formatDate } from "@/lib/format";

interface Props {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseList({ expenses, onEdit, onDelete }: Props) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl">
          🔍
        </div>
        <p className="text-sm font-medium text-slate-700">No expenses found</p>
        <p className="mt-1 text-xs text-slate-500">
          Try adjusting your filters, or add a new expense.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      {/* Desktop table */}
      <table className="hidden w-full text-left text-sm sm:table">
        <thead>
          <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-5 py-3 font-medium">Date</th>
            <th className="px-5 py-3 font-medium">Description</th>
            <th className="px-5 py-3 font-medium">Category</th>
            <th className="px-5 py-3 text-right font-medium">Amount</th>
            <th className="px-5 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {expenses.map((e) => (
            <tr key={e.id} className="group transition-colors hover:bg-slate-50">
              <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">
                {formatDate(e.date)}
              </td>
              <td className="px-5 py-3.5 font-medium text-slate-800">{e.description}</td>
              <td className="px-5 py-3.5">
                <CategoryBadge category={e.category} />
              </td>
              <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold tabular-nums text-slate-900">
                {formatCurrency(e.amount)}
              </td>
              <td className="px-5 py-3.5 text-right">
                <RowActions onEdit={() => onEdit(e)} onDelete={() => onDelete(e)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <ul className="divide-y divide-slate-100 sm:hidden">
        {expenses.map((e) => (
          <li key={e.id} className="flex items-start justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-slate-800">{e.description}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <CategoryBadge category={e.category} />
                <span className="text-xs text-slate-400">{formatDate(e.date)}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-semibold tabular-nums text-slate-900">
                {formatCurrency(e.amount)}
              </span>
              <RowActions onEdit={() => onEdit(e)} onDelete={() => onDelete(e)} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit expense"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete expense"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      </button>
    </div>
  );
}
