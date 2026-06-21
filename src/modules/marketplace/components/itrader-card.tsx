"use client";

import { useEffect, useState } from "react";

export function ITraderCard({ sellerId }: { sellerId: string }) {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { getDatabase, schema } = await import("@/db");
        const { eq, desc } = await import("drizzle-orm");
        const db = getDatabase();
        const items = await db.query.itraderFeedback.findMany({
          where: eq(schema.itraderFeedback.toUserId, sellerId),
          orderBy: [desc(schema.itraderFeedback.createdAt)],
          limit: 10,
          with: { fromUser: true },
        });
        setFeedback(items);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetch();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="h-20 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        iTrader Feedback
      </h3>
      {feedback.length === 0 ? (
        <p className="text-sm text-muted-foreground">No iTrader feedback yet</p>
      ) : (
        <div className="space-y-3">
          {feedback.map((item) => (
            <div key={item.id} className="rounded-lg bg-muted p-3">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`text-xs font-medium ${
                    item.rating === "POSITIVE"
                      ? "text-green-600"
                      : item.rating === "NEGATIVE"
                        ? "text-red-600"
                        : "text-yellow-600"
                  }`}
                >
                  {item.rating === "POSITIVE"
                    ? "+"
                    : item.rating === "NEGATIVE"
                      ? "-"
                      : "~"}{" "}
                  {item.rating}
                </span>
                <span className="text-xs text-muted-foreground">
                  by{" "}
                  {item.fromUser?.displayName ??
                    item.fromUser?.username ??
                    "Unknown"}
                </span>
              </div>
              <p className="text-sm">{item.comment}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
