import type * as React from "react";
import { cn } from "@/lib/utils";

/* ============================================
   ACTIVITY FEED COMPONENT
   User activity feed items
   ============================================ */

interface ActivityFeedProps extends React.HTMLAttributes<HTMLDivElement> {}

function ActivityFeed({ className, ...props }: ActivityFeedProps) {
  return <div className={cn("space-y-0", className)} {...props} />;
}

interface ActivityItemProps extends React.HTMLAttributes<HTMLDivElement> {}

function ActivityItem({ className, ...props }: ActivityItemProps) {
  return (
    <div
      className={cn(
        "relative flex gap-4 py-4 border-b last:border-0",
        className,
      )}
      {...props}
    />
  );
}

interface ActivityIconProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const iconVariants = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-info/10 text-info",
};

function ActivityIcon({
  className,
  variant = "default",
  children,
  ...props
}: ActivityIconProps) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full shrink-0",
        iconVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface ActivityContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function ActivityContent({ className, ...props }: ActivityContentProps) {
  return <div className={cn("flex-1 min-w-0", className)} {...props} />;
}

interface ActivityDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

function ActivityDescription({
  className,
  ...props
}: ActivityDescriptionProps) {
  return <p className={cn("text-sm", className)} {...props} />;
}

interface ActivityTimeProps extends React.HTMLAttributes<HTMLTimeElement> {}

function ActivityTime({ className, ...props }: ActivityTimeProps) {
  return (
    <time
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  ActivityFeed,
  ActivityItem,
  ActivityIcon,
  ActivityContent,
  ActivityDescription,
  ActivityTime,
};
