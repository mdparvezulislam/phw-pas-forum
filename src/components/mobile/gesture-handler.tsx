"use client";

import { motion, type PanInfo, useAnimation } from "framer-motion";
import { MessageSquare, Quote, RefreshCw } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { haptics } from "./haptics-vibrator";

// ─── PULL TO REFRESH ───
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0); // 0 to 1
  const controls = useAnimation();
  const threshold = 80; // pixels to drag to trigger refresh

  const handleDrag = (_: any, info: PanInfo) => {
    if (isRefreshing) return;
    const progress = Math.min(info.offset.y / threshold, 1);
    setPullProgress(Math.max(progress, 0));
  };

  const handleDragEnd = async (_: any, info: PanInfo) => {
    if (isRefreshing) return;

    if (info.offset.y >= threshold) {
      setIsRefreshing(true);
      haptics.notification();
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullProgress(0);
        controls.start({ y: 0 });
      }
    } else {
      setPullProgress(0);
      controls.start({ y: 0 });
    }
  };

  return (
    <div className="relative overflow-hidden w-full h-full">
      {/* Refresh Indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-raised"
        style={{
          height: `${threshold}px`,
          transform: `translateY(${isRefreshing ? 0 : (pullProgress - 1) * threshold}px)`,
          opacity: isRefreshing ? 1 : pullProgress,
          transition: isRefreshing ? "transform 0.2s" : "none",
        }}
      >
        <div className="bg-card border shadow-lg rounded-full p-2.5 flex items-center gap-2 text-primary font-medium text-sm">
          <RefreshCw
            className={cn(
              "h-5 w-5 text-premium",
              isRefreshing && "animate-spin",
            )}
            style={{
              transform: isRefreshing
                ? undefined
                : `rotate(${pullProgress * 360}deg)`,
            }}
          />
          {isRefreshing ? "Refreshing..." : "Pull down to refresh"}
        </div>
      </div>

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.6, bottom: 0 }}
        animate={controls}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}

// ─── SWIPEABLE ITEM (SWIPE TO REPLY / QUOTE) ───
interface SwipeableItemProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void; // Swipe left -> triggers from right
  onSwipeRight?: () => void; // Swipe right -> triggers from left
  leftActionIcon?: React.ReactNode;
  rightActionIcon?: React.ReactNode;
  leftBgColor?: string;
  rightBgColor?: string;
}

export function SwipeableItem({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftActionIcon = <Quote className="h-5 w-5 text-white" />,
  rightActionIcon = <MessageSquare className="h-5 w-5 text-white" />,
  leftBgColor = "bg-premium",
  rightBgColor = "bg-primary",
}: SwipeableItemProps) {
  const controls = useAnimation();
  const [activeAction, setActiveAction] = useState<"left" | "right" | null>(
    null,
  );

  const handleDrag = (_: any, info: PanInfo) => {
    const x = info.offset.x;
    if (x > 60 && onSwipeRight) {
      setActiveAction("left");
    } else if (x < -60 && onSwipeLeft) {
      setActiveAction("right");
    } else {
      setActiveAction(null);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const x = info.offset.x;
    if (x > 100 && onSwipeRight) {
      haptics.success();
      onSwipeRight();
    } else if (x < -100 && onSwipeLeft) {
      haptics.success();
      onSwipeLeft();
    }
    controls.start({ x: 0 });
    setActiveAction(null);
  };

  return (
    <div className="relative overflow-hidden rounded-xl w-full">
      {/* Behind Layer */}
      <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
        {/* Quote slide-in background from Left */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex items-center pl-6 transition-all duration-200",
            leftBgColor,
            activeAction === "left" ? "w-full opacity-100" : "w-16 opacity-30",
          )}
        >
          {leftActionIcon}
        </div>

        {/* Reply slide-in background from Right */}
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex items-center justify-end pr-6 transition-all duration-200",
            rightBgColor,
            activeAction === "right" ? "w-full opacity-100" : "w-16 opacity-30",
          )}
        >
          {rightActionIcon}
        </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{
          left: onSwipeLeft ? -150 : 0,
          right: onSwipeRight ? 150 : 0,
        }}
        dragElastic={{ left: 0.4, right: 0.4 }}
        animate={controls}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className="relative bg-card z-raised border rounded-xl"
      >
        {children}
      </motion.div>
    </div>
  );
}
