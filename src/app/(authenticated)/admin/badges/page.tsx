import type { Metadata } from "next";
import { getDatabase, schema } from "@/db";
import { requireRole } from "@/modules/auth/guards";
import { RoleName } from "@/types/rbac";
import { createBadge } from "@/modules/reputation/actions";

export const metadata: Metadata = {
  title: "Manage Badges",
};

export default async function AdminBadgesPage() {
  await requireRole(RoleName.ADMIN);

  const db = getDatabase();
  const allBadges = await db.query.badges.findMany({
    orderBy: (b, { asc }) => [asc(b.category), asc(b.name)],
  });

  return (
    <div className="space-y-8">
      <div className="rounded-lg border p-4">
        <h2 className="mb-4 font-semibold">Create Badge</h2>
        <form action={createBadge.bind(null, undefined) as unknown as (formData: FormData) => void} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                name="name"
                required
                className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="slug" className="mb-1 block text-sm font-medium">
                Slug
              </label>
              <input
                id="slug"
                name="slug"
                required
                pattern="[a-z0-9-]+"
                className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="icon" className="mb-1 block text-sm font-medium">
                Icon (emoji)
              </label>
              <input
                id="icon"
                name="icon"
                required
                className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="color" className="mb-1 block text-sm font-medium">
                Color
              </label>
              <select
                id="color"
                name="color"
                className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="slate">Slate</option>
                <option value="blue">Blue</option>
                <option value="emerald">Emerald</option>
                <option value="amber">Amber</option>
                <option value="red">Red</option>
                <option value="purple">Purple</option>
                <option value="pink">Pink</option>
                <option value="cyan">Cyan</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              maxLength={500}
              className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-4">
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ACHIEVEMENT">Achievement</option>
                <option value="POSTING">Posting</option>
                <option value="COMMUNITY">Community</option>
                <option value="MARKETPLACE">Marketplace</option>
                <option value="PREMIUM">Premium</option>
                <option value="MODERATOR">Moderator</option>
                <option value="SPECIAL_EVENT">Special Event</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                id="isSystem"
                name="isSystem"
                type="checkbox"
                value="true"
                className="rounded border bg-background"
              />
              <label htmlFor="isSystem" className="text-sm">
                System badge (auto-awarded)
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Create Badge
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-4 font-semibold">Existing Badges</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allBadges.map((badge) => (
            <div key={badge.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xl">
                  {badge.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{badge.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {badge.slug}
                  </div>
                  {badge.description && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {badge.description}
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-muted px-1.5 py-0.5 capitalize">
                      {badge.category.toLowerCase()}
                    </span>
                    {badge.isSystem && (
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-primary">
                        System
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
