import { count, desc, eq } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import { requireRole } from "@/modules/auth/guards";
import { SellerVerificationCard } from "@/modules/marketplace/components/seller-verification-card";
import { RoleName } from "@/types/rbac";

export const dynamic = "force-dynamic";

export default async function ModeratorMarketplaceDashboard() {
  await requireRole(RoleName.MODERATOR);

  const db = getDatabase();

  // Query verification applications
  const verifications = await db.query.sellerVerifications.findMany({
    orderBy: [desc(schema.sellerVerifications.createdAt)],
    with: {
      seller: true,
    } as any,
  });

  // Calculate statistics
  const pendingListingsCount = await db
    .select({ val: count() })
    .from(schema.marketplaceSubmissions)
    .where(eq(schema.marketplaceSubmissions.status, "PENDING"))
    .then((r) => r[0]?.val ?? 0);

  const activeSellersCount = await db
    .select({ val: count() })
    .from(schema.sellerVerifications)
    .where(eq(schema.sellerVerifications.status, "VERIFIED"))
    .then((r) => r[0]?.val ?? 0);

  const activeReportsCount = await db
    .select({ val: count() })
    .from(schema.marketplaceFlags)
    .where(eq(schema.marketplaceFlags.status, "PENDING"))
    .then((r) => r[0]?.val ?? 0);

  // Group applications by status
  const pendingVerifications = verifications.filter(
    (v) => v.status === "PENDING",
  );
  const processedVerifications = verifications.filter(
    (v) => v.status !== "PENDING",
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold">Marketplace Seller Verifications</h2>
        <p className="text-sm text-muted-foreground">
          Manage vendor verification levels, review applicant documents, and
          track active marketplace metrics.
        </p>
      </div>

      {/* Stats Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-2xl p-5 bg-card/20 backdrop-blur shadow-sm flex flex-col justify-between hover:shadow transition-all">
          <span className="text-xs text-muted-foreground font-semibold uppercase">
            Pending Listings
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold tracking-tight text-indigo-400">
              {pendingListingsCount}
            </span>
            <span className="text-xs text-muted-foreground">
              threads awaiting bot & manual review
            </span>
          </div>
        </div>

        <div className="border rounded-2xl p-5 bg-card/20 backdrop-blur shadow-sm flex flex-col justify-between hover:shadow transition-all">
          <span className="text-xs text-muted-foreground font-semibold uppercase">
            Verified Sellers
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold tracking-tight text-emerald-400">
              {activeSellersCount}
            </span>
            <span className="text-xs text-muted-foreground">
              vendors active in marketplace
            </span>
          </div>
        </div>

        <div className="border rounded-2xl p-5 bg-card/20 backdrop-blur shadow-sm flex flex-col justify-between hover:shadow transition-all">
          <span className="text-xs text-muted-foreground font-semibold uppercase">
            Active Flags
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold tracking-tight text-rose-400">
              {activeReportsCount}
            </span>
            <span className="text-xs text-muted-foreground">
              unresolved flag alerts
            </span>
          </div>
        </div>
      </div>

      {/* Pending Applications Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold flex items-center gap-2">
          <span>Pending Verification Applications</span>
          <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full font-medium font-mono">
            {pendingVerifications.length}
          </span>
        </h3>

        {pendingVerifications.length === 0 ? (
          <div className="text-center py-10 border border-dashed rounded-2xl bg-secondary/5">
            <p className="text-sm text-muted-foreground font-medium font-sans">
              No pending verification applications.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {pendingVerifications.map((v) => (
              <SellerVerificationCard key={v.id} verification={v as any} />
            ))}
          </div>
        )}
      </div>

      {/* Past/Processed Applications Section */}
      <div className="space-y-4 pt-4 border-t border-muted/20">
        <h3 className="text-base font-bold text-muted-foreground">
          Processed Verification Logs
        </h3>
        {processedVerifications.length === 0 ? (
          <p className="text-xs text-muted-foreground font-sans">
            No verification actions logged yet.
          </p>
        ) : (
          <div className="border rounded-2xl overflow-hidden bg-card/20">
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-secondary/40 border-b border-muted/20 text-muted-foreground font-semibold">
                    <th className="p-3">Seller Name</th>
                    <th className="p-3">Level</th>
                    <th className="p-3">Result</th>
                    <th className="p-3">Notes</th>
                    <th className="p-3">Reviewed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/10">
                  {processedVerifications.map((v: any) => (
                    <tr key={v.id} className="hover:bg-secondary/10">
                      <td className="p-3 font-semibold">
                        {v.seller?.displayName ??
                          v.seller?.username ??
                          "Unknown"}
                      </td>
                      <td className="p-3 font-mono">{v.verificationLevel}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded font-medium ${
                            v.status === "VERIFIED" ||
                            v.status === "TRUSTED" ||
                            v.status === "TOP_SELLER"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground italic max-w-xs truncate">
                        {v.notes}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {v.verifiedAt
                          ? new Date(v.verifiedAt).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
