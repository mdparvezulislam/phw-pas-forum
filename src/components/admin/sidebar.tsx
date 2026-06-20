"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Store,
  BadgeCheck,
  Shield,
  UsersRound,
  BarChart3,
  Lock,
  Settings,
  ScrollText,
  Megaphone,
  HeadphonesIcon,
} from "lucide-react";

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/categories", label: "Categories", icon: MessageSquare },
      { href: "/admin/forums", label: "Forums", icon: MessageSquare },
      { href: "/admin/threads", label: "Threads", icon: MessageSquare },
      { href: "/admin/search", label: "Search Index", icon: Settings },
    ],
  },
  {
    label: "Community",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/moderation", label: "Moderation", icon: Shield },
      { href: "/admin/staff", label: "Staff", icon: UsersRound },
      { href: "/admin/badges", label: "Badges", icon: BadgeCheck },
      { href: "/admin/trophies", label: "Trophies", icon: BadgeCheck },
      { href: "/admin/reputation", label: "Reputation", icon: Settings },
    ],
  },
  {
    label: "Marketplace",
    items: [
      { href: "/admin/marketplace", label: "Rules", icon: Store },
      { href: "/admin/orders", label: "Orders", icon: Store },
      { href: "/admin/disputes", label: "Disputes", icon: Store },
      { href: "/admin/transactions", label: "Transactions", icon: Store },
    ],
  },
  {
    label: "Memberships",
    items: [
      { href: "/admin/memberships", label: "Plans", icon: BadgeCheck },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings },
      { href: "/admin/security", label: "Security", icon: Lock },
      { href: "/admin/audit", label: "Audit Log", icon: ScrollText },
      { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
      { href: "/admin/support", label: "Support", icon: HeadphonesIcon },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r lg:block">
      <div className="flex h-full flex-col gap-1 overflow-y-auto p-4">
        <div className="mb-4 px-2">
          <h2 className="text-lg font-bold tracking-tight">Admin Panel</h2>
          <p className="text-xs text-muted-foreground">Manage your community</p>
        </div>
        {navSections.map((section) => (
          <div key={section.label} className="mb-2">
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
            {section.items.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}
