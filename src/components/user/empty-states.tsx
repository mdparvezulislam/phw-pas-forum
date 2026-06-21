import {
  Activity,
  Bell,
  Bookmark,
  Eye,
  Medal,
  MessageSquare,
  Search,
  Trophy,
} from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  type:
    | "no-notifications"
    | "no-messages"
    | "no-bookmarks"
    | "no-watched"
    | "no-activity"
    | "no-achievements"
    | "no-reputation";
  className?: string;
}

const configs = {
  "no-notifications": {
    icon: Bell,
    title: "No notifications",
    description:
      "You're all caught up! We'll let you know when something happens.",
    cta: { label: "Browse Forums", href: "/forums" },
  },
  "no-messages": {
    icon: MessageSquare,
    title: "No messages",
    description: "Start a conversation with another member.",
    cta: { label: "Find Members", href: "/members" },
  },
  "no-bookmarks": {
    icon: Bookmark,
    title: "No bookmarks",
    description: "Save threads and listings to find them quickly later.",
    cta: { label: "Browse Forums", href: "/forums" },
  },
  "no-watched": {
    icon: Eye,
    title: "No watched threads",
    description: "Watch threads to stay updated on discussions.",
    cta: { label: "Browse Forums", href: "/forums" },
  },
  "no-activity": {
    icon: Activity,
    title: "No recent activity",
    description:
      "Your activity will appear here as you engage with the community.",
    cta: { label: "Explore Community", href: "/forums" },
  },
  "no-achievements": {
    icon: Trophy,
    title: "No achievements yet",
    description: "Participate in the community to earn badges and trophies.",
    cta: { label: "Browse Forums", href: "/forums" },
  },
  "no-reputation": {
    icon: Medal,
    title: "No reputation history",
    description: "Your reputation transactions will appear here.",
    cta: { label: "Learn More", href: "/forums" },
  },
};

export function UserEmptyState({ type, className }: EmptyStateProps) {
  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{config.title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {config.description}
      </p>
      <Link
        href={config.cta.href}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {config.cta.label}
      </Link>
    </div>
  );
}
