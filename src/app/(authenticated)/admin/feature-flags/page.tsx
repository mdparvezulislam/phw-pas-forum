import type { Metadata } from "next";
import { Flag, ToggleLeft, ToggleRight, BarChart3 } from "lucide-react";
import { PageHeader, KpiCard, SectionCard, FeatureFlagCard } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { adminSettingsService } from "@/services/admin-settings";

export const metadata: Metadata = {
  title: "Feature Flags",
  description: "Toggle features and manage gradual rollouts",
};

function categorizeFlag(key: string): string {
  const lower = key.toLowerCase();
  if (lower.includes("marketplace") || lower.includes("seller") || lower.includes("listing"))
    return "Marketplace";
  if (lower.includes("forum") || lower.includes("thread") || lower.includes("post"))
    return "Forums";
  if (lower.includes("auth") || lower.includes("security") || lower.includes("login"))
    return "Security";
  if (lower.includes("premium") || lower.includes("membership") || lower.includes("vip"))
    return "Memberships";
  if (lower.includes("search") || lower.includes("typesense"))
    return "Search";
  if (lower.includes("ai") || lower.includes("openai"))
    return "AI";
  if (lower.includes("mod") || lower.includes("admin"))
    return "Moderation";
  return "General";
}

export default async function AdminFeatureFlagsPage() {
  const flags = await adminSettingsService.getFeatureFlags();

  const totalFlags = flags.length;
  const enabledFlags = flags.filter((f) => f.enabled).length;
  const disabledFlags = totalFlags - enabledFlags;
  const inProgressFlags = flags.filter((f) => f.enabled && !f.isKillSwitch).length;

  const flagsByCategory = flags.reduce(
    (acc, flag) => {
      const category = categorizeFlag(flag.key);
      acc[category] = (acc[category] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const sortedCategories = Object.entries(flagsByCategory).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feature Flags"
        description="Toggle features and manage gradual rollouts"
        icon={<Flag className="h-5 w-5" />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Flags"
          value={totalFlags}
          icon={Flag}
          accent="info"
        />
        <KpiCard
          title="Enabled"
          value={enabledFlags}
          icon={ToggleRight}
          accent="success"
        />
        <KpiCard
          title="Disabled"
          value={disabledFlags}
          icon={ToggleLeft}
          accent="warning"
        />
        <KpiCard
          title="In Progress"
          value={inProgressFlags}
          icon={BarChart3}
          accent="primary"
          description="Active non-kill-switch flags"
        />
      </div>

      <SectionCard
        title="Feature Flags"
        description={`${totalFlags} flag${totalFlags !== 1 ? "s" : ""} configured`}
        icon={<Flag className="h-4 w-4" />}
      >
        {flags.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ToggleLeft className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              No feature flags yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Create feature flags to control feature rollouts across the
              platform.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {flags.map((flag) => (
              <FeatureFlagCard
                key={flag.key}
                flag={{
                  key: flag.key,
                  name: flag.name,
                  description: flag.description,
                  enabled: flag.enabled,
                }}
              />
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Flag Categories"
        description="Distribution of flags across modules"
        icon={<BarChart3 className="h-4 w-4" />}
      >
        {sortedCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              No categories to display
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Categories are derived from flag key prefixes.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedCategories.map(([category, count]) => (
              <div
                key={category}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <span className="text-sm font-medium">{category}</span>
                <Badge variant="secondary" size="sm">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
