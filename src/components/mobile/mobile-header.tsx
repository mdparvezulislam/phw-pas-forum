"use client";

import { Bell, Search, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { haptics } from "./haptics-vibrator";
import { MobileSearch } from "./mobile-search";

interface MobileHeaderProps {
  sessionUser: any | null;
  notificationCount?: number;
}

export function MobileHeader({
  sessionUser,
  notificationCount = 0,
}: MobileHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isAuthenticated = !!sessionUser;

  const handleSearchClick = () => {
    haptics.tap();
    setIsSearchOpen(true);
  };

  const handleNotificationClick = () => {
    haptics.tap();
  };

  return (
    <header className="sticky top-0 z-sticky flex h-14 w-full items-center justify-between border-b bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* Brand Logo */}
      <Link
        href="/"
        onClick={() => haptics.tap()}
        className="flex items-center gap-1.5 font-bold tracking-tight text-foreground select-none"
      >
        BHW
        <span className="text-premium font-extrabold text-[15px] tracking-wide">
          PAS
        </span>
      </Link>

      {/* Header Actions */}
      <div className="flex items-center gap-2">
        {/* Search Trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSearchClick}
          className="h-9 w-9 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
          aria-label="Open search"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        {isAuthenticated && (
          <Link href="/notifications" onClick={handleNotificationClick}>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
              aria-label="View notifications"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-card animate-pulse-glow">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </Button>
          </Link>
        )}

        {/* Profile Avatar / Login Button */}
        {isAuthenticated ? (
          <Link
            href={`/profile/${sessionUser?.username}`}
            onClick={() => haptics.tap()}
          >
            <Avatar
              className="h-8 w-8 border hover:opacity-90 transition-opacity"
              src={sessionUser?.image}
              alt={sessionUser?.displayName ?? "User"}
              fallback={
                sessionUser?.displayName?.[0] ??
                sessionUser?.username?.[0] ??
                "?"
              }
              size="sm"
            />
          </Link>
        ) : (
          <Link href="/auth/login" onClick={() => haptics.tap()}>
            <Button
              size="sm"
              className="h-8 rounded-full text-xs font-semibold"
            >
              Sign In
            </Button>
          </Link>
        )}
      </div>

      {/* Full Screen Mobile Search Modal */}
      <MobileSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
}
