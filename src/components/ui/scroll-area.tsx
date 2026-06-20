import * as React from "react";
import { cn } from "@/lib/utils";

/* ============================================
   SCROLL AREA COMPONENT
   Custom scrollbar container
   ============================================ */

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both";
  maxHeight?: string | number;
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = "vertical", maxHeight, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative overflow-auto scrollbar-thin",
        orientation === "vertical" && "overflow-y-auto overflow-x-hidden",
        orientation === "horizontal" && "overflow-x-auto overflow-y-hidden",
        orientation === "both" && "overflow-auto",
        className
      )}
      style={{ maxHeight, ...style }}
      {...props}
    >
      {children}
    </div>
  )
);
ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
