import {
  ShieldAlert,
  ShieldX,
  ShieldCheck,
  Info,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AlertSeverity = "low" | "medium" | "high" | "critical";

const severityMeta: Record<
  AlertSeverity,
  { icon: LucideIcon; label: string; classes: string; chip: string }
> = {
  low: {
    icon: ShieldCheck,
    label: "Low",
    classes: "border-info/30 bg-info/5",
    chip: "bg-info/10 text-info",
  },
  medium: {
    icon: Info,
    label: "Medium",
    classes: "border-warning/30 bg-warning/5",
    chip: "bg-warning/10 text-warning",
  },
  high: {
    icon: ShieldAlert,
    label: "High",
    classes: "border-danger/30 bg-danger/5",
    chip: "bg-danger/10 text-danger",
  },
  critical: {
    icon: ShieldX,
    label: "Critical",
    classes: "border-danger/50 bg-danger/10",
    chip: "bg-danger text-danger-foreground",
  },
};

export function SecurityAlert({
  severity,
  title,
  description,
  time,
  action,
  className,
}: {
  severity: AlertSeverity;
  title: string;
  description?: string;
  time?: string;
  action?: ReactNode;
  className?: string;
}) {
  const meta = severityMeta[severity];
  const Icon = meta.icon;
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3.5",
        meta.classes,
        className,
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          meta.chip,
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{title}</p>
          <span
            className={cn(
              "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase",
              meta.chip,
            )}
          >
            {meta.label}
          </span>
        </div>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
        {time && (
          <p className="mt-1 text-[11px] text-muted-foreground">{time}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
