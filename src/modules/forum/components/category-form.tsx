"use client";

import { useActionState } from "react";
import { Button, Input, Label } from "@/components/ui";
import type { Category } from "@/db/schema/categories";
import { createCategory, updateCategory } from "@/modules/forum/actions";

interface CategoryFormProps {
  category?: Category;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const action = category ? updateCategory : createCategory;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-3">
      {category && <input type="hidden" name="id" value={category.id} />}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={category?.title}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={category?.slug}
            placeholder="Leave empty to auto-generate"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          defaultValue={category?.description ?? ""}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="icon">Icon (emoji)</Label>
          <Input
            id="icon"
            name="icon"
            defaultValue={category?.icon ?? ""}
            placeholder="📁"
            maxLength={10}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="color">Color (hex)</Label>
          <Input
            id="color"
            name="color"
            defaultValue={category?.color ?? ""}
            placeholder="#ff0000"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            name="position"
            type="number"
            defaultValue={category?.position ?? 0}
            min={0}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isVisible"
            defaultChecked={category ? category.isVisible : true}
            className="h-4 w-4 accent-primary"
          />
          Visible
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isPremiumOnly"
            defaultChecked={category?.isPremiumOnly ?? false}
            className="h-4 w-4 accent-primary"
          />
          Premium only
        </label>
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      {state?.success && (
        <p className="text-sm text-green-600 dark:text-green-400">
          {category ? "Category updated" : "Category created"}
        </p>
      )}

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving..." : category ? "Update" : "Create"}
      </Button>
    </form>
  );
}
