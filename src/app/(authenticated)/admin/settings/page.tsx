import type { Metadata } from "next";
import { adminSettingsService } from "@/services/admin-settings";

export const metadata: Metadata = {
  title: "System Settings",
};

export default async function AdminSettingsPage() {
  const settings = await adminSettingsService.getAllSettings();
  const featureFlags = await adminSettingsService.getFeatureFlags();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure platform settings and feature flags
        </p>
      </div>

      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">Platform Settings</h2>
        </div>
        {settings.length === 0 ? (
          <div className="flex min-h-[100px] items-center justify-center p-4">
            <p className="text-sm text-muted-foreground">
              No settings configured
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {settings.map((s: any) => (
              <div
                key={s.key}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{s.key}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.category ?? "General"}
                  </p>
                </div>
                <code className="rounded bg-muted px-2 py-1 text-xs">
                  {String(s.value)}
                </code>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">Feature Flags</h2>
        </div>
        {featureFlags.length === 0 ? (
          <div className="flex min-h-[100px] items-center justify-center p-4">
            <p className="text-sm text-muted-foreground">
              No feature flags configured
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {featureFlags.map((flag: any) => (
              <div
                key={flag.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      flag.enabled ? "bg-emerald-500" : "bg-muted-foreground"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {flag.name ?? flag.key}
                    </p>
                    {flag.description && (
                      <p className="text-xs text-muted-foreground">
                        {flag.description}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {flag.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
