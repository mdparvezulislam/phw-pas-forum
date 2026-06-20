"use client";

import { useEffect, useState } from "react";
import { trustEngine } from "@/services/trust-engine";

export function TrustScoreCard({ sellerId }: { sellerId: string }) {
  const [trustProfile, setTrustProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { getDatabase, schema } = await import("@/db");
        const db = getDatabase();
        const profile = await db.query.sellerTrustProfiles.findFirst({
          where: (t: any, { eq }: any) => eq(t.sellerId, sellerId),
        });
        setTrustProfile(profile);
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

  const score = trustProfile?.trustScore ?? 0;
  const getLevel = (s: number) => {
    if (s >= 800) return { label: "Top Rated", color: "text-purple-600" };
    if (s >= 600) return { label: "Trusted", color: "text-blue-600" };
    if (s >= 400) return { label: "Established", color: "text-green-600" };
    if (s >= 200) return { label: "Rising", color: "text-yellow-600" };
    return { label: "New", color: "text-gray-600" };
  };

  const level = getLevel(score);

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">Seller Trust Score</h3>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold">{score}</span>
        <span className={`text-sm font-medium ${level.color}`}>{level.label}</span>
      </div>
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(100, (score / 1000) * 100)}%` }}
        />
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Positive</span>
          <span className="font-medium text-green-600">+{trustProfile?.positiveFeedback ?? 0}</span>
        </div>
        <div className="flex justify-between">
          <span>Neutral</span>
          <span className="font-medium text-yellow-600">{trustProfile?.neutralFeedback ?? 0}</span>
        </div>
        <div className="flex justify-between">
          <span>Negative</span>
          <span className="font-medium text-red-600">{trustProfile?.negativeFeedback ?? 0}</span>
        </div>
        <div className="flex justify-between">
          <span>Completed Orders</span>
          <span className="font-medium">{trustProfile?.completedOrders ?? 0}</span>
        </div>
        <div className="flex justify-between">
          <span>Disputes</span>
          <span className="font-medium">{trustProfile?.disputedOrders ?? 0}</span>
        </div>
      </div>
    </div>
  );
}
