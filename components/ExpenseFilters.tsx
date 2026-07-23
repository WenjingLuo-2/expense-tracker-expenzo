"use client";

import type { Category, ExpenseFilters as Filters } from "@/lib/types";
import { CATEGORY_NAMES } from "@/lib/categories";

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  resultCount: number;
  totalCount: number;
}

export function ExpenseFilters({ filters, onChange, resultCount, totalCount }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  const isFiltered =
    filters.search !== "" ||
    filters.category !== "All" ||
    filters.startDate !== "" ||
    filters.endDate !== "";

  const reset = () =>
    onChange({ search: "", category: "All", startDate: "", endDate: "" });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        {/* Search */}
        <div className="flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-slate-500">
            Search
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              id="search"
              type="text"
              placeholder="Search description…"
              value={filters.search}
              onChange={(e) => set("search", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        {/* Category */}
        <div className="md:w-44">
          <label htmlFor="category" className="mb-1 block text-xs font-medium text-slate-500">
            Category
          </label>
          <select
            id="category"
            value={filters.category}
            onChange={(e) => set("category", e.target.value as Category | "All")}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            <option value="All">All categories</option>
            {CATEGORY_NAMES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="md:w-40">
          <label htmlFor="startDate" className="mb-1 block text-xs font-medium text-slate-500">
            From
          </label>
          <input
            id="startDate"
            type="date"
            value={filters.startDate}
            max={filters.endDate || undefined}
            onChange={(e) => set("startDate", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="md:w-40">
          <label htmlFor="endDate" className="mb-1 block text-xs font-medium text-slate-500">
            To
          </label>
          <input
            id="endDate"
            type="date"
            value={filters.endDate}
            min={filters.startDate || undefined}
            onChange={(e) => set("endDate", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{resultCount}</span> of{" "}
          {totalCount} expenses
        </p>
        {isFiltered && (
          <button
            type="button"
            onClick={reset}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
