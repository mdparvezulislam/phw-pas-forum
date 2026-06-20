"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  LayoutDashboard,
  MessageSquare,
  Bell,
  ShoppingBag,
  Settings,
  LogOut,
  Medal,
  Bookmark,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/modules/auth/actions";

interface UserDropdownProps {
  user: {
    id: string;
    username: string | null;
    displayName: string | null;
    email?: string | null;
    image?: string | null;
  };
  className?: string;
}

export function UserDropdown({ user, className }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const name = user.displayName ?? user.username ?? "User";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-accent"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-bold">
          {user.image ? (
            <img src={user.image} alt={name} className="h-full w-full rounded-full object-cover" />
          ) : (
            name[0]?.toUpperCase()
          )}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border bg-popover shadow-xl">
          {/* User info */}
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </div>

          {/* Links */}
          <div className="p-1.5">
            <DropdownItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <DropdownItem href={`/profile/${user.username}`} icon={User} label="Profile" />
            <DropdownItem href="/notifications" icon={Bell} label="Notifications" />
            <DropdownItem href="/conversations" icon={MessageSquare} label="Messages" />
            <DropdownItem href="/bookmarks" icon={Bookmark} label="Bookmarks" />
            <DropdownItem href="/watched" icon={Eye} label="Watched" />
            <DropdownItem href="/orders" icon={ShoppingBag} label="Orders" />
            <DropdownItem href="/achievements" icon={Medal} label="Achievements" />
          </div>

          <div className="border-t p-1.5">
            <DropdownItem href="/settings/profile" icon={Settings} label="Settings" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
