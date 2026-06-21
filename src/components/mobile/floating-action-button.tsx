"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  FilePlus2,
  MessageSquareCode,
  MessageSquarePlus,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { haptics } from "./haptics-vibrator";

export function FloatingActionButton() {
  const pathname = usePathname();

  // Determine FAB configuration based on the pathname
  const getFABConfig = () => {
    // 1. Forum pages (Subforum view)
    const forumRegex = /^\/forums\/([^/]+)\/([^/]+)$/;
    if (forumRegex.test(pathname)) {
      return {
        href: `${pathname}/new`,
        label: "Create Thread",
        icon: MessageSquarePlus,
      };
    }

    // 2. Marketplace root or category views
    if (pathname.startsWith("/marketplace")) {
      return {
        href: "/seller/listings/new",
        label: "Create Listing",
        icon: FilePlus2,
      };
    }

    // 3. Message/Conversations views
    if (pathname.startsWith("/conversations")) {
      return {
        href: "/conversations/new", // or some path that launches new chat
        label: "New Conversation",
        icon: MessageSquareCode,
      };
    }

    return null;
  };

  const config = getFABConfig();

  return (
    <AnimatePresence>
      {config && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-sticky"
        >
          <Link
            href={config.href}
            onClick={() => haptics.tap()}
            aria-label={config.label}
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-premium text-white shadow-2xl hover:bg-premium/90 border border-premium-foreground/10 outline-none"
            >
              <config.icon className="h-6 w-6 stroke-[2.2]" />
            </motion.button>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
