import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/db";
import { eq } from "drizzle-orm";
import { schema } from "@/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Account settings",
};

export default async function AccountSettingsPage() {
  const session = await auth();
  const db = getDatabase();

  const user = (await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, session!.user.id),
    with: { role: true },
  })) as any;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      <div className="rounded-lg border">
        <div className="p-4">
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{user?.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Username</dt>
              <dd>{user?.username}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="capitalize">
                {(user?.role?.name ?? "MEMBER").toLowerCase()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Member since</dt>
              <dd>{user?.createdAt ? formatDate(user.createdAt) : "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email verified</dt>
              <dd>{user?.emailVerified ? "Yes" : "No"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
