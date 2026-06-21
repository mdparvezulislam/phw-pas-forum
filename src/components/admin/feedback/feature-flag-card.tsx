"use client";

import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface FeatureFlag {
  key: string;
  name: string;
  description?: string | null;
  enabled: boolean;
  environment?: string | null;
  rolloutPercentage?: number | null;
}

/**
 * Display/admin card for a feature flag. When `onToggle` is omitted the switch
 * is read-only (no backend mutation is introduced in this phase).
 */
export function FeatureFlagCard({
  flag,
  onToggle,
  className,
}: {
  flag: FeatureFlag;
  onToggle?: (enabled: boolean) => void;
  className?: string;
}) {
  const rollout = flag.rolloutPercentage ?? (flag.enabled ? 100 : 0);
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm transition-colors",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold">{flag.name}</p>
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {flag.key}
            </code>
          </div>
          {flag.description && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {flag.description}
            </p>
          )}
        </div>
        <Switch
          checked={flag.enabled}
          onCheckedChange={onToggle}
          disabled={!onToggle}
          aria-label={`${flag.name} ${flag.enabled ? "enabled" : "disabled"}`}
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Badge variant={flag.enabled ? "success" : "secondary"} size="sm">
          {flag.enabled ? "Enabled" : "Disabled"}
        </Badge>
        {flag.environment && (
          <Badge variant="outline" size="sm">
            {flag.environment}
          </Badge>
        )}
        <div className="ml-auto flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, Math.max(0, rollout))}%` }}
            />
          </div>
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {rollout}%
          </span>
        </div>
      </div>
    </div>
  );
}
