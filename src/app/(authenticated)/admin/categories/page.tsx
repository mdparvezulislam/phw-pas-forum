import { asc } from "drizzle-orm";
import type { Metadata } from "next";
import { PageHeader, SectionCard } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDatabase, schema } from "@/db";
import { CategoryDeleteButton } from "@/modules/forum/components/category-delete-button";
import { CategoryForm } from "@/modules/forum/components/category-form";
import { Eye, EyeOff, FolderTree, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Manage Categories",
};

export default async function AdminCategoriesPage() {
  const db = getDatabase();
  const categories = await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.position)],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize forums into category groups"
        icon={<FolderTree className="h-5 w-5" />}
        actions={
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Category
          </Button>
        }
      />

      <SectionCard title="Create Category" icon={<Plus className="h-4 w-4" />}>
        <CategoryForm />
      </SectionCard>

      <SectionCard
        title="Existing Categories"
        icon={<FolderTree className="h-4 w-4" />}
        actions={
          <Badge variant="secondary">
            {categories.length}{" "}
            {categories.length === 1 ? "category" : "categories"}
          </Badge>
        }
      >
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{cat.icon ?? "📁"}</span>
                <div>
                  <div className="font-medium">{cat.title}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-mono text-xs">/{cat.slug}</span>
                    <span>&middot;</span>
                    <span>Position {cat.position}</span>
                    <span>&middot;</span>
                    <span className="flex items-center gap-1">
                      {cat.isVisible ? (
                        <>
                          <Eye className="h-3 w-3" />
                          Visible
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" />
                          Hidden
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CategoryForm category={cat} />
                <CategoryDeleteButton id={cat.id} />
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No categories yet.
            </p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
