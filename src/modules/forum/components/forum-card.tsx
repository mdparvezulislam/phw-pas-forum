import Link from "next/link";
import { formatDateRelative } from "@/lib/utils";
import type { ForumWithChildren } from "@/modules/forum/types";
import { SubForumList } from "./subforum-list";

interface ForumCardProps {
  forum: ForumWithChildren;
  categorySlug: string;
}

export function ForumCard({ forum, categorySlug }: ForumCardProps) {
  return (
    <div className="group rounded-lg border bg-card p-4 transition-colors hover:border-muted-foreground/25">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg text-primary">
          {forum.icon ?? "💬"}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/forums/${categorySlug}/${forum.slug}`}
            className="font-semibold hover:text-primary"
          >
            {forum.title}
          </Link>
          {forum.description && (
            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
              {forum.description}
            </p>
          )}
          {forum.children.length > 0 && (
            <SubForumList forums={forum.children} categorySlug={categorySlug} />
          )}
        </div>
        <div className="hidden shrink-0 text-right text-sm text-muted-foreground md:block">
          <div>{forum.threadCount} threads</div>
          <div>{forum.postCount} posts</div>
        </div>
        {forum.lastActivityAt && (
          <div className="hidden shrink-0 text-right text-sm text-muted-foreground lg:block">
            <div className="text-xs">
              {formatDateRelative(forum.lastActivityAt)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
