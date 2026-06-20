import { requireRole } from "@/modules/auth/guards";
import { RoleName } from "@/types/rbac";
import { getDatabase, schema } from "@/db";
import { desc } from "drizzle-orm";
import { MarketplaceQueue } from "@/modules/marketplace/components/marketplace-queue";

export const dynamic = "force-dynamic";

export default async function MarketplaceQueuePage() {
  await requireRole(RoleName.MODERATOR);

  const db = getDatabase();
  const submissions = await db.query.marketplaceSubmissions.findMany({
    orderBy: [desc(schema.marketplaceSubmissions.submittedAt)],
    with: {
      thread: {
        with: {
          author: true,
        },
      },
      reviews: {
        orderBy: [desc(schema.marketplaceReviews.reviewedAt)],
      },
    } as any,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Marketplace Submission Queue</h2>
        <p className="text-sm text-muted-foreground">
          Approve or reject marketplace sales threads after reviewing their automated risk scoring.
        </p>
      </div>

      <MarketplaceQueue submissions={submissions} />
    </div>
  );
}
