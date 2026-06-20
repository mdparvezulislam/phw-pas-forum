import type { Metadata } from "next";
import { getDatabase, schema } from "@/db";
import { createTrophy } from "@/modules/reputation/actions";

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
      <div className="rounded-lg border p-4">
        <h2 className="mb-4 font-semibold">Create Trophy</h2>
        <form action={createTrophy.bind(null, undefined) as unknown as (formData: FormData) => void} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium">
                Title
              </label>
              <input
                id="title"
                name="title"
                required
                className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
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
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="conditionType" className="mb-1 block text-sm font-medium">
                Condition Type
              </label>
              <select
                id="conditionType"
                name="conditionType"
                className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="POST_COUNT">Post Count</option>
                <option value="THREAD_COUNT">Thread Count</option>
                <option value="REACTION_COUNT">Reaction Count</option>
                <option value="REPUTATION_COUNT">Reputation Count</option>
                <option value="JOIN_DURATION_DAYS">Join Duration (Days)</option>
                <option value="HELPFUL_COUNT">Helpful Count</option>
              </select>
            </div>
            <div>
              <label htmlFor="conditionValue" className="mb-1 block text-sm font-medium">
                Condition Value
              </label>
              <input
                id="conditionValue"
                name="conditionValue"
                type="number"
                min="1"
                required
                className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="reputationReward" className="mb-1 block text-sm font-medium">
                Rep Reward
              </label>
              <input
                id="reputationReward"
                name="reputationReward"
                type="number"
                min="0"
                defaultValue="10"
                className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Create Trophy
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-4 font-semibold">Existing Trophies</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {allTrophies.map((trophy) => (
            <div key={trophy.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-xl">
                  {trophy.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{trophy.title}</div>
                  {trophy.description && (
                    <div className="text-xs text-muted-foreground">
                      {trophy.description}
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-muted px-1.5 py-0.5">
                      {trophy.conditionType.replace(/_/g, " ")} &ge;{" "}
                      {trophy.conditionValue}
                    </span>
                    {trophy.reputationReward > 0 && (
                      <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-amber-600 dark:text-amber-400">
                        +{trophy.reputationReward} rep
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
