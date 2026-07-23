"use client";

import type { MonthlyTotal } from "@/lib/analytics";
import { formatCurrency, formatCurrencyCompact, formatMonthLabel } from "@/lib/format";

export function MonthlyChart({ data }: { data: MonthlyTotal[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  const hasData = data.some((d) => d.total > 0);

  if (!hasData) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
        No spending recorded in this period yet.
      </div>
    );
  }

  return (
    <div className="flex h-56 items-end justify-between gap-2 sm:gap-4">
      {data.map((d) => {
        const heightPct = (d.total / max) * 100;
        return (
          <div key={d.month} className="group flex flex-1 flex-col items-center gap-2">
            <div className="relative flex w-full flex-1 items-end justify-center">
              {/* Tooltip */}
              <span className="pointer-events-none absolute -top-1 z-10 -translate-y-full whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                {formatCurrency(d.total)}
              </span>
              <div
                className="w-full max-w-[48px] rounded-t-lg bg-gradient-to-t from-brand-400 to-brand-500 transition-all duration-500 group-hover:from-brand-500 group-hover:to-brand-600"
                style={{ height: `${Math.max(heightPct, d.total > 0 ? 4 : 0)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-500">
              {formatMonthLabel(d.month).split(" ")[0]}
            </span>
            <span className="text-[10px] tabular-nums text-slate-400">
              {d.total > 0 ? formatCurrencyCompact(d.total) : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
