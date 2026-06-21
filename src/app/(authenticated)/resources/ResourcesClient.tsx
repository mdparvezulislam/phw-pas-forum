"use client";

import { AlertCircle, Filter, Search, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { PremiumResourceCard } from "@/modules/premium/components";

interface Attachment {
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

interface PremiumResource {
  id: string;
  title: string;
  description: string | null;
  requiredPlan: string;
  createdAt: Date;
  attachment?: Attachment;
}

interface ResourcesClientProps {
  resources: PremiumResource[];
  userActivePlanSortOrder: number;
  isAdmin: boolean;
  plansMap: Record<string, number>; // Maps plan slug to sortOrder
}

export default function ResourcesClient({
  resources,
  userActivePlanSortOrder,
  isAdmin,
  plansMap,
}: ResourcesClientProps) {
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("ALL");

  const checkAccess = (requiredPlanSlug: string) => {
    if (isAdmin) return true;
    const requiredSortOrder = plansMap[requiredPlanSlug.toUpperCase()] ?? 0;
    return userActivePlanSortOrder >= requiredSortOrder;
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(search.toLowerCase()) ||
      (resource.description &&
        resource.description.toLowerCase().includes(search.toLowerCase()));

    const matchesFilter =
      filterPlan === "ALL" ||
      resource.requiredPlan.toUpperCase() === filterPlan;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-10 py-8">
      {/* Hero */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-indigo-400 animate-pulse" />{" "}
            Resource Center
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Download exclusive guides, scripts, templates, and marketplace
            insight tools.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-zinc-950 p-4 rounded-xl border border-zinc-900 shadow-md">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search guides, tools, templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" />
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-300 font-semibold focus:outline-none focus:border-zinc-700"
          >
            <option value="ALL">All Levels</option>
            <option value="VIP">VIP</option>
            <option value="VIP_PLUS">VIP+</option>
            <option value="ELITE">Elite</option>
            <option value="LIFETIME">Lifetime</option>
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-12 text-center text-zinc-500">
          <AlertCircle className="h-8 w-8 mx-auto text-zinc-600 mb-3" />
          <p className="text-sm font-semibold">No premium resources found</p>
          <p className="text-xs text-zinc-600 mt-1">
            Try modifying your filters or search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <PremiumResourceCard
              key={resource.id}
              resource={resource}
              hasAccess={checkAccess(resource.requiredPlan)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
