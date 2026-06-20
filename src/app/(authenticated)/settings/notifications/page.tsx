import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { notificationService } from "@/services/notification";
import { NotificationPreferencesForm } from "./preferences-form";

export default async function NotificationSettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const preferences = await notificationService.getPreferences(session.user.id);

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage how you receive notifications
        </p>
      </div>

      <NotificationPreferencesForm preferences={preferences} />
    </div>
  );
}
