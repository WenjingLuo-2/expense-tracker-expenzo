import { formatCurrency } from "@/lib/format";
import { getCategoryMeta } from "@/lib/categories";
import type { Category } from "@/lib/types";

interface SummaryCardsProps {
  total: number;
  thisMonth: number;
  avgPerDay: number;
  topCategory: { category: Category; total: number } | null;
  count: number;
}

export function SummaryCards({
  total,
  thisMonth,
  avgPerDay,
  topCategory,
  count,
}: SummaryCardsProps) {
  const topMeta = topCategory ? getCategoryMeta(topCategory.category) : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card
        label="Total spending"
        value={formatCurrency(total)}
        hint={`${count} ${count === 1 ? "expense" : "expenses"}`}
        icon="💰"
        accent="bg-brand-50 text-brand-600"
      />
      <Card
        label="This month"
        value={formatCurrency(thisMonth)}
        hint={new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        icon="📅"
        accent="bg-emerald-50 text-emerald-600"
      />
      <Card
        label="Avg / day (month)"
        value={formatCurrency(avgPerDay)}
        hint="Month-to-date pace"
        icon="📊"
        accent="bg-violet-50 text-violet-600"
      />
      <Card
        label="Top category"
        value={topCategory ? topCategory.category : "—"}
        hint={topCategory ? formatCurrency(topCategory.total) : "No data yet"}
        icon={topMeta?.icon ?? "🏷️"}
        accent="bg-amber-50 text-amber-600"
      />
    </div>
  );
}

function Card({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  icon: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${accent}`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 truncate text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}
