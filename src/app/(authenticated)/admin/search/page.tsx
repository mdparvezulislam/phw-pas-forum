"use client";

import React, { useState } from "react";
import { adminTriggerReindexAction } from "@/modules/search/actions/search";
import type { SearchIndexEntityType } from "@/db/schema/search-index-jobs";

const COLLECTIONS_LIST: Array<{ label: string; value: SearchIndexEntityType; desc: string }> = [
  { label: "Forums", value: "FORUM", desc: "Index forum categories, descriptions, titles" },
  { label: "Threads", value: "THREAD", desc: "Index thread titles, slugs, bodies, tags, categories, forums" },
  { label: "Replies/Posts", value: "POST", desc: "Index forum reply posts and quote context" },
  { label: "Members/Users", value: "USER", desc: "Index username, displayName, levels, badge counts" },
  { label: "Badges", value: "BADGE", desc: "Index badge names, descriptions" },
  { label: "Trophies", value: "TROPHY", desc: "Index trophies and unlock requirements" },
  { label: "Conversations", value: "CONVERSATION_MESSAGE", desc: "Index participant isolated DM messages" },
];

export default function AdminSearchPage() {
  const [statuses, setStatuses] = useState<Record<string, { loading: boolean; error?: string; success?: boolean; message?: string }>>({});
  const [globalStatus, setGlobalStatus] = useState<string | null>(null);

  const handleReindex = async (entityType: SearchIndexEntityType) => {
    setStatuses((prev) => ({
      ...prev,
      [entityType]: { loading: true },
    }));

    try {
      const res = await adminTriggerReindexAction(entityType);
      if (res.success) {
        setStatuses((prev) => ({
          ...prev,
          [entityType]: { loading: false, success: true, message: res.message },
        }));
      } else {
        setStatuses((prev) => ({
          ...prev,
          [entityType]: { loading: false, error: res.error },
        }));
      }
    } catch (err: any) {
      setStatuses((prev) => ({
        ...prev,
        [entityType]: { loading: false, error: err.message || "Failed to trigger reindexing" },
      }));
    }
  };

  const handleReindexAll = async () => {
    setGlobalStatus("Reindexing all collections sequentially. This runs in the background...");
    for (const item of COLLECTIONS_LIST) {
      await handleReindex(item.value);
    }
    setGlobalStatus("Triggered bulk reindexing background sync for all collections.");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Typesense Search Settings</h2>
          <p className="text-sm text-muted-foreground">Manage and rebuild Typesense search indices.</p>
        </div>
        <button
          onClick={handleReindexAll}
          type="button"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors cursor-pointer"
        >
          Reindex All Collections
        </button>
      </div>

      {globalStatus && (
        <div className="p-4 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 text-sm font-medium">
          ℹ️ {globalStatus}
        </div>
      )}

      {/* Collections Grid */}
      <div className="space-y-4">
        {COLLECTIONS_LIST.map((item) => {
          const state = statuses[item.value] || { loading: false };
          return (
            <div
              key={item.value}
              className="p-5 border rounded-xl bg-card/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">{item.label}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
                {state.success && (
                  <p className="text-xs text-emerald-500 font-medium">✅ {state.message || "Bulk sync started!"}</p>
                )}
                {state.error && (
                  <p className="text-xs text-destructive font-medium">❌ Error: {state.error}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {state.loading && (
                  <span className="text-xs text-muted-foreground animate-pulse font-medium">
                    Syncing...
                  </span>
                )}
                <button
                  onClick={() => handleReindex(item.value)}
                  disabled={state.loading}
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {state.loading ? "Running" : "Reindex"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
