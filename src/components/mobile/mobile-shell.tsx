"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BottomNavigation } from "./bottom-navigation";
import { FloatingActionButton } from "./floating-action-button";
import { MobileHeader } from "./mobile-header";
import { OfflineBanner } from "./offline-banner";

interface MobileShellProps {
  session: any | null;
  children: React.ReactNode;
}

export function MobileShell({ session, children }: MobileShellProps) {
  const pathname = usePathname();

  // Hide mobile shell wrappers on auth screens to allow clean edge-to-edge custom sign in pages
  const isAuthPage = pathname.startsWith("/auth/");

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
        {children}
        <OfflineBanner />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background antialiased pb-[calc(4rem+env(safe-area-inset-bottom))]">
      {/* Top Header */}
      <MobileHeader sessionUser={session?.user ?? null} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden pt-[env(safe-area-inset-top)]">
        {/* Simple Page Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="w-full h-full container mx-auto px-4 py-4"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Dynamic FAB */}
      <FloatingActionButton />

      {/* Bottom Nav */}
      <BottomNavigation sessionUser={session?.user ?? null} />

      {/* Offline Status & PWA install promt banner */}
      <OfflineBanner />
    </div>
  );
}
