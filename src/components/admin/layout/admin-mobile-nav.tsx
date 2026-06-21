"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, ShieldCheck } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";
import { useAdminUI } from "@/stores/admin-ui-store";
import { overlay, slideInLeft } from "@/lib/motion";

export function AdminMobileNav() {
  const open = useAdminUI((s) => s.mobileNavOpen);
  const setOpen = useAdminUI((s) => s.setMobileNavOpen);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-drawer lg:hidden">
          <motion.button
            type="button"
            aria-label="Close navigation"
            variants={overlay}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          />
          <motion.aside
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-y-0 left-0 flex w-72 flex-col border-r bg-card shadow-xl"
          >
            <div className="flex h-14 items-center justify-between border-b px-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <span className="text-sm font-bold tracking-tight">
                  Admin Panel
                </span>
              </div>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AdminSidebar
                collapsed={false}
                onNavigate={() => setOpen(false)}
              />
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
