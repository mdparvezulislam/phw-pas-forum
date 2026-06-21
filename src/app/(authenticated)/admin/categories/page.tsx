import { asc } from "drizzle-orm";
import type { Metadata } from "next";
import { getDatabase, schema } from "@/db";
import { CategoryDeleteButton } from "@/modules/forum/components/category-delete-button";
import { CategoryForm } from "@/modules/forum/components/category-form";

export const metadata: Metadata = {
  title: "Manage Categories",
};

export default async function AdminCategoriesPage() {
  const db = getDatabase();
  const categories = await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.position)],
  });

  return (
    <div className="space-y-8">
      <div className="rounded-lg border p-4">
        <h2 className="mb-4 font-semibold">Create Category</h2>
        <CategoryForm />
      </div>

      <div>
        <h2 className="mb-4 font-semibold">Existing Categories</h2>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{cat.icon ?? "📁"}</span>
                <div>
                  <div className="font-medium">{cat.title}</div>
                  <div className="text-sm text-muted-foreground">
                    /{cat.slug} &middot; Position {cat.position}
                    {!cat.isVisible && " · Hidden"}
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
      </div>
    </div>
  );
}
