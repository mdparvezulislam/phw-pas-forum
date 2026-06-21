"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  PanelLeftClose,
  PanelLeft,
  Menu,
  Search,
  Bell,
  Plus,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  LogOut,
  User as UserIcon,
  Settings,
} from "lucide-react";
import { findNavItem } from "../nav-config";
import { useAdminUI } from "@/stores/admin-ui-store";
import { useTheme } from "@/providers/theme-provider";
import { logout } from "@/modules/auth/actions/logout";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { dropdown } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface AdminUser {
  displayName: string | null;
  username: string | null;
  email: string | null;
  image: string | null;
  role: string | null;
}

const ENV =
  process.env.NODE_ENV === "production" ? "Production" : "Development";

export function AdminTopbar({ user }: { user: AdminUser }) {
  const pathname = usePathname();
  const collapsed = useAdminUI((s) => s.sidebarCollapsed);
  const toggleSidebar = useAdminUI((s) => s.toggleSidebar);
  const setMobileNavOpen = useAdminUI((s) => s.setMobileNavOpen);
  const setCommandOpen = useAdminUI((s) => s.setCommandOpen);

  const current = findNavItem(pathname);

  return (
    <header className="sticky top-0 z-sticky flex h-14 items-center gap-2 border-b bg-card/80 px-3 backdrop-blur-md lg:px-4">
      {/* Mobile menu */}
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setMobileNavOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop collapse */}
      <button
        type="button"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={toggleSidebar}
        className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground lg:inline-flex"
      >
        {collapsed ? (
          <PanelLeft className="h-5 w-5" />
        ) : (
          <PanelLeftClose className="h-5 w-5" />
        )}
      </button>

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex"
      >
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-foreground"
        >
          Admin
        </Link>
        {current && current.href !== "/admin" && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate font-medium text-foreground">
              {current.label}
            </span>
          </>
        )}
      </nav>

      <div className="flex-1" />

      {/* Command palette trigger */}
      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className="hidden items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent md:inline-flex"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search…</span>
        <kbd className="ml-4 inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
          ⌘K
        </kbd>
      </button>
      <button
        type="button"
        aria-label="Search"
        onClick={() => setCommandOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
      >
        <Search className="h-5 w-5" />
      </button>

      <QuickActions />

      {/* Notifications */}
      <Link
        href="/admin/announcements"
        aria-label="Announcements"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
      </Link>

      <ThemeToggle />

      {/* Environment badge */}
      <Badge
        variant={ENV === "Production" ? "success" : "warning"}
        size="sm"
        className="hidden lg:inline-flex"
      >
        {ENV}
      </Badge>

      <ProfileMenu user={user} />
    </header>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const cycle = () =>
    setTheme(
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light",
    );
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={cycle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function QuickActions() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, () => setOpen(false));

  const actions = [
    { label: "New Announcement", href: "/admin/announcements" },
    { label: "New Badge", href: "/admin/badges" },
    { label: "New Trophy", href: "/admin/trophies" },
    { label: "Moderation Queue", href: "/admin/moderation" },
  ];

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        aria-label="Quick actions"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <Plus className="h-5 w-5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            variants={dropdown}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-11 z-dropdown w-52 overflow-hidden rounded-xl border bg-card p-1.5 shadow-lg"
          >
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Actions
            </p>
            {actions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-2.5 py-1.5 text-sm text-foreground/80 hover:bg-accent hover:text-foreground"
              >
                {a.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileMenu({ user }: { user: AdminUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  useOutsideClose(ref, () => setOpen(false));

  const name = user.displayName ?? user.username ?? "Admin";

  function handleSignOut() {
    startTransition(async () => {
      await logout();
      router.push("/auth/login");
      router.refresh();
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg p-0.5 hover:bg-accent"
      >
        <Avatar src={user.image} alt={name} size="sm" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            variants={dropdown}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-11 z-dropdown w-60 overflow-hidden rounded-xl border bg-card p-1.5 shadow-lg"
          >
            <div className="flex items-center gap-2.5 border-b px-2.5 py-2">
              <Avatar src={user.image} alt={name} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            {user.role && (
              <div className="px-2.5 py-2">
                <Badge variant="admin" size="sm">
                  {user.role.replace(/_/g, " ")}
                </Badge>
              </div>
            )}
            <div className="border-t pt-1">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-foreground/80 hover:bg-accent hover:text-foreground"
              >
                <UserIcon className="h-4 w-4" /> Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-foreground/80 hover:bg-accent hover:text-foreground"
              >
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={pending}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-danger hover:bg-danger/10 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />{" "}
                {pending ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function useOutsideClose(
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [ref, onClose]);
}
