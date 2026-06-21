"use client";

import { AnimatePresence } from "framer-motion";
import { useToastStore } from "@/stores/toast-store";
import { ToastItem } from "./toast";

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-toast"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <ToastItem key={toast.id} toast={toast} index={index} />
        ))}
      </AnimatePresence>
    </div>
  );
}
