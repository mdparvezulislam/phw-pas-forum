import type { Metadata } from "next";
import { adminSettingsService } from "@/services/admin-settings";
import SettingsView from "./settings-view";

export const metadata: Metadata = {
  title: "System Settings",
};

export default async function AdminSettingsPage() {
  const [settings, featureFlags] = await Promise.all([
    adminSettingsService.getAllSettings(),
    adminSettingsService.getFeatureFlags(),
  ]);

  return <SettingsView settings={settings} featureFlags={featureFlags} />;
}
