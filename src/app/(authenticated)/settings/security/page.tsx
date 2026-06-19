import type { Metadata } from "next";
import { ChangePasswordForm } from "@/modules/users/components/change-password-form";

export const metadata: Metadata = {
  title: "Security settings",
};

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Security</h1>
        <p className="text-sm text-muted-foreground">
          Manage your password and security settings
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="mb-4 font-semibold">Change password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
