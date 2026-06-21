"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { slideInBottom } from "@/lib/motion";
import type { Toast as ToastType, ToastVariant } from "@/stores/toast-store";
import { useToastStore } from "@/stores/toast-store";

const variantConfig: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; borderClass: string; iconClass: string }
> = {
  default: {
    icon: Info,
    borderClass: "border-border",
    iconClass: "text-foreground",
  },
  success: {
    icon: CheckCircle2,
    borderClass: "border-success",
    iconClass: "text-success",
  },
  error: {
    icon: XCircle,
    borderClass: "border-danger",
    iconClass: "text-danger",
  },
  warning: {
    icon: AlertTriangle,
    borderClass: "border-warning",
    iconClass: "text-warning",
  },
  info: {
    icon: Info,
    borderClass: "border-info",
    iconClass: "text-info",
  },
};

interface ToastItemProps {
  toast: ToastType;
  index: number;
}

export function ToastItem({ toast, index }: ToastItemProps) {
  const removeToast = useToastStore((s) => s.removeToast);
  const config = variantConfig[toast.variant];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      variants={slideInBottom}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ bottom: `${index * 4 + 1}rem` }}
      className={cn(
        "pointer-events-auto fixed left-1/2 w-full max-w-sm -translate-x-1/2",
        "z-toast rounded-lg border-l-4 bg-card p-4 shadow-lg",
        "flex items-start gap-3",
        config.borderClass,
      )}
      role="alert"
      aria-live="assertive"
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.iconClass)} />

      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-card-foreground">
            {toast.title}
          </p>
        )}
        {toast.description && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action!.onClick();
              removeToast(toast.id);
            }}
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
