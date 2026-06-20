"use client";

import { useState } from "react";
import { MarketplaceReviewCard } from "./marketplace-review-card";

interface MarketplaceQueueProps {
  submissions: any[];
}

export function MarketplaceQueue({ submissions: initialSubmissions }: MarketplaceQueueProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [filter, setFilter] = useState("PENDING");

  const filtered = submissions.filter((sub) => sub.status === filter);

  const handleActionSuccess = (subId: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== subId));
  };

  const tabs = [
    {
      label: "Pending",
      value: "PENDING",
      count: submissions.filter((s) => s.status === "PENDING").length,
    },
    {
      label: "Under Review",
      value: "UNDER_REVIEW",
      count: submissions.filter((s) => s.status === "UNDER_REVIEW").length,
    },
    {
      label: "Needs Revision",
      value: "ESC_CHANGE_REQUEST",
      count: submissions.filter((s) => s.status === "ESC_CHANGE_REQUEST").length,
    },
    {
      label: "Approved",
      value: "APPROVED",
      count: submissions.filter((s) => s.status === "APPROVED").length,
    },
    {
      label: "Rejected",
      value: "REJECTED",
      count: submissions.filter((s) => s.status === "REJECTED").length,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex border-b border-muted/20 gap-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
              filter === tab.value
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                filter === tab.value
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary/40 text-muted-foreground"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-3xl bg-secondary/5">
          <p className="text-muted-foreground text-sm font-medium">
            No listings found in this status queue.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((sub) => (
            <MarketplaceReviewCard
              key={sub.id}
              submission={sub}
              onActionSuccess={() => handleActionSuccess(sub.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
