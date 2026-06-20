import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Search,
  Bell,
  Mail,
  ShoppingCart,
  FileText,
  Users,
  FolderOpen,
  Shield,
  TrendingUp,
  Star,
  AlertCircle,
  Inbox,
  Upload,
  Download,
  Lock,
} from "lucide-react";
import Link from "next/link";

/* ============================================
   EMPTY STATE COMPONENTS
   Contextual empty states with actions
   ============================================ */

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground mb-6">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      <div className="flex items-center gap-3">
        {action?.href && (
          <Link href={action.href}>
            <Button variant={action.variant ?? "default"}>{action.label}</Button>
          </Link>
        )}
        {action?.onClick && (
          <Button variant={action.variant ?? "default"} onClick={action.onClick}>
            {action.label}
          </Button>
        )}
        {secondaryAction?.href && (
          <Link href={secondaryAction.href}>
            <Button variant="ghost">{secondaryAction.label}</Button>
          </Link>
        )}
        {secondaryAction?.onClick && (
          <Button variant="ghost" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── No Threads ──
export function NoThreads({ forumSlug }: { forumSlug?: string }) {
  return (
    <EmptyState
      icon={<MessageSquare className="h-8 w-8" />}
      title="No threads yet"
      description="Be the first to start a discussion in this forum."
      action={
        forumSlug
          ? {
              label: "Create Thread",
              href: `/forums/${forumSlug}/new`,
            }
          : undefined
      }
    />
  );
}

// ── No Listings ──
export function NoListings() {
  return (
    <EmptyState
      icon={<FolderOpen className="h-8 w-8" />}
      title="No listings found"
      description="There are no marketplace listings matching your criteria."
      action={{
        label: "Browse All Listings",
        href: "/marketplace",
      }}
    />
  );
}

// ── No Notifications ──
export function NoNotifications() {
  return (
    <EmptyState
      icon={<Bell className="h-8 w-8" />}
      title="All caught up"
      description="You don't have any notifications right now. We'll let you know when something needs your attention."
    />
  );
}

// ── No Messages ──
export function NoMessages() {
  return (
    <EmptyState
      icon={<Mail className="h-8 w-8" />}
      title="No messages yet"
      description="Start a conversation with other members to see your messages here."
      action={{
        label: "Start Conversation",
        href: "/conversations",
      }}
    />
  );
}

// ── No Search Results ──
export function NoSearchResults({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8" />}
      title="No results found"
      description={
        query
          ? `We couldn't find anything matching "${query}". Try different keywords or check your filters.`
          : "Enter a search term to find threads, listings, or members."
      }
    />
  );
}

// ── No Orders ──
export function NoOrders() {
  return (
    <EmptyState
      icon={<ShoppingCart className="h-8 w-8" />}
      title="No orders yet"
      description="When you place an order, it will appear here for easy tracking."
      action={{
        label: "Browse Marketplace",
        href: "/marketplace",
      }}
    />
  );
}

// ── No Resources ──
export function NoResources() {
  return (
    <EmptyState
      icon={<FileText className="h-8 w-8" />}
      title="No resources available"
      description="Premium resources will appear here once they're published."
    />
  );
}

// ── No Members ──
export function NoMembers() {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8" />}
      title="No members found"
      description="No members match your current filters."
    />
  );
}

// ── No Reports ──
export function NoReports() {
  return (
    <EmptyState
      icon={<Shield className="h-8 w-8" />}
      title="No reports pending"
      description="All reports have been reviewed. Great work keeping the community safe!"
    />
  );
}

// ── No Activity ──
export function NoActivity() {
  return (
    <EmptyState
      icon={<TrendingUp className="h-8 w-8" />}
      title="No activity yet"
      description="Start participating in discussions to see your activity feed grow."
      action={{
        label: "Browse Forums",
        href: "/forums",
      }}
    />
  );
}

// ── No Badges ──
export function NoBadges() {
  return (
    <EmptyState
      icon={<Star className="h-8 w-8" />}
      title="No badges earned yet"
      description="Keep contributing to the community to earn badges and achievements."
    />
  );
}

// ── No Errors ──
export function NoErrors() {
  return (
    <EmptyState
      icon={<AlertCircle className="h-8 w-8" />}
      title="All clear"
      description="No errors or issues to report."
    />
  );
}

// ── No Items ──
export function NoItems({ itemLabel = "items" }: { itemLabel?: string }) {
  return (
    <EmptyState
      icon={<Inbox className="h-8 w-8" />}
      title={`No ${itemLabel} found`}
      description={`There are no ${itemLabel} to display right now.`}
    />
  );
}

// ── No Uploads ──
export function NoUploads() {
  return (
    <EmptyState
      icon={<Upload className="h-8 w-8" />}
      title="No uploads yet"
      description="Upload files to see them listed here."
    />
  );
}

// ── No Downloads ──
export function NoDownloads() {
  return (
    <EmptyState
      icon={<Download className="h-8 w-8" />}
      title="No downloads yet"
      description="Your downloaded files will appear here for quick access."
    />
  );
}

// ── Premium Upsell ──
export function PremiumUpsell({
  title = "Unlock Premium Features",
  description = "Upgrade your account to access exclusive content, premium forums, and advanced tools.",
  requiredPlan = "VIP",
}: {
  title?: string;
  description?: string;
  requiredPlan?: string;
}) {
  return (
    <EmptyState
      icon={<Lock className="h-8 w-8 text-premium" />}
      title={title}
      description={description}
      action={{
        label: `Upgrade to ${requiredPlan}`,
        href: "/membership",
      }}
    />
  );
}

// ── Forum Locked ──
export function ForumLocked() {
  return (
    <EmptyState
      icon={<Lock className="h-8 w-8" />}
      title="Forum Locked"
      description="This forum is currently locked. No new threads can be created."
    />
  );
}

// ── Unauthorized ──
export function Unauthorized() {
  return (
    <EmptyState
      icon={<Shield className="h-8 w-8" />}
      title="Access Restricted"
      description="You don't have permission to view this content. Upgrade your membership or contact an administrator."
      action={{
        label: "Go Home",
        href: "/",
      }}
    />
  );
}
