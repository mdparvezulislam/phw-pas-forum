import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/db";
import { eq } from "drizzle-orm";
import { schema } from "@/db";
import { ProfileSettingsForm } from "@/modules/users/components/profile-settings-form";
import { AvatarUpload } from "@/modules/users/components/avatar-upload";

export const metadata: Metadata = {
  title: "Profile settings",
};

export default async function ProfileSettingsPage() {
  const session = await auth();
  const db = getDatabase();

  const profile = await db.query.profiles.findFirst({
    where: (profiles, { eq }) => eq(profiles.userId, session!.user.id),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your public profile
        </p>
      </div>

      <AvatarUpload
        currentAvatarUrl={profile?.avatarUrl ?? null}
      />

      <ProfileSettingsForm
        displayName={profile?.displayName ?? ""}
        biography={profile?.biography ?? ""}
        website={profile?.website ?? ""}
        location={profile?.location ?? ""}
        signature={profile?.signature ?? ""}
      />
    </div>
  );
}
