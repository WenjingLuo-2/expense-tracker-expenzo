"use client";

import type { CategoryTotal } from "@/lib/analytics";
import { getCategoryMeta } from "@/lib/categories";
import { formatCurrency } from "@/lib/format";

const RADIUS = 70;
const STROKE = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CategoryChart({
  data,
  total,
}: {
  data: CategoryTotal[];
  total: number;
}) {
  const segments = data.filter((d) => d.total > 0);

  if (segments.length === 0) {
    return (
      <EmptyChart label="No spending to break down yet." />
    );
  }

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
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative h-48 w-48 shrink-0">
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
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-medium text-slate-400">Total</span>
          <span className="text-xl font-bold text-slate-900">{formatCurrency(total)}</span>
        </div>
      </div>

      <ul className="w-full flex-1 space-y-2.5">
        {segments.map((seg) => {
          const meta = getCategoryMeta(seg.category);
          return (
            <li key={seg.category} className="flex items-center gap-3">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: meta.hex }}
                aria-hidden
              />
              <span className="flex-1 text-sm text-slate-600">
                {meta.icon} {seg.category}
              </span>
              <span className="text-sm font-semibold tabular-nums text-slate-900">
                {formatCurrency(seg.total)}
              </span>
              <span className="w-12 text-right text-xs tabular-nums text-slate-400">
                {seg.percentage.toFixed(0)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-48 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
      {label}
    </div>
  );
}
