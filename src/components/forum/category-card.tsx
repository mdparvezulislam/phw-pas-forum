import Link from "next/link";
import { MessageSquare, ChevronRight } from "lucide-react";

interface ForumData {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  threadCount: number;
  postCount: number;
  lastActivityAt?: Date | null;
}

interface CategoryCardProps {
  category: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    color?: string | null;
    forums: ForumData[];
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg hover:shadow-primary/5">
      {/* Category Header */}
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
          style={{
            backgroundColor: category.color
              ? `${category.color}18`
              : "hsl(var(--primary) / 0.1)",
          }}
        >
          {category.icon ?? "📁"}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/forums/${category.slug}`}
            className="group flex items-center gap-1.5 font-semibold hover:text-primary"
          >
            {category.title}
            <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
          {category.description && (
            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
              {category.description}
            </p>
          )}
        </div>
        <div className="hidden text-right text-xs text-muted-foreground sm:block">
          <p className="font-medium text-foreground">
            {category.forums.length} forum{category.forums.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Forums List */}
      <div className="divide-y">
        {category.forums.length > 0 ? (
          category.forums.map((forum) => (
            <Link
              key={forum.id}
              href={`/forums/${category.slug}/${forum.slug}`}
              className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-accent/50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm">
                {forum.icon ?? "💬"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium group-hover:text-primary">
                  {forum.title}
                </p>
                {forum.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {forum.description}
                  </p>
                )}
              </div>
              <div className="hidden shrink-0 text-right text-xs text-muted-foreground md:flex md:items-center md:gap-3">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {forum.threadCount.toLocaleString()}
                </span>
                <span className="w-16 text-right">
                  {forum.postCount.toLocaleString()} posts
                </span>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))
        ) : (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            No forums yet. Create the first one!
          </div>
        )}
      </div>
    </div>
  );
}
