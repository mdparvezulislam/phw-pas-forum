"use client";

import { useState } from "react";
import { formatDateRelative } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Flag, Trash2, EyeOff, Eye, History, Quote, Copy } from "lucide-react";

interface PostCardProps {
  post: {
    id: string;
    postNumber: number;
    content: string;
    contentJson?: unknown;
    status?: string;
    isEdited?: boolean;
    editedAt?: Date | null;
    createdAt: Date;
    author: {
      id: string;
      username: string | null;
      displayName: string | null;
      image?: string | null;
      role?: { name: string } | null;
      userReputation?: { points: number } | null;
    };
  };
  threadId: string;
  isOP?: boolean;
  isOwner?: boolean;
  onDelete?: (postId: string) => void;
  onQuote?: (postId: string, content: string) => void;
}

export function PostCard({ post, isOP, isOwner, onDelete, onQuote }: PostCardProps) {
  const [openMenu, setOpenMenu] = useState(false);
  const authorName = post.author.displayName ?? post.author.username ?? "Unknown";
  const role = post.author.role?.name;
  const reputation = post.author.userReputation?.points ?? 0;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card transition-all hover:border-primary/10",
        isOP && "border-primary/10 bg-primary/[0.02]",
      )}
    >
      <div className="flex flex-col md:flex-row">
        {/* Author Sidebar (Desktop) */}
        <div className="hidden w-48 shrink-0 border-r bg-muted/20 p-4 md:flex md:flex-col">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-lg font-bold">
              {authorName[0]?.toUpperCase()}
            </div>
            <p className="mt-2 text-sm font-semibold leading-tight">{authorName}</p>
            {role && (
              <span className="mt-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                {role}
              </span>
            )}
          </div>
          <div className="mt-3 space-y-2 text-center text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Reputation</span>
              <span className="font-medium text-foreground">{reputation.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Posts</span>
              <span className="font-medium text-foreground">-</span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="flex-1">
          {/* Post Header */}
          <div className="flex items-center gap-3 border-b px-4 py-2.5">
            {/* Mobile Avatar */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-bold md:hidden">
              {authorName[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold truncate">{authorName}</span>
                {isOP && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                    OP
                  </span>
                )}
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  #{post.postNumber}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDateRelative(post.createdAt)}
                {post.isEdited && (
                  <span className="ml-1">(edited)</span>
                )}
              </div>
            </div>

            {/* Post Menu */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {openMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(false)} />
                  <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border bg-popover p-1.5 shadow-lg">
                    <button
                      onClick={() => onQuote?.(post.id, post.content)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Quote className="h-3.5 w-3.5" />
                      Quote
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(post.content)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </button>
                    <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                      <History className="h-3.5 w-3.5" />
                      Edit History
                    </button>
                    <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                      <Flag className="h-3.5 w-3.5" />
                      Report
                    </button>
                    {isOwner && (
                      <button
                        onClick={() => onDelete?.(post.id)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Post Body */}
          <div className="px-4 py-4">
            {post.status === "HIDDEN" ? (
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <EyeOff className="h-4 w-4" />
                This post has been hidden by a moderator.
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
              </div>
            )}
          </div>

          {/* Post Footer */}
          <div className="flex items-center gap-2 border-t px-4 py-2.5">
            <button className="rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              👍 Like
            </button>
            <button className="rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              💬 Reply
            </button>
            <button className="rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              🔗 Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
