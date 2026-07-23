"use client";

import { useCallback, useState } from "react";
import type { ToastKind, ToastMessage } from "@/components/Toast";

export function useToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((text: string, kind: ToastKind = "success") => {
    setToast({ id: Date.now(), kind, text });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  return { toast, showToast, dismissToast };
}
