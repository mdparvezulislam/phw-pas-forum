import type { Metadata } from "next";
import { Award, Plus } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getDatabase, schema } from "@/db";
import { createBadge } from "@/modules/reputation/actions";

export const metadata: Metadata = {
  title: "Manage Badges",
};

const COLOR_OPTIONS = [
  { value: "slate", label: "Slate" },
  { value: "blue", label: "Blue" },
  { value: "emerald", label: "Emerald" },
  { value: "amber", label: "Amber" },
  { value: "red", label: "Red" },
  { value: "purple", label: "Purple" },
  { value: "pink", label: "Pink" },
  { value: "cyan", label: "Cyan" },
];

const CATEGORY_OPTIONS = [
  { value: "ACHIEVEMENT", label: "Achievement" },
  { value: "POSTING", label: "Posting" },
  { value: "COMMUNITY", label: "Community" },
  { value: "MARKETPLACE", label: "Marketplace" },
  { value: "PREMIUM", label: "Premium" },
  { value: "MODERATOR", label: "Moderator" },
  { value: "SPECIAL_EVENT", label: "Special Event" },
];

export default async function AdminBadgesPage() {
  const db = getDatabase();
  const allBadges = await db.query.badges.findMany({
    orderBy: (b, { asc }) => [asc(b.category), asc(b.name)],
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Badges"
        description="Create and manage badge definitions for community recognition"
        icon={<Award className="h-5 w-5" />}
      />

      <SectionCard
        title="Create Badge"
        icon={<Plus className="h-4 w-4" />}
      >
        <form
          action={
            createBadge.bind(null, undefined) as unknown as (
              formData: FormData,
            ) => void
          }
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" required pattern="[a-z0-9-]+" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="icon">Icon (emoji)</Label>
              <Input id="icon" name="icon" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="color">Color</Label>
              <Select id="color" name="color" options={COLOR_OPTIONS} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              rows={2}
              maxLength={500}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select id="category" name="category" options={CATEGORY_OPTIONS} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="isSystem"
                name="isSystem"
                type="checkbox"
                value="true"
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="isSystem" className="text-sm font-normal">
                System badge (auto-awarded)
              </Label>
            </div>
          </div>

          <Button type="submit">
            <Plus className="mr-2 h-4 w-4" />
            Create Badge
          </Button>
        </form>
      </SectionCard>

      <SectionCard
        title="Existing Badges"
        actions={<Badge variant="secondary">{allBadges.length}</Badge>}
      >
        {allBadges.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No badges created yet.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-xl">
                  {badge.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{badge.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {badge.slug}
                  </div>
                  {badge.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {badge.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary" size="sm">
                      {badge.category.replace("_", " ")}
                    </Badge>
                    {badge.isSystem && (
                      <Badge variant="info" size="sm">System</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
