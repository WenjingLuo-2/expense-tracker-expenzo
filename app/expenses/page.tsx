"use client";

import { useMemo, useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import type { NewExpense } from "@/hooks/useExpenses";
import { useToast } from "@/hooks/useToast";
import { filterExpenses, sumAmount } from "@/lib/analytics";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency, todayISO } from "@/lib/format";
import type { Expense, ExpenseFilters as Filters } from "@/lib/types";
import { ExpenseFilters } from "@/components/ExpenseFilters";
import { ExpenseList } from "@/components/ExpenseList";
import { Modal } from "@/components/Modal";
import { ExpenseForm } from "@/components/ExpenseForm";
import { Toast } from "@/components/Toast";
import { PageSkeleton } from "@/components/PageSkeleton";

const EMPTY_FILTERS: Filters = {
  search: "",
  category: "All",
  startDate: "",
  endDate: "",
};

export default function ExpensesPage() {
  const { expenses, loading, error, addExpense, updateExpense, deleteExpense } =
    useExpenses();
  const { toast, showToast, dismissToast } = useToast();

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);

  const filtered = useMemo(
    () => filterExpenses(expenses, filters),
    [expenses, filters],
  );
  const filteredTotal = useMemo(() => sumAmount(filtered), [filtered]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
    setFormOpen(true);
  }

  async function handleSubmit(value: NewExpense) {
    try {
      if (editing) {
        await updateExpense(editing.id, value);
        showToast("Expense updated");
      } else {
        await addExpense(value);
        showToast("Expense added");
      }
      setFormOpen(false);
      setEditing(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Save failed", "error");
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteExpense(deleting.id);
      setDeleting(null);
      showToast("Expense deleted");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Delete failed", "error");
    }
  }

  function handleExport() {
    if (filtered.length === 0) {
      showToast("Nothing to export", "info");
      return;
    }
    downloadCsv(filtered, `expenses-${todayISO()}.csv`);
    showToast(`Exported ${filtered.length} expenses`);
  }

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-5">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500">
            {filtered.length === expenses.length
              ? `${expenses.length} total · ${formatCurrency(filteredTotal)}`
              : `${filtered.length} shown · ${formatCurrency(filteredTotal)}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export CSV
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add expense
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <ExpenseFilters
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={expenses.length}
      />

      <ExpenseList expenses={filtered} onEdit={openEdit} onDelete={setDeleting} />

      {/* Add / edit modal */}
      <Modal
        open={formOpen}
        title={editing ? "Edit expense" : "Add expense"}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
      >
        <ExpenseForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={Boolean(deleting)}
        title="Delete expense"
        onClose={() => setDeleting(null)}
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-900">
              {deleting?.description}
            </span>{" "}
            ({deleting ? formatCurrency(deleting.amount) : ""})? This can&apos;t be undone.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDeleting(null)}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
