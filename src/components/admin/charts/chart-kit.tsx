"use client";

import { useId, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

/** Accent → resolved CSS color token (theme-aware via CSS vars). */
export type ChartAccent =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "premium"
  | "marketplace"
  | "admin"
  | "moderator";

export function accentColor(accent: ChartAccent): string {
  return `var(--color-${accent})`;
}

const axisProps = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

/* ── Tooltip ── */
interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  valueFormatter?: (v: number | string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-lg">
      {label != null && (
        <p className="mb-1 font-medium text-foreground">{label}</p>
      )}
      <div className="space-y-0.5">
        {payload.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: item.color }}
            />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="ml-auto font-semibold tabular-nums text-foreground">
              {valueFormatter && item.value != null
                ? valueFormatter(item.value)
                : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Container ── */
export function ChartContainer({
  height = 240,
  children,
  className,
}: {
  height?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

interface SeriesPoint {
  [key: string]: string | number;
}

interface TrendProps {
  data: SeriesPoint[];
  xKey: string;
  dataKey: string;
  accent?: ChartAccent;
  height?: number;
  name?: string;
  valueFormatter?: (v: number | string) => string;
  className?: string;
}

/* ── Area trend ── */
export function AreaTrend({
  data,
  xKey,
  dataKey,
  accent = "primary",
  height = 240,
  name,
  valueFormatter,
  className,
}: TrendProps) {
  const gid = useId().replace(/:/g, "");
  const color = accentColor(accent);
  return (
    <ChartContainer height={height} className={className}>
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
        <defs>
          <linearGradient id={`area-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="var(--color-border)"
          strokeDasharray="3 3"
        />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...axisProps} width={40} />
        <Tooltip
          cursor={{ stroke: "var(--color-border-strong)" }}
          content={<ChartTooltip valueFormatter={valueFormatter} />}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          name={name ?? dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#area-${gid})`}
          animationDuration={500}
        />
      </AreaChart>
    </ChartContainer>
  );
}

/* ── Line trend ── */
export function LineTrend({
  data,
  xKey,
  dataKey,
  accent = "primary",
  height = 240,
  name,
  valueFormatter,
  className,
}: TrendProps) {
  const color = accentColor(accent);
  return (
    <ChartContainer height={height} className={className}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
        <CartesianGrid
          vertical={false}
          stroke="var(--color-border)"
          strokeDasharray="3 3"
        />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...axisProps} width={40} />
        <Tooltip
          cursor={{ stroke: "var(--color-border-strong)" }}
          content={<ChartTooltip valueFormatter={valueFormatter} />}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          name={name ?? dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
          animationDuration={500}
        />
      </LineChart>
    </ChartContainer>
  );
}

/* ── Bar series ── */
export function BarSeries({
  data,
  xKey,
  dataKey,
  accent = "primary",
  height = 240,
  name,
  valueFormatter,
  className,
}: TrendProps) {
  const color = accentColor(accent);
  return (
    <ChartContainer height={height} className={className}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid
          vertical={false}
          stroke="var(--color-border)"
          strokeDasharray="3 3"
        />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...axisProps} width={40} />
        <Tooltip
          cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
          content={<ChartTooltip valueFormatter={valueFormatter} />}
        />
        <Bar
          dataKey={dataKey}
          name={name ?? dataKey}
          fill={color}
          radius={[4, 4, 0, 0]}
          animationDuration={500}
        />
      </BarChart>
    </ChartContainer>
  );
}

/* ── Donut ── */
export interface DonutDatum {
  name: string;
  value: number;
  accent?: ChartAccent;
}

const DONUT_ACCENTS: ChartAccent[] = [
  "primary",
  "marketplace",
  "success",
  "warning",
  "info",
  "premium",
  "danger",
  "moderator",
];

export function Donut({
  data,
  height = 240,
  valueFormatter,
  className,
}: {
  data: DonutDatum[];
  height?: number;
  valueFormatter?: (v: number | string) => string;
  className?: string;
}) {
  return (
    <ChartContainer height={height} className={className}>
      <PieChart>
        <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="58%"
          outerRadius="82%"
          paddingAngle={2}
          stroke="var(--color-card)"
          strokeWidth={2}
          animationDuration={500}
        >
          {data.map((d, i) => (
            <Cell
              key={d.name}
              fill={accentColor(
                d.accent ?? DONUT_ACCENTS[i % DONUT_ACCENTS.length],
              )}
            />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

/* ── Sparkline (for KPI cards) ── */
export function Sparkline({
  data,
  accent = "primary",
  height = 40,
}: {
  data: number[];
  accent?: ChartAccent;
  height?: number;
}) {
  const gid = useId().replace(/:/g, "");
  const color = accentColor(accent);
  const points = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={points}
        margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={`spark-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${gid})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
