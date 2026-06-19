import type { Metadata } from "next";
import { getDatabase, schema } from "@/db";
import { desc } from "drizzle-orm";
import { requireRole } from "@/modules/auth/guards";
import { RoleName } from "@/types/rbac";
import { ThreadStatusBadge } from "@/modules/thread/components";
import { AdminThreadRow } from "./thread-row";

export const metadata: Metadata = {
  title: "Manage Threads",
};

export default async function AdminThreadsPage() {
  await requireRole(RoleName.MODERATOR);

  const db = getDatabase();
  const threads = await db.query.threads.findMany({
    orderBy: (threads, { desc }) => [desc(threads.publishedAt)],
    limit: 100,
    with: {
      author: {
        columns: { id: true, username: true, displayName: true },
      },
      forum: {
        columns: { id: true, title: true, slug: true },
        with: {
          category: {
            columns: { slug: true },
          },
        },
      },
    },
  }) as any[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Threads</h1>
        <p className="text-sm text-muted-foreground">
          View and moderate all threads across the forum.
        </p>
      </div>

      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Thread</th>
                <th className="px-4 py-3 text-left font-medium">Author</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-center font-medium">Replies</th>
                <th className="px-4 py-3 text-center font-medium">Views</th>
                <th className="px-4 py-3 text-left font-medium">Forum</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {threads.map((thread: any) => (
                <AdminThreadRow key={thread.id} thread={thread} />
              ))}
              {threads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No threads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
