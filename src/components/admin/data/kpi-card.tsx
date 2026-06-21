import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type KpiAccent =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "premium"
  | "marketplace"
  | "admin"
  | "moderator";

const accentRing: Record<KpiAccent, string> = {
  default: "text-muted-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
  premium: "text-premium",
  marketplace: "text-marketplace",
  admin: "text-admin",
  moderator: "text-moderator",
};

const accentBg: Record<KpiAccent, string> = {
  default: "bg-muted",
  primary: "bg-primary/10",
  success: "bg-success/10",
  warning: "bg-warning/10",
  danger: "bg-danger/10",
  info: "bg-info/10",
  premium: "bg-premium/10",
  marketplace: "bg-marketplace/10",
  admin: "bg-admin/10",
  moderator: "bg-moderator/10",
};

interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  /** Back-compatible with the old StatsCard trend shape. */
  trend?: { value: number; positive: boolean };
  /** Accent color for the icon chip + sparkline. */
  accent?: KpiAccent;
  /** A sparkline / mini-chart rendered at the bottom (client component). */
  sparkline?: ReactNode;
  /** Makes the whole card a link. */
  href?: string;
  className?: string;
}

export function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  accent = "default",
  sparkline,
  href,
  className,
}: KpiCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              accentBg[accent],
              accentRing[accent],
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold",
              trend.positive
                ? "bg-success/10 text-success"
                : "bg-danger/10 text-danger",
            )}
          >
            {trend.positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}

      {sparkline && <div className="mt-3 h-10">{sparkline}</div>}
    </>
  );

  const base = cn(
    "group block rounded-xl border bg-card p-5 shadow-sm transition-all",
    href && "hover:-translate-y-0.5 hover:shadow-md",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={base}>
        {body}
      </Link>
    );
  }
  return <div className={base}>{body}</div>;
}
