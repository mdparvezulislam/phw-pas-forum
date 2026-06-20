import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MessageSquare,
  AlertCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { cn, formatDateRelative } from "@/lib/utils";

interface TimelineEvent {
  status: string;
  timestamp: Date | string;
  message?: string | null;
  actor?: string | null;
}

interface OrderTimelineProps {
  events: TimelineEvent[];
  currentStatus: string;
  className?: string;
}

const statusConfig: Record<
  string,
  {
    icon: typeof CheckCircle2;
    color: string;
    bg: string;
    label: string;
  }
> = {
  PENDING: {
    icon: Clock,
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-500/10",
    label: "Order Placed",
  },
  ACCEPTED: {
    icon: CheckCircle2,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    label: "Accepted",
  },
  IN_PROGRESS: {
    icon: Package,
    color: "text-primary",
    bg: "bg-primary/10",
    label: "In Progress",
  },
  DELIVERED: {
    icon: Truck,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    label: "Delivered",
  },
  REVISION: {
    icon: RotateCcw,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
    label: "Revision Requested",
  },
  COMPLETED: {
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    label: "Completed",
  },
  CANCELLED: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    label: "Cancelled",
  },
  DISPUTED: {
    icon: AlertCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    label: "Disputed",
  },
};

export function OrderTimeline({
  events,
  currentStatus,
  className,
}: OrderTimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {events.map((event, i) => {
        const config =
          statusConfig[event.status] ?? statusConfig.PENDING;
        const Icon = config.icon;
        const isLast = i === events.length - 1;
        const isCurrent = event.status === currentStatus;

        return (
          <div key={i} className="flex gap-3">
            {/* Line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  config.bg,
                  isCurrent && "ring-2 ring-primary/20",
                )}
              >
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>
              {!isLast && (
                <div className="w-px flex-1 bg-border" />
              )}
            </div>

            {/* Content */}
            <div className={cn("pb-6", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  isCurrent && "text-foreground",
                  !isCurrent && "text-muted-foreground",
                )}
              >
                {config.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDateRelative(event.timestamp)}
              </p>
              {event.message && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {event.message}
                </p>
              )}
              {event.actor && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  by {event.actor}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
