"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { AreaTrend, type ChartAccent } from "./chart-kit";
import { cn } from "@/lib/utils";

interface RevenueCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  accent?: ChartAccent;
  trend?: { value: number; positive: boolean };
  data: Array<Record<string, string | number>>;
  xKey: string;
  dataKey: string;
  valueFormatter?: (v: number | string) => string;
  className?: string;
}

/**
 * A headline metric paired with an area trend — used for revenue / growth
 * panels on the dashboard and analytics.
 */
export function RevenueCard({
  title,
  value,
  description,
  icon: Icon,
  accent = "success",
  trend,
  data,
  xKey,
  dataKey,
  valueFormatter,
  className,
}: RevenueCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border bg-card p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            {Icon && <Icon className="h-4 w-4" />}
            {title}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight tabular-nums">
              {value}
            </p>
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-semibold",
                  trend.positive ? "text-success" : "text-danger",
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
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex-1">
        <AreaTrend
          data={data}
          xKey={xKey}
          dataKey={dataKey}
          accent={accent}
          height={120}
          valueFormatter={valueFormatter}
        />
      </div>
    </div>
  );
}
