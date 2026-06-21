"use client";

import { Download, FileText, Lock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

interface PremiumResourceCardProps {
  resource: PremiumResource;
  hasAccess: boolean;
  onDownload?: (resourceId: string) => void;
}

export function PremiumResourceCard({
  resource,
  hasAccess,
  onDownload,
}: PremiumResourceCardProps) {
  // Format file size
  const formatBytes = (bytes?: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
  };

  // Determine badge colors based on required plan level
  const reqPlan = resource.requiredPlan.toUpperCase();
  const isVip = reqPlan === "VIP";
  const isVipPlus = reqPlan === "VIP_PLUS" || reqPlan === "VIP+";
  const isElite = reqPlan === "ELITE" || reqPlan === "LIFETIME";

  let borderGlow = "border-zinc-800 hover:border-zinc-700 bg-zinc-950/70";
  let planBadge = "bg-zinc-800 text-zinc-400 border-zinc-700";

  if (isVip) {
    borderGlow =
      "border-indigo-950 hover:border-indigo-500/30 bg-indigo-950/10";
    planBadge = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
  } else if (isVipPlus) {
    borderGlow =
      "border-violet-950 hover:border-violet-500/30 bg-violet-950/10";
    planBadge = "bg-violet-500/10 text-violet-400 border-violet-500/20";
  } else if (isElite) {
    borderGlow = "border-amber-950 hover:border-amber-500/35 bg-amber-950/10";
    planBadge = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }

  const handleDownloadClick = (e: React.MouseEvent) => {
    if (!hasAccess) {
      e.preventDefault();
      return;
    }
    if (onDownload) {
      onDownload(resource.id);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col justify-between p-6 rounded-xl border transition-all duration-300 shadow-lg",
        borderGlow,
      )}
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
            <FileText className="h-5.5 w-5.5" />
          </div>
          <span
            className={cn(
              "text-[10px] font-bold tracking-wider uppercase border px-2 py-0.5 rounded-full",
              planBadge,
            )}
          >
            Requires {resource.requiredPlan}
          </span>
        </div>

        <h4 className="mt-4 text-lg font-bold tracking-tight text-white line-clamp-1">
          {resource.title}
        </h4>

        <p className="mt-2 text-xs text-zinc-400 line-clamp-3 min-h-[48px]">
          {resource.description ||
            "No description provided for this premium resource."}
        </p>

        {resource.attachment && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-zinc-950/50 p-2.5 border border-zinc-900 text-[11px] text-zinc-500">
            <span
              className="truncate max-w-[120px] font-medium"
              title={resource.attachment.fileName}
            >
              {resource.attachment.fileName}
            </span>
            <span className="font-semibold text-zinc-400">
              {formatBytes(resource.attachment.fileSize)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-6">
        {hasAccess ? (
          <a
            href={resource.attachment?.url ?? "#"}
            onClick={handleDownloadClick}
            download
            className="w-full"
          >
            <Button className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 h-9 font-semibold text-xs border border-zinc-700/50">
              <Download className="h-4 w-4" /> Download Resource
            </Button>
          </a>
        ) : (
          <Link href="/membership" passHref className="w-full">
            <Button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-950 to-violet-950 hover:from-indigo-900 hover:to-violet-900 text-indigo-300 hover:text-white h-9 font-bold text-xs border border-indigo-500/20">
              <Lock className="h-3.5 w-3.5" /> Upgrade to Unlock
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
