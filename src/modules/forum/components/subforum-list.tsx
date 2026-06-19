import Link from "next/link";
import type { ForumWithChildren } from "@/modules/forum/types";

interface SubForumListProps {
  forums: ForumWithChildren[];
  categorySlug: string;
}

export function SubForumList({ forums, categorySlug }: SubForumListProps) {
  if (forums.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {forums.map((sub) => (
        <Link
          key={sub.id}
          href={`/forums/${categorySlug}/${sub.slug}`}
          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
        >
          {sub.icon ?? "▸"} {sub.title}
        </Link>
      ))}
    </div>
  );
}
