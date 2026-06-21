"use client";

import { useToastStore } from "@/stores/toast-store";

export function useToast() {
  const { addToast, removeToast, clearAll } = useToastStore();
  return {
    toast: addToast,
    dismiss: removeToast,
    clearAll,
  };
}
