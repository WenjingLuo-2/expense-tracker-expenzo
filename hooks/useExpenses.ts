"use client";

import { useCallback, useEffect, useState } from "react";
import type { Category, Expense } from "@/lib/types";
import * as api from "@/lib/api";

export interface NewExpense {
  date: string;
  amount: number;
  category: Category;
  description: string;
}

interface UseExpensesResult {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  addExpense: (input: NewExpense) => Promise<void>;
  updateExpense: (id: string, input: NewExpense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

/**
 * Central store for expenses, now backed by the Go API (was localStorage).
 * The mutation functions are async and throw on failure so callers can show a
 * toast; read errors land in `error`. Expenses are kept sorted newest-first.
 */
export function useExpenses(): UseExpensesResult {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.fetchExpenses();
      setExpenses(sortExpenses(data));
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Could not reach the API: ${err.message}`
          : "Could not load expenses.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addExpense = useCallback(async (input: NewExpense) => {
    const created = await api.createExpense(input);
    setExpenses((prev) => sortExpenses([created, ...prev]));
  }, []);

  const updateExpense = useCallback(async (id: string, input: NewExpense) => {
    const updated = await api.updateExpense(id, input);
    setExpenses((prev) => sortExpenses(prev.map((e) => (e.id === id ? updated : e))));
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    await api.deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refresh: load,
    clearError,
  };
}

function sortExpenses(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}
