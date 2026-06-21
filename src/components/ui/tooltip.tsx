import * as React from "react";
import { cn } from "@/lib/utils";

/* ============================================
   TOOLTIP COMPONENT
   Hover tooltips with animations
   ============================================ */

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  delayDuration?: number;
}

let tooltipCounter = 0;

function Tooltip({
  content,
  children,
  side = "top",
  className,
  delayDuration = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout>(undefined);
  const [tooltipId] = React.useState(() => `tooltip-${++tooltipCounter}`);

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();

    let x = 0;
    let y = 0;

    switch (side) {
      case "top":
        x = trigger.left + trigger.width / 2 - tooltip.width / 2;
        y = trigger.top - tooltip.height - 8;
        break;
      case "bottom":
        x = trigger.left + trigger.width / 2 - tooltip.width / 2;
        y = trigger.bottom + 8;
        break;
      case "left":
        x = trigger.left - tooltip.width - 8;
        y = trigger.top + trigger.height / 2 - tooltip.height / 2;
        break;
      case "right":
        x = trigger.right + 8;
        y = trigger.top + trigger.height / 2 - tooltip.height / 2;
        break;
    }

    setPosition({ x, y });
  }, [side]);

  const show = React.useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      requestAnimationFrame(updatePosition);
    }, delayDuration);
  }, [delayDuration, updatePosition]);

  const hide = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-describedby={isVisible ? tooltipId : undefined}
        className="inline-flex"
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={cn(
            "fixed z-tooltip animate-in fade-in-0 zoom-in-95",
            "rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md",
            "pointer-events-none",
            className,
          )}
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}

export { Tooltip };
