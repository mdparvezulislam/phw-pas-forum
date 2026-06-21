import {
  LayoutDashboard,
  BarChart3,
  Users,
  FolderTree,
  MessagesSquare,
  MessageSquare,
  Award,
  Trophy,
  Sparkles,
  SearchCode,
  Store,
  ShoppingCart,
  Gavel,
  Receipt,
  CreditCard,
  ShieldCheck,
  Megaphone,
  LifeBuoy,
  Lock,
  ScrollText,
  UsersRound,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Short description, shown in the command palette. */
  description: string;
  /** Extra search terms for the command palette / sidebar filter. */
  keywords?: string[];
}

export interface AdminNavSection {
  label: string;
  items: AdminNavItem[];
}

/**
 * Single source of truth for admin navigation.
 * Maps the 10 brief sections onto the 22 existing /admin routes.
 * Consumed by the sidebar, mobile drawer, command palette and breadcrumbs.
 */
export const ADMIN_NAV: AdminNavSection[] = [
  {
    label: "Dashboard",
    items: [
      {
        href: "/admin",
        label: "Overview",
        icon: LayoutDashboard,
        description: "Executive command center",
        keywords: ["home", "dashboard", "kpi"],
      },
      {
        href: "/admin/analytics",
        label: "Analytics",
        icon: BarChart3,
        description: "Platform metrics and trends",
        keywords: ["charts", "growth", "revenue", "stats"],
      },
    ],
  },
  {
    label: "Community",
    items: [
      {
        href: "/admin/users",
        label: "Users",
        icon: Users,
        description: "Manage members, roles and access",
        keywords: ["members", "people", "accounts"],
      },
      {
        href: "/admin/categories",
        label: "Categories",
        icon: FolderTree,
        description: "Forum category structure",
      },
      {
        href: "/admin/forums",
        label: "Forums",
        icon: MessagesSquare,
        description: "Forums and subforums",
      },
      {
        href: "/admin/threads",
        label: "Threads",
        icon: MessageSquare,
        description: "Thread management and moderation",
      },
      {
        href: "/admin/reputation",
        label: "Reputation",
        icon: Sparkles,
        description: "Reputation transactions and totals",
        keywords: ["points", "trust"],
      },
      {
        href: "/admin/badges",
        label: "Badges",
        icon: Award,
        description: "Badge definitions",
      },
      {
        href: "/admin/trophies",
        label: "Trophies",
        icon: Trophy,
        description: "Trophy definitions",
      },
      {
        href: "/admin/search",
        label: "Search Index",
        icon: SearchCode,
        description: "Search indexing and reindex jobs",
        keywords: ["typesense", "reindex"],
      },
    ],
  },
  {
    label: "Marketplace",
    items: [
      {
        href: "/admin/marketplace",
        label: "Rules",
        icon: Store,
        description: "Marketplace settings and rules",
        keywords: ["listings", "compliance"],
      },
      {
        href: "/admin/orders",
        label: "Orders",
        icon: ShoppingCart,
        description: "Order management",
      },
      {
        href: "/admin/disputes",
        label: "Disputes",
        icon: Gavel,
        description: "Dispute resolution",
        keywords: ["refunds", "claims"],
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        href: "/admin/transactions",
        label: "Transactions",
        icon: Receipt,
        description: "Payments, refunds and adjustments",
        keywords: ["payments", "revenue", "money"],
      },
    ],
  },
  {
    label: "Memberships",
    items: [
      {
        href: "/admin/memberships",
        label: "Plans",
        icon: CreditCard,
        description: "Membership plans and subscribers",
        keywords: ["vip", "premium", "subscriptions"],
      },
    ],
  },
  {
    label: "Moderation",
    items: [
      {
        href: "/admin/moderation",
        label: "Queue",
        icon: ShieldCheck,
        description: "Reported content and moderation queue",
        keywords: ["reports", "flags"],
      },
      {
        href: "/admin/announcements",
        label: "Announcements",
        icon: Megaphone,
        description: "System announcements and broadcasts",
      },
      {
        href: "/admin/support",
        label: "Support",
        icon: LifeBuoy,
        description: "Support tickets",
      },
    ],
  },
  {
    label: "Security",
    items: [
      {
        href: "/admin/security",
        label: "Security",
        icon: Lock,
        description: "Threat indicators and security events",
        keywords: ["bans", "logins", "threats"],
      },
      {
        href: "/admin/audit",
        label: "Audit Log",
        icon: ScrollText,
        description: "Every admin and staff action",
        keywords: ["history", "logs", "trail"],
      },
    ],
  },
  {
    label: "Staff",
    items: [
      {
        href: "/admin/staff",
        label: "Staff",
        icon: UsersRound,
        description: "Staff members, roles and permissions",
        keywords: ["roles", "permissions", "team"],
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        href: "/admin/settings",
        label: "Settings",
        icon: Settings,
        description: "Platform configuration",
        keywords: ["config", "integrations", "feature flags"],
      },
    ],
  },
];

/** Flat list of every nav item — used by command palette, breadcrumbs, favorites. */
export const ADMIN_NAV_FLAT: AdminNavItem[] = ADMIN_NAV.flatMap((s) => s.items);

/** Resolve the nav item that best matches a pathname. */
export function findNavItem(pathname: string): AdminNavItem | undefined {
  // exact match first, then longest-prefix match (so /admin/users/123 → Users)
  const exact = ADMIN_NAV_FLAT.find((i) => i.href === pathname);
  if (exact) return exact;
  return ADMIN_NAV_FLAT.filter(
    (i) => i.href !== "/admin" && pathname.startsWith(i.href),
  ).sort((a, b) => b.href.length - a.href.length)[0];
}

/** Whether a nav item should be highlighted as active for a given pathname. */
export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
