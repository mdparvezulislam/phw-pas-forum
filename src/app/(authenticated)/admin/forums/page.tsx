import { asc } from "drizzle-orm";
import type { Metadata } from "next";
import { getDatabase, schema } from "@/db";
import { requireRole } from "@/modules/auth/guards";
import { ForumDeleteButton } from "@/modules/forum/components/forum-delete-button";
import { ForumForm } from "@/modules/forum/components/forum-form";
import { RoleName } from "@/types/rbac";

export const metadata: Metadata = {
  title: "Manage Forums",
};

export default async function AdminForumsPage() {
  await requireRole(RoleName.ADMIN);

  const db = getDatabase();
  const forums = await db.query.forums.findMany({
    orderBy: (forums, { asc }) => [asc(forums.position)],
    with: { category: true },
  });

  const categories = await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.position)],
  });

  return (
    <div className="space-y-8">
      <div className="rounded-lg border p-4">
        <h2 className="mb-4 font-semibold">Create Forum</h2>
        <ForumForm categories={categories} parentForums={forums} />
      </div>

      <div>
        <h2 className="mb-4 font-semibold">Existing Forums</h2>
        <div className="space-y-2">
          {forums.map((forum) => (
            <div
              key={forum.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{forum.icon ?? "💬"}</span>
                <div>
                  <div className="font-medium">{forum.title}</div>
                  <div className="text-sm text-muted-foreground">
                    /{(forum as any).category?.title ?? "Unknown"} &middot;
                    Position {forum.position}
                    {!forum.isVisible && " · Hidden"}
                    {forum.isLocked && " · Locked"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ForumForm
                  categories={categories}
                  parentForums={forums}
                  forum={forum}
                />
                <ForumDeleteButton id={forum.id} />
              </div>
            </div>
          ))}
          {forums.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No forums yet. Create a category first.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
