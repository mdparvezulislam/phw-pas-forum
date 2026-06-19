"use client";

import { useActionState } from "react";
import { Button, Input, Label } from "@/components/ui";
import type { Category } from "@/db/schema/categories";
import type { Forum } from "@/db/schema/forums";
import { createForum, updateForum } from "@/modules/forum/actions";

interface ForumFormProps {
  categories: Category[];
  parentForums: Forum[];
  forum?: Forum;
}

export function ForumForm({ categories, parentForums, forum }: ForumFormProps) {
  const action = forum ? updateForum : createForum;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-3">
      {forum && <input type="hidden" name="id" value={forum.id} />}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={forum?.title} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={forum?.slug}
            placeholder="Leave empty to auto-generate"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={forum?.categoryId}
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="parentForumId">Parent Forum (optional)</Label>
          <select
            id="parentForumId"
            name="parentForumId"
            defaultValue={forum?.parentForumId ?? ""}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="">None (top-level)</option>
            {parentForums
              .filter((f) => f.id !== forum?.id)
              .map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          defaultValue={forum?.description ?? ""}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="icon">Icon (emoji)</Label>
          <Input
            id="icon"
            name="icon"
            defaultValue={forum?.icon ?? ""}
            placeholder="💬"
            maxLength={10}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            name="position"
            type="number"
            defaultValue={forum?.position ?? 0}
            min={0}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isVisible"
            defaultChecked={forum ? forum.isVisible : true}
            className="h-4 w-4 accent-primary"
          />
          Visible
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isLocked"
            defaultChecked={forum?.isLocked ?? false}
            className="h-4 w-4 accent-primary"
          />
          Locked
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isPremiumOnly"
            defaultChecked={forum?.isPremiumOnly ?? false}
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
          {forum ? "Forum updated" : "Forum created"}
        </p>
      )}

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving..." : forum ? "Update" : "Create"}
      </Button>
    </form>
  );
}
