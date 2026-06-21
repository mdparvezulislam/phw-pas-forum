"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Loader2,
  MessageSquare,
  RefreshCw,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { haptics } from "@/components/mobile/haptics-vibrator";
import { cn } from "@/lib/utils";
import { getRecommendationFeedAction } from "../actions";

export function AIRecommendationFeed() {
  const [activeTab, setActiveTab] = useState<"threads" | "listings">("threads");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    const res = await getRecommendationFeedAction();
    setLoading(false);
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setError(res.error || "Failed to load recommendations.");
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleTabChange = (tab: "threads" | "listings") => {
    haptics.tap();
    setActiveTab(tab);
  };

  const handleRefresh = () => {
    haptics.tap();
    fetchRecommendations();
  };

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card/65 backdrop-blur-md p-8 flex flex-col items-center justify-center min-h-[220px] text-muted-foreground text-xs font-semibold gap-2.5">
        <Loader2 className="h-5 w-5 animate-spin text-premium" />
        Curating personalized recommendation feeds...
      </div>
    );
  }

  const threads = data?.recommendedThreads || [];
  const listings = data?.recommendedListings || [];

  return (
    <div className="rounded-2xl border bg-card/60 backdrop-blur-xl p-5 shadow-xl relative overflow-hidden before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-br before:from-premium/15 before:to-transparent before:pointer-events-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-premium/10 text-premium">
            <Sparkles className="h-5 w-5 animate-pulse-glow" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
              For You{" "}
              <span className="text-[10px] bg-premium/10 text-premium px-1.5 py-0.5 rounded-full font-semibold">
                AI Match
              </span>
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Custom feed parsed from interests and database trends
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="p-1.5 rounded-lg border hover:bg-accent text-muted-foreground transition-colors"
          aria-label="Refresh feed"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-muted/30 pb-3 mb-4 gap-1 text-xs">
        <button
          onClick={() => handleTabChange("threads")}
          className={cn(
            "px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all outline-none",
            activeTab === "threads"
              ? "bg-premium/10 text-premium font-bold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" /> Discussions (
          {threads.length})
        </button>
        <button
          onClick={() => handleTabChange("listings")}
          className={cn(
            "px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all outline-none",
            activeTab === "listings"
              ? "bg-premium/10 text-premium font-bold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <ShoppingBag className="h-3.5 w-3.5" /> Marketplace ({listings.length}
          )
        </button>
      </div>

      {error && <p className="text-xs text-danger text-center py-4">{error}</p>}

      {/* Feed Contents */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="space-y-3"
        >
          {activeTab === "threads" && (
            <div className="space-y-2.5">
              {threads.length > 0 ? (
                threads.map((thread: any) => (
                  <Link
                    key={thread.id}
                    href={`/forums/seo/discussions/${thread.slug}`}
                    className="block group rounded-xl border bg-background/40 hover:bg-premium/5 p-3 hover:border-premium/25 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <span className="text-xs font-bold text-foreground group-hover:text-premium transition-colors block truncate leading-snug">
                          {thread.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>
                            By{" "}
                            {thread.author?.displayName ||
                              thread.author?.username ||
                              "Member"}
                          </span>
                          <span>&middot;</span>
                          <span>Views: {thread.viewCount}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform mt-0.5" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No personalized threads recommended yet. Engage in more
                  discussions to build profile weight!
                </div>
              )}
            </div>
          )}

          {activeTab === "listings" && (
            <div className="space-y-2.5">
              {listings.length > 0 ? (
                listings.map((listing: any) => (
                  <Link
                    key={listing.id}
                    href={`/marketplace/${listing.slug}`}
                    className="block group rounded-xl border bg-background/40 hover:bg-premium/5 p-3 hover:border-premium/25 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <span className="text-xs font-bold text-foreground group-hover:text-premium transition-colors block truncate leading-snug">
                          {listing.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            ${(listing.basePrice / 100).toFixed(2)}
                          </span>
                          <span>&middot;</span>
                          <span>
                            Seller:{" "}
                            {listing.seller?.displayName || "Verified Vendor"}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform mt-0.5" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No customized service listings available right now.
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
