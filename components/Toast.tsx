"use client";

import { useEffect } from "react";

export type ToastKind = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  text: string;
}

const STYLES: Record<ToastKind, { bg: string; icon: string }> = {
  success: { bg: "bg-emerald-600", icon: "✓" },
  error: { bg: "bg-red-600", icon: "!" },
  info: { bg: "bg-brand-600", icon: "i" },
};

export function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastMessage | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 3200);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;
  const style = STYLES[toast.kind];

  return (
    <div className="fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div
        role="status"
        className="animate-fade-in flex items-center gap-3 rounded-full bg-white py-2 pl-2 pr-5 shadow-lg ring-1 ring-slate-200"
      >
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white ${style.bg}`}
        >
          {style.icon}
        </span>
        <span className="text-sm font-medium text-slate-800">{toast.text}</span>
      </div>
    </div>
  );
}
