"use client";

import React, { useState } from "react";
import { PageHeader, SectionCard } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SearchCode,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { adminTriggerReindexAction } from "@/modules/search/actions/search";
import type { SearchIndexEntityType } from "@/db/schema/search-index-jobs";

const COLLECTIONS_LIST: Array<{
  label: string;
  value: SearchIndexEntityType;
  description: string;
}> = [
  {
    label: "Forums",
    value: "FORUM",
    description: "Index forum categories, descriptions, titles",
  },
  {
    label: "Threads",
    value: "THREAD",
    description: "Index thread titles, slugs, bodies, tags, categories, forums",
  },
  {
    label: "Replies / Posts",
    value: "POST",
    description: "Index forum reply posts and quote context",
  },
  {
    label: "Members / Users",
    value: "USER",
    description: "Index username, displayName, levels, badge counts",
  },
  {
    label: "Badges",
    value: "BADGE",
    description: "Index badge names, descriptions",
  },
  {
    label: "Trophies",
    value: "TROPHY",
    description: "Index trophies and unlock requirements",
  },
  {
    label: "Conversations",
    value: "CONVERSATION_MESSAGE",
    description: "Index participant-isolated DM messages",
  },
];

type CollectionStatus = {
  loading: boolean;
  error?: string;
  success?: boolean;
  message?: string;
};

export default function AdminSearchPage() {
  const [statuses, setStatuses] = useState<Record<string, CollectionStatus>>(
    {},
  );
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
        [entityType]: {
          loading: false,
          error: err.message || "Failed to trigger reindexing",
        },
      }));
    }
  };

  const handleReindexAll = async () => {
    setGlobalStatus(
      "Reindexing all collections sequentially. This runs in the background...",
    );
    for (const item of COLLECTIONS_LIST) {
      await handleReindex(item.value);
    }
    setGlobalStatus(
      "Triggered bulk reindexing background sync for all collections.",
    );
  };

  const statusIcon = (state: CollectionStatus) => {
    if (state.loading) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    if (state.error) {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    if (state.success) {
      return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    }
    return null;
  };

  const statusBadge = (state: CollectionStatus) => {
    if (state.loading) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Syncing
        </Badge>
      );
    }
    if (state.error) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    }
    if (state.success) {
      return (
        <Badge variant="secondary" className="gap-1 text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="h-3 w-3" />
          Done
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Idle
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Search Index"
        description="Manage Typesense search indices and reindex collections"
        icon={<SearchCode className="h-5 w-5" />}
        actions={
          <Button onClick={handleReindexAll} variant="default" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reindex All
          </Button>
        }
      />

      {globalStatus && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          {globalStatus}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {COLLECTIONS_LIST.map((item) => {
          const state = statuses[item.value] || { loading: false };
          return (
            <SectionCard
              key={item.value}
              title={item.label}
              description={item.description}
              actions={statusBadge(state)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {statusIcon(state)}
                  {state.success && state.message && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                      {state.message}
                    </span>
                  )}
                  {state.error && (
                    <span className="text-xs text-destructive">
                      {state.error}
                    </span>
                  )}
                </div>
                <Button
                  onClick={() => handleReindex(item.value)}
                  disabled={state.loading}
                  variant="outline"
                  size="sm"
                >
                  {state.loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Reindex
                </Button>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
