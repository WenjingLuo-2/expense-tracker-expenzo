"use client";

import { useState } from "react";
import type { Category, Expense, ExpenseInput } from "@/lib/types";
import type { NewExpense } from "@/hooks/useExpenses";
import { CATEGORIES } from "@/lib/categories";
import { todayISO } from "@/lib/format";

interface ExpenseFormProps {
  initial?: Expense;
  onSubmit: (value: NewExpense) => void | Promise<void>;
  onCancel: () => void;
}

type Errors = Partial<Record<keyof ExpenseInput, string>>;

const MAX_AMOUNT = 1_000_000;

export function ExpenseForm({ initial, onSubmit, onCancel }: ExpenseFormProps) {
  const [form, setForm] = useState<ExpenseInput>({
    date: initial?.date ?? todayISO(),
    amount: initial ? String(initial.amount) : "",
    category: initial?.category ?? "Food",
    description: initial?.description ?? "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(values: ExpenseInput): Errors {
    const next: Errors = {};

    if (!values.date) {
      next.date = "Please choose a date.";
    } else if (values.date > todayISO()) {
      next.date = "Date can't be in the future.";
    }

    const amount = Number(values.amount);
    if (values.amount.trim() === "") {
      next.amount = "Enter an amount.";
    } else if (!Number.isFinite(amount) || amount <= 0) {
      next.amount = "Amount must be greater than 0.";
    } else if (amount > MAX_AMOUNT) {
      next.amount = "That amount looks too large.";
    } else if (!/^\d+(\.\d{1,2})?$/.test(values.amount.trim())) {
      next.amount = "Use at most 2 decimal places.";
    }

    if (!values.description.trim()) {
      next.description = "Add a short description.";
    } else if (values.description.trim().length > 120) {
      next.description = "Keep it under 120 characters.";
    }

    return next;
  }

  function update<K extends keyof ExpenseInput>(key: K, value: ExpenseInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        date: form.date,
        amount: Math.round(Number(form.amount) * 100) / 100,
        category: form.category,
        description: form.description.trim(),
      });
    } finally {
      // Re-enable the button whether the save succeeded or failed (on failure
      // the parent keeps the modal open so the user can retry).
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Amount */}
      <div>
        <label htmlFor="amount" className="mb-1.5 block text-sm font-medium text-slate-700">
          Amount
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            $
          </span>
          <input
            id="amount"
            inputMode="decimal"
            autoFocus
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => update("amount", e.target.value)}
            className={fieldClass(errors.amount) + " pl-7"}
            aria-invalid={Boolean(errors.amount)}
          />
        </div>
        <FieldError message={errors.amount} />
      </div>

      {/* Category */}
      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Category</span>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => {
            const active = form.category === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => update("category", cat.name as Category)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition-all ${
                  active
                    ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="text-lg" aria-hidden>
                  {cat.icon}
                </span>
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className="mb-1.5 block text-sm font-medium text-slate-700">
          Date
        </label>
        <input
          id="date"
          type="date"
          max={todayISO()}
          value={form.date}
          onChange={(e) => update("date", e.target.value)}
          className={fieldClass(errors.date)}
          aria-invalid={Boolean(errors.date)}
        />
        <FieldError message={errors.date} />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">
          Description
        </label>
        <input
          id="description"
          type="text"
          placeholder="e.g. Lunch with team"
          maxLength={140}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={fieldClass(errors.description)}
          aria-invalid={Boolean(errors.description)}
        />
        <FieldError message={errors.description} />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {initial ? "Save changes" : "Add expense"}
        </button>
      </div>
    </form>
  );
}

function fieldClass(error?: string): string {
  const base =
    "w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2";
  return error
    ? `${base} border-red-300 focus:border-red-400 focus:ring-red-100`
    : `${base} border-slate-200 focus:border-brand-400 focus:ring-brand-100`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-600">{message}</p>;
}
