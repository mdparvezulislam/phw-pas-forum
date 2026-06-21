"use client";

import { motion } from "framer-motion";
import {
  Home,
  LogIn,
  MessageCircle,
  MessageSquare,
  ShoppingBag,
  User,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { haptics } from "./haptics-vibrator";

interface BottomNavigationProps {
  sessionUser: any | null;
}

export function BottomNavigation({ sessionUser }: BottomNavigationProps) {
  const pathname = usePathname();
  const isAuthenticated = !!sessionUser;

  // Define nav items dynamically based on auth state
  const navItems = isAuthenticated
    ? [
        { label: "Home", href: "/", icon: Home },
        { label: "Forums", href: "/forums", icon: MessageSquare },
        { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
        { label: "Messages", href: "/conversations", icon: MessageCircle },
        {
          label: "Profile",
          href: `/profile/${sessionUser?.username}`,
          icon: User,
        },
      ]
    : [
        { label: "Home", href: "/", icon: Home },
        { label: "Forums", href: "/forums", icon: MessageSquare },
        { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
        { label: "Sign In", href: "/auth/login", icon: LogIn },
        { label: "Join", href: "/auth/register", icon: UserPlus },
      ];

  const handleTabClick = () => {
    haptics.tap();
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-sticky border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-2xl">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          // Check if path matches (strict match for "/", prefix match for others)
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleTabClick}
              className="relative flex flex-1 flex-col items-center justify-center py-2 text-muted-foreground transition-colors hover:text-foreground outline-none"
            >
              {/* Highlight background sliding animation */}
              {isActive && (
                <motion.div
                  layoutId="active-nav-bg"
                  className="absolute inset-x-4 inset-y-1.5 -z-10 rounded-xl bg-accent/80"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {/* Icon Container with pop-up transition */}
              <motion.div
                animate={isActive ? { scale: 1.12, y: -2 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "flex h-6 w-6 items-center justify-center",
                  isActive ? "text-primary font-bold" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>

              {/* Label */}
              <span
                className={cn(
                  "mt-1 text-[10px] tracking-wide font-medium leading-none select-none transition-all duration-200",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>

              {/* Optional Active Dot Indicator */}
              {isActive && (
                <motion.div
                  layoutId="active-dot"
                  className="absolute bottom-1.5 h-1 w-1 rounded-full bg-premium"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
