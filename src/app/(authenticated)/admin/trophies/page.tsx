import type { Metadata } from "next";
import { Trophy, Plus, Star } from "lucide-react";
import { getDatabase, schema } from "@/db";
import { createTrophy } from "@/modules/reputation/actions";
import { PageHeader, SectionCard } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Manage Trophies",
};

export default async function AdminTrophiesPage() {
  const db = getDatabase();
  const allTrophies = await db.query.trophies.findMany({
    orderBy: (t, { asc }) => [asc(t.conditionType), asc(t.conditionValue)],
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Trophies"
        description="Manage trophy definitions and unlock conditions"
        icon={<Trophy className="h-5 w-5" />}
      />

      <SectionCard title="Create Trophy" icon={<Plus className="h-4 w-4" />}>
        <form
          action={
            createTrophy.bind(null, undefined) as unknown as (
              formData: FormData,
            ) => void
          }
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (emoji)</Label>
              <Input id="icon" name="icon" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              rows={2}
              maxLength={500}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="conditionType">Condition Type</Label>
              <select
                id="conditionType"
                name="conditionType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="POST_COUNT">Post Count</option>
                <option value="THREAD_COUNT">Thread Count</option>
                <option value="REACTION_COUNT">Reaction Count</option>
                <option value="REPUTATION_COUNT">Reputation Count</option>
                <option value="JOIN_DURATION_DAYS">Join Duration (Days)</option>
                <option value="HELPFUL_COUNT">Helpful Count</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="conditionValue">Condition Value</Label>
              <Input
                id="conditionValue"
                name="conditionValue"
                type="number"
                min="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reputationReward">Rep Reward</Label>
              <Input
                id="reputationReward"
                name="reputationReward"
                type="number"
                min="0"
                defaultValue="10"
              />
            </div>
          </div>
          <Button type="submit" size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Create Trophy
          </Button>
        </form>
      </SectionCard>

      <SectionCard
        title="Existing Trophies"
        icon={<Trophy className="h-4 w-4" />}
        actions={<Badge variant="secondary">{allTrophies.length}</Badge>}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {allTrophies.map((trophy) => (
            <div
              key={trophy.id}
              className="flex items-start gap-3 rounded-lg border bg-background p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xl">
                {trophy.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{trophy.title}</div>
                {trophy.description && (
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {trophy.description}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">
                    {trophy.conditionType.replace(/_/g, " ")} &ge;{" "}
                    {trophy.conditionValue}
                  </Badge>
                  {trophy.reputationReward > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-amber-600 dark:text-amber-400"
                    >
                      <Star className="mr-1 h-3 w-3" />+
                      {trophy.reputationReward} rep
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
