import * as React from "react";
import { cn } from "@/lib/utils";

/* ============================================
   TIMELINE COMPONENT
   Activity and event timelines
   ============================================ */

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {}

function Timeline({ className, ...props }: TimelineProps) {
  return (
    <div className={cn("space-y-0", className)} {...props} />
  );
}

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  isLast?: boolean;
}

function TimelineItem({ className, isLast = false, ...props }: TimelineItemProps) {
  return (
    <div
      className={cn(
        "relative flex gap-4",
        !isLast && "pb-8",
        className
      )}
      {...props}
    />
  );
}

interface TimelineDotProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const dotVariants = {
  default: "bg-muted-foreground",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

function TimelineDot({ className, variant = "default", ...props }: TimelineDotProps) {
  return (
    <div className="relative flex-shrink-0">
      <div
        className={cn(
          "h-3 w-3 rounded-full border-2 border-background",
          dotVariants[variant],
          className
        )}
        {...props}
      />
    </div>
  );
}

function TimelineConnector({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute left-[5px] top-3 h-full w-px bg-border",
        className
      )}
    />
  );
}

interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function TimelineContent({ className, ...props }: TimelineContentProps) {
  return (
    <div className={cn("flex-1 min-w-0", className)} {...props} />
  );
}

interface TimelineHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

function TimelineHeader({ className, ...props }: TimelineHeaderProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props} />
  );
}

interface TimelineTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

function TimelineTitle({ className, ...props }: TimelineTitleProps) {
  return (
    <h4
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
}

interface TimelineTimeProps extends React.HTMLAttributes<HTMLTimeElement> {}

function TimelineTime({ className, ...props }: TimelineTimeProps) {
  return (
    <time
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

interface TimelineBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

function TimelineBody({ className, ...props }: TimelineBodyProps) {
  return (
    <div
      className={cn("mt-2 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Timeline,
  TimelineItem,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineHeader,
  TimelineTitle,
  TimelineTime,
  TimelineBody,
};
