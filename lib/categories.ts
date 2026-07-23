import type { Category } from "./types";

export interface CategoryMeta {
  name: Category;
  /** Emoji icon used across the UI */
  icon: string;
  /** Tailwind text color class */
  text: string;
  /** Tailwind background color class (soft badge) */
  bg: string;
  /** Solid hex used for charts */
  hex: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { name: "Food", icon: "🍔", text: "text-orange-700", bg: "bg-orange-100", hex: "#f97316" },
  { name: "Transportation", icon: "🚗", text: "text-sky-700", bg: "bg-sky-100", hex: "#0ea5e9" },
  { name: "Entertainment", icon: "🎬", text: "text-violet-700", bg: "bg-violet-100", hex: "#8b5cf6" },
  { name: "Shopping", icon: "🛍️", text: "text-pink-700", bg: "bg-pink-100", hex: "#ec4899" },
  { name: "Bills", icon: "🧾", text: "text-emerald-700", bg: "bg-emerald-100", hex: "#10b981" },
  { name: "Other", icon: "📦", text: "text-slate-700", bg: "bg-slate-100", hex: "#64748b" },
];

export const CATEGORY_NAMES: Category[] = CATEGORIES.map((c) => c.name);

const CATEGORY_MAP: Record<Category, CategoryMeta> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.name] = c;
    return acc;
  },
  {} as Record<Category, CategoryMeta>,
);

export function getCategoryMeta(name: Category): CategoryMeta {
  return CATEGORY_MAP[name] ?? CATEGORY_MAP.Other;
}
