import type { Category } from "@/lib/types";
import { getCategoryMeta } from "@/lib/categories";

export function CategoryBadge({ category }: { category: Category }) {
  const meta = getCategoryMeta(category);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.bg} ${meta.text}`}
    >
      <span aria-hidden>{meta.icon}</span>
      {meta.name}
    </span>
  );
}
