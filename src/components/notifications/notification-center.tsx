"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  AtSign,
  Award,
  Bell,
  Check,
  CheckCheck,
  Heart,
  MessageSquare,
  Shield,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDateRelative } from "@/lib/utils";
import { dropdown, staggerContainer, staggerItem } from "@/lib/motion";

/* ============================================
   TYPES
   ============================================ */

export type NotificationType =
  | "reply"
  | "mention"
  | "reaction"
  | "order"
  | "badge"
  | "system"
  | "warning"
  | "moderation";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: Date | string;
  read: boolean;
  href?: string;
  icon?: React.ReactNode;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

/* ============================================
   ICON & VARIANT MAP
   ============================================ */

const NOTIFICATION_ICON_MAP: Record<
  NotificationType,
  {
    icon: typeof Bell;
    variant:
      | "default"
      | "info"
      | "success"
      | "warning"
      | "destructive"
      | "secondary";
  }
> = {
  reply: { icon: MessageSquare, variant: "info" },
  mention: { icon: AtSign, variant: "info" },
  reaction: { icon: Heart, variant: "success" },
  order: { icon: ShoppingCart, variant: "secondary" },
  badge: { icon: Award, variant: "default" },
  system: { icon: Bell, variant: "default" },
  warning: { icon: AlertTriangle, variant: "warning" },
  moderation: { icon: Shield, variant: "destructive" },
};

/* ============================================
   TIME GROUPING
   ============================================ */

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function isYesterday(date: Date): boolean {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

type TimeGroup = "Today" | "Yesterday" | "Earlier";

function groupNotifications(
  notifications: Notification[],
): Record<TimeGroup, Notification[]> {
  const groups: Record<TimeGroup, Notification[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };

  for (const notification of notifications) {
    const date = new Date(notification.time);
    if (isToday(date)) {
      groups.Today.push(notification);
    } else if (isYesterday(date)) {
      groups.Yesterday.push(notification);
    } else {
      groups.Earlier.push(notification);
    }
  }

  return groups;
}

/* ============================================
   NOTIFICATION ITEM COMPONENT
   ============================================ */

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
}) {
  const config =
    NOTIFICATION_ICON_MAP[notification.type] ?? NOTIFICATION_ICON_MAP.system;
  const IconComponent = config.icon;

  const content = (
    <motion.div
      variants={staggerItem}
      className={cn(
        "group flex items-start gap-3 rounded-lg px-3 py-3 transition-colors",
        notification.read
          ? "hover:bg-muted/50"
          : "bg-muted/30 hover:bg-muted/50",
        notification.href && "cursor-pointer",
      )}
      onClick={() => {
        if (!notification.read) {
          onMarkRead(notification.id);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!notification.read) {
            onMarkRead(notification.id);
          }
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${notification.title}: ${notification.description}`}
    >
      {/* Icon */}
      <div className="relative flex-shrink-0">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full",
            "bg-muted",
          )}
        >
          {notification.icon ?? (
            <IconComponent className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        {!notification.read && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-blue-500"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm leading-tight",
            notification.read
              ? "text-muted-foreground"
              : "font-medium text-foreground",
          )}
        >
          {notification.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {notification.description}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground/70">
          {formatDateRelative(notification.time)}
        </p>
      </div>

      {/* Read indicator */}
      {!notification.read && (
        <div className="flex-shrink-0 self-center">
          <Badge variant={config.variant} size="sm" className="capitalize">
            {notification.type}
          </Badge>
        </div>
      )}
    </motion.div>
  );

  if (notification.href) {
    return (
      <Link
        href={notification.href}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
      >
        {content}
      </Link>
    );
  }

  return content;
}

/* ============================================
   EMPTY STATE
   ============================================ */

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 px-6"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Bell className="h-7 w-7 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        No notifications yet
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70 text-center max-w-[200px]">
        When you get notifications, they&apos;ll show up here
      </p>
    </motion.div>
  );
}

/* ============================================
   MAIN COMPONENT
   ============================================ */

export function NotificationCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const grouped = groupNotifications(notifications);
  const hasNotifications = notifications.length > 0;

  /* Close on click outside */
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  /* Close on Escape */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, handleClickOutside, handleKeyDown]);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const timeGroupLabels: { key: TimeGroup; label: string }[] = [
    { key: "Today", label: "Today" },
    { key: "Yesterday", label: "Yesterday" },
    { key: "Earlier", label: "Earlier" },
  ];

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <motion.button
        ref={buttonRef}
        onClick={toggleOpen}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
          isOpen
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        whileTap={{ scale: 0.95 }}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <motion.div
          variants={dropdown}
          initial="hidden"
          animate={
            unreadCount > 0
              ? { rotate: [0, 15, -15, 10, -10, 5, -5, 0] }
              : "idle"
          }
          transition={unreadCount > 0 ? { duration: 0.5 } : undefined}
        >
          <Bell className="h-5 w-5" />
        </motion.div>

        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-sm"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdown}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "absolute right-0 top-full z-50 mt-2 w-[380px] overflow-hidden",
              "rounded-xl border bg-background shadow-2xl",
              "sm:w-[400px]",
            )}
            role="dialog"
            aria-label="Notification center"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">Notifications</h2>
                {unreadCount > 0 && (
                  <Badge variant="info" size="sm">
                    {unreadCount}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkAllRead}
                    className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </Button>
                )}
                {hasNotifications && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClearAll}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    aria-label="Clear all notifications"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[420px] overflow-y-auto overscroll-contain">
              {hasNotifications ? (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="p-2"
                >
                  {timeGroupLabels.map(({ key, label }) => {
                    const items = grouped[key];
                    if (items.length === 0) return null;

                    return (
                      <div key={key} className="mb-2">
                        <motion.p
                          variants={staggerItem}
                          className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60"
                        >
                          {label}
                        </motion.p>
                        <div className="space-y-0.5">
                          {items.map((notification) => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                              onMarkRead={onMarkRead}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              ) : (
                <EmptyState />
              )}
            </div>

            {/* Footer */}
            {hasNotifications && (
              <div className="border-t px-4 py-2.5">
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
