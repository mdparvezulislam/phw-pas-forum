"use client";

import {
  CreditCard,
  MessageSquare,
  Plug,
  Settings,
  Shield,
  Store,
} from "lucide-react";
import {
  type FeatureFlag,
  FeatureFlagCard,
  PageHeader,
  SectionCard,
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Setting {
  key: string;
  value: unknown;
  category: string | null;
  description?: string | null;
}

type TabId =
  | "general"
  | "forums"
  | "marketplace"
  | "memberships"
  | "security"
  | "integrations";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "general", label: "General", icon: <Settings className="h-4 w-4" /> },
  {
    id: "forums",
    label: "Forums",
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: <Store className="h-4 w-4" />,
  },
  {
    id: "memberships",
    label: "Memberships",
    icon: <CreditCard className="h-4 w-4" />,
  },
  { id: "security", label: "Security", icon: <Shield className="h-4 w-4" /> },
  {
    id: "integrations",
    label: "Integrations",
    icon: <Plug className="h-4 w-4" />,
  },
];

const CATEGORY_MAP: Record<string, TabId> = {
  general: "general",
  appearance: "general",
  site: "general",
  branding: "general",
  forums: "forums",
  threads: "forums",
  posts: "forums",
  categories: "forums",
  marketplace: "marketplace",
  seller: "marketplace",
  listings: "marketplace",
  orders: "marketplace",
  memberships: "memberships",
  premium: "memberships",
  subscription: "memberships",
  plans: "memberships",
  security: "security",
  auth: "security",
  authentication: "security",
  sessions: "security",
  rate_limiting: "security",
  integrations: "integrations",
  api: "integrations",
  webhooks: "integrations",
  email: "integrations",
  storage: "integrations",
};

function groupSettingsByTab(settings: Setting[]): Record<TabId, Setting[]> {
  const grouped: Record<TabId, Setting[]> = {
    general: [],
    forums: [],
    marketplace: [],
    memberships: [],
    security: [],
    integrations: [],
  };

  for (const s of settings) {
    const cat = (s.category ?? "general").toLowerCase();
    const tab = CATEGORY_MAP[cat] ?? "general";
    grouped[tab].push(s);
  }

  return grouped;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function SettingsList({ settings }: { settings: Setting[] }) {
  if (settings.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No settings configured for this category.
      </p>
    );
  }

  return (
    <div className="divide-y">
      {settings.map((s) => (
        <div
          key={s.key}
          className="flex items-center justify-between gap-4 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium">{s.key}</p>
            {s.description && (
              <p className="text-xs text-muted-foreground">{s.description}</p>
            )}
          </div>
          <code className="shrink-0 rounded bg-muted px-2 py-1 font-mono text-xs">
            {formatValue(s.value)}
          </code>
        </div>
      ))}
    </div>
  );
}

export default function SettingsView({
  settings,
  featureFlags,
}: {
  settings: Setting[];
  featureFlags: FeatureFlag[];
}) {
  const grouped = groupSettingsByTab(settings);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Platform configuration, integrations, and system preferences"
        icon={<Settings className="h-5 w-5" />}
      />

      <Tabs defaultValue="general">
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              <span className="flex items-center gap-1.5">
                {t.icon}
                {t.label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {tab.id === "integrations" ? (
              <div className="space-y-4">
                {featureFlags.length > 0 ? (
                  <SectionCard
                    title="Feature Flags"
                    description="Toggle platform features and controlled rollouts"
                    icon={<Plug className="h-4 w-4" />}
                  >
                    <div className="space-y-3">
                      {featureFlags.map((flag) => (
                        <FeatureFlagCard key={flag.key} flag={flag} />
                      ))}
                    </div>
                  </SectionCard>
                ) : (
                  <SectionCard
                    title="Feature Flags"
                    description="No feature flags configured"
                    icon={<Plug className="h-4 w-4" />}
                  >
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No feature flags have been created yet.
                    </p>
                  </SectionCard>
                )}

                {grouped.integrations.length > 0 && (
                  <SectionCard
                    title="Integration Settings"
                    icon={<Plug className="h-4 w-4" />}
                  >
                    <SettingsList settings={grouped.integrations} />
                  </SectionCard>
                )}
              </div>
            ) : (
              <SectionCard title={`${tab.label} Settings`} icon={tab.icon}>
                <SettingsList settings={grouped[tab.id]} />
              </SectionCard>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
