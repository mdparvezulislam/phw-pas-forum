import type { Metadata } from "next";
import { getDatabase } from "@/db";
import { PageHeader, SectionCard } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessagesSquare, Plus, Eye, EyeOff, Lock } from "lucide-react";
import { ForumDeleteButton } from "@/modules/forum/components/forum-delete-button";
import { ForumForm } from "@/modules/forum/components/forum-form";

export const metadata: Metadata = {
  title: "Manage Forums",
};

export default async function AdminForumsPage() {
  const db = getDatabase();
  const forums = await db.query.forums.findMany({
    orderBy: (forums, { asc }) => [asc(forums.position)],
    with: { category: true },
  });

  const categories = await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.position)],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forums"
        description="Manage forums and subforums"
        icon={<MessagesSquare className="h-5 w-5" />}
        actions={
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Forum
          </Button>
        }
      />

      <SectionCard title="Create Forum" icon={<Plus className="h-4 w-4" />}>
        <ForumForm categories={categories} parentForums={forums} />
      </SectionCard>

      <SectionCard
        title="Existing Forums"
        description={
          <Badge variant="secondary" className="ml-1.5 text-xs">
            {forums.length}
          </Badge>
        }
      >
        <div className="space-y-2">
          {forums.map((forum) => (
            <div
              key={forum.id}
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{forum.icon ?? "💬"}</span>
                <div>
                  <div className="font-medium">{forum.title}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{(forum as any).category?.title ?? "Unknown"}</span>
                    <span>&middot;</span>
                    <span>Position {forum.position}</span>
                    {!forum.isVisible && (
                      <>
                        <span>&middot;</span>
                        <EyeOff className="h-3.5 w-3.5" />
                      </>
                    )}
                    {forum.isLocked && (
                      <>
                        <span>&middot;</span>
                        <Lock className="h-3.5 w-3.5" />
                      </>
                    )}
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
      </SectionCard>
    </div>
  );
}
