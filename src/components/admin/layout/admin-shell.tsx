"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminTopbar, type AdminUser } from "./admin-topbar";
import { AdminSidebar } from "./admin-sidebar";
import { AdminMobileNav } from "./admin-mobile-nav";
import { CommandPalette } from "../command/command-palette";
import { findNavItem } from "../nav-config";
import { useAdminUI } from "@/stores/admin-ui-store";
import { cn } from "@/lib/utils";

export function AdminShell({
  user,
  children,
}: {
  user: AdminUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const collapsed = useAdminUI((s) => s.sidebarCollapsed);
  const pushRecent = useAdminUI((s) => s.pushRecent);
  const setMobileNavOpen = useAdminUI((s) => s.setMobileNavOpen);

  // Track recent pages + close the mobile drawer on navigation.
  useEffect(() => {
    const item = findNavItem(pathname);
    if (item) pushRecent(item.href);
    setMobileNavOpen(false);
  }, [pathname, pushRecent, setMobileNavOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <AdminTopbar user={user} />

      <div className="flex flex-1">
        <aside
          className={cn(
            "sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 border-r bg-card transition-[width] duration-200 ease-out lg:block",
            collapsed ? "w-16" : "w-64",
          )}
        >
          <AdminSidebar />
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-screen-2xl px-4 py-6 lg:px-6">
            {children}
          </div>
        </main>
      </div>

      <CommandPalette />
      <AdminMobileNav />
    </div>
  );
}
