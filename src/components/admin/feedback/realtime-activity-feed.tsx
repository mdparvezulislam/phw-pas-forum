"use client";

import { motion } from "framer-motion";
import {
  UserPlus,
  ShoppingCart,
  Store,
  Flag,
  CreditCard,
  ShieldCheck,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type ActivityType =
  | "registration"
  | "order"
  | "listing"
  | "report"
  | "membership"
  | "moderation"
  | "generic";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  time: string;
  href?: string;
}

const typeMeta: Record<
  ActivityType,
  { icon: LucideIcon; ring: string; bg: string }
> = {
  registration: { icon: UserPlus, ring: "text-info", bg: "bg-info/10" },
  order: { icon: ShoppingCart, ring: "text-success", bg: "bg-success/10" },
  listing: { icon: Store, ring: "text-marketplace", bg: "bg-marketplace/10" },
  report: { icon: Flag, ring: "text-danger", bg: "bg-danger/10" },
  membership: { icon: CreditCard, ring: "text-premium", bg: "bg-premium/10" },
  moderation: {
    icon: ShieldCheck,
    ring: "text-moderator",
    bg: "bg-moderator/10",
  },
  generic: { icon: Activity, ring: "text-muted-foreground", bg: "bg-muted" },
};

export function RealtimeActivityFeed({
  items,
  emptyLabel = "No recent activity.",
  className,
}: {
  items: ActivityEntry[];
  emptyLabel?: string;
  className?: string;
}) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }

  return (
    <motion.ul
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={cn("space-y-1", className)}
    >
      {items.map((item) => {
        const meta = typeMeta[item.type];
        const Icon = meta.icon;
        const Wrapper = item.href ? "a" : "div";
        return (
          <motion.li key={item.id} variants={staggerItem}>
            <Wrapper
              {...(item.href ? { href: item.href } : {})}
              className={cn(
                "flex items-start gap-3 rounded-lg px-2 py-2 transition-colors",
                item.href && "hover:bg-accent",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  meta.bg,
                  meta.ring,
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                {item.description && (
                  <p className="truncate text-xs text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
              <time className="shrink-0 text-xs text-muted-foreground">
                {item.time}
              </time>
            </Wrapper>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
