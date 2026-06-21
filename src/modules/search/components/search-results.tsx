"use client";

import Link from "next/link";
import type React from "react";
import { formatDateRelative } from "@/lib/utils";

// XSS-Safe highlighted snippet parser
function renderHighlightedText(text: string): React.ReactNode[] {
  if (!text) return [];
  const parts = text.split(/(<mark>|<\/mark>)/);
  let isMarked = false;
  return parts
    .map((part, i) => {
      if (part === "<mark>") {
        isMarked = true;
        return null;
      }
      if (part === "</mark>") {
        isMarked = false;
        return null;
      }
      if (isMarked) {
        return (
          <mark
            key={i}
            className="bg-yellow-500/25 dark:bg-amber-400/20 text-yellow-900 dark:text-amber-200 px-0.5 rounded font-medium not-italic"
          >
            {part}
          </mark>
        );
      }
      return <span key={i}>{part}</span>;
    })
    .filter((el): el is React.ReactElement => el !== null);
}

interface SearchHit {
  document: Record<string, any>;
  highlight?: Record<string, any>;
  highlights?: Array<{
    field: string;
    snippet: string;
    matched_tokens: string[];
  }>;
}

interface SearchResultsProps {
  hits: SearchHit[];
  contentType: string;
}

export function SearchResults({ hits, contentType }: SearchResultsProps) {
  const getFieldSnippet = (hit: SearchHit, field: string, fallback: string) => {
    const hl = hit.highlights?.find((h) => h.field === field);
    if (hl?.snippet) {
      return renderHighlightedText(hl.snippet);
    }
    return fallback;
  };

  const renderHit = (hit: SearchHit) => {
    const doc = hit.document;
    const itemType =
      doc.replies !== undefined
        ? "thread"
        : doc.threadId
          ? "post"
          : doc.username
            ? "user"
            : doc.points
              ? "trophy"
              : doc.name
                ? "badge"
                : "forum";

    // 1. Thread Card
    if (itemType === "thread") {
      const categorySlug = doc.categorySlug ?? "general";
      const forumSlug = doc.forumSlug ?? "general";
      const threadSlug = doc.slug ?? doc.id;
      const threadUrl = `/forums/${categorySlug}/${forumSlug}/${threadSlug}`;

      return (
        <div
          key={doc.id}
          className="p-5 bg-card/40 border rounded-xl hover:bg-card/80 transition-all shadow-sm space-y-3"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 uppercase">
                Thread
              </span>
              <h4 className="text-lg font-semibold leading-snug hover:underline text-foreground">
                <Link href={threadUrl}>
                  {getFieldSnippet(hit, "title", doc.title)}
                </Link>
              </h4>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatDateRelative(new Date(doc.createdAt))}
            </span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {getFieldSnippet(hit, "content", doc.content)}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-muted-foreground border-t border-muted/30">
            <div className="flex items-center gap-3">
              <span>
                By <strong className="text-foreground">{doc.author}</strong>
              </span>
              <span>•</span>
              <span>
                In{" "}
                <Link
                  href={`/forums/${categorySlug}/${forumSlug}`}
                  className="hover:underline text-foreground font-medium"
                >
                  {doc.forum}
                </Link>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>👁️ {doc.views} views</span>
              <span>💬 {doc.replies} replies</span>
            </div>
          </div>
        </div>
      );
    }

    // 2. Post Card
    if (itemType === "post") {
      const categorySlug = doc.categorySlug ?? "general";
      const forumSlug = doc.forumSlug ?? "general";
      const threadSlug = doc.threadSlug ?? "general";
      const postUrl = `/forums/${categorySlug}/${forumSlug}/${threadSlug}#post-${doc.id}`;

      return (
        <div
          key={doc.id}
          className="p-5 bg-card/40 border rounded-xl hover:bg-card/80 transition-all shadow-sm space-y-3"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 uppercase">
                Reply
              </span>
              <h4 className="text-sm text-muted-foreground">
                In thread:{" "}
                <Link
                  href={postUrl}
                  className="font-semibold text-foreground hover:underline"
                >
                  {doc.threadTitle}
                </Link>
              </h4>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatDateRelative(new Date(doc.createdAt))}
            </span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed bg-muted/20 p-3 rounded-lg border border-muted/40">
            {getFieldSnippet(hit, "content", doc.content)}
          </p>

          <div className="pt-1 text-xs text-muted-foreground flex items-center justify-between">
            <span>
              Posted by{" "}
              <strong className="text-foreground">{doc.author}</strong>
            </span>
            <Link
              href={postUrl}
              className="text-primary hover:underline font-medium"
            >
              View reply →
            </Link>
          </div>
        </div>
      );
    }

    // 3. User (Member) Card
    if (itemType === "user") {
      return (
        <div
          key={doc.id}
          className="p-4 bg-card/40 border rounded-xl hover:bg-card/80 transition-all flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary uppercase">
              {doc.username.slice(0, 2)}
            </div>
            <div>
              <h4 className="font-bold text-foreground hover:underline">
                <Link href={`/profile/${doc.username}`}>
                  {getFieldSnippet(hit, "username", doc.username)}
                </Link>
              </h4>
              <p className="text-xs text-muted-foreground">
                Joined {formatDateRelative(new Date(doc.joinDate))}
              </p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-500">
              ⭐ {doc.reputation} Rep
            </span>
            <p className="text-xs text-muted-foreground">
              {doc.badgeCount} Badges
            </p>
          </div>
        </div>
      );
    }

    // 4. Forum Card
    if (itemType === "forum") {
      return (
        <div
          key={doc.id}
          className="p-4 bg-card/40 border rounded-xl hover:bg-card/80 transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 uppercase">
              Forum
            </span>
            <h4 className="text-base font-bold text-foreground hover:underline">
              <Link href={`/forums/forum-id/${doc.id}`}>
                {getFieldSnippet(hit, "title", doc.title)}
              </Link>
            </h4>
            <p className="text-sm text-muted-foreground">
              {getFieldSnippet(hit, "description", doc.description)}
            </p>
          </div>
          <span className="text-xs text-muted-foreground font-medium px-2 py-1 rounded bg-muted">
            {doc.category}
          </span>
        </div>
      );
    }

    // 5. Badge Card
    if (itemType === "badge") {
      return (
        <div
          key={doc.id}
          className="p-4 bg-card/40 border rounded-xl hover:bg-card/80 transition-all flex items-center gap-4"
        >
          <div className="h-12 w-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-2xl border border-amber-500/20">
            🏆
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 uppercase">
              Badge
            </span>
            <h4 className="font-bold text-foreground">
              {getFieldSnippet(hit, "name", doc.name)}
            </h4>
            <p className="text-sm text-muted-foreground">
              {getFieldSnippet(hit, "description", doc.description)}
            </p>
          </div>
        </div>
      );
    }

    // 6. Trophy Card
    if (itemType === "trophy") {
      return (
        <div
          key={doc.id}
          className="p-4 bg-card/40 border rounded-xl hover:bg-card/80 transition-all flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-2xl border border-purple-500/20">
              🏅
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 uppercase">
                Trophy
              </span>
              <h4 className="font-bold text-foreground">
                {getFieldSnippet(hit, "title", doc.title)}
              </h4>
              <p className="text-sm text-muted-foreground">
                {getFieldSnippet(hit, "description", doc.description)}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-purple-500 bg-purple-500/10 px-3 py-1.5 rounded-full shrink-0">
            +{doc.points} Points
          </span>
        </div>
      );
    }

    return null;
  };

  return <div className="space-y-4">{hits.map(renderHit)}</div>;
}
