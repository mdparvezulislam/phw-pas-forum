import Link from "next/link";
import type { CategoryWithForums } from "@/modules/forum/types";
import { ForumCard } from "./forum-card";

interface CategoryCardProps {
  category: CategoryWithForums;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center gap-3 border-b px-5 py-3.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-lg"
          style={{ backgroundColor: category.color ? `${category.color}1a` : undefined }}
        >
          {category.icon ?? "📁"}
        </div>
        <div>
          <Link
            href={`/forums/${category.slug}`}
            className="font-semibold hover:text-primary"
          >
            {category.title}
          </Link>
          {category.description && (
            <p className="text-xs text-muted-foreground">
              {category.description}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-1 p-3">
        {category.forums.length > 0 ? (
          category.forums.map((forum) => (
            <ForumCard
              key={forum.id}
              forum={forum}
              categorySlug={category.slug}
            />
          ))
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No forums in this category yet.
          </p>
        )}
      </div>
    </div>
  );
}
