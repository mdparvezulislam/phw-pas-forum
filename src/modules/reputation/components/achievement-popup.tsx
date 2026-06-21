"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AchievementPopupProps {
  title: string;
  description?: string;
  icon: string;
  type: "badge" | "trophy" | "level";
  show: boolean;
  onClose: () => void;
}

export function AchievementPopup({
  title,
  description,
  icon,
  type,
  show,
  onClose,
}: AchievementPopupProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const typeStyles = {
    badge: "border-blue-500/30 bg-blue-500/5",
    trophy: "border-amber-500/30 bg-amber-500/5",
    level: "border-purple-500/30 bg-purple-500/5",
  };

  const typeLabels = {
    badge: "Badge Earned!",
    trophy: "Trophy Unlocked!",
    level: "Level Up!",
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className={`fixed bottom-6 right-6 z-50 rounded-lg border p-4 shadow-lg ${typeStyles[type]}`}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-xl shadow-sm">
              {icon}
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {typeLabels[type]}
              </div>
              <div className="text-sm font-bold">{title}</div>
              {description && (
                <div className="text-xs text-muted-foreground">
                  {description}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="ml-2 rounded-full p-1 text-muted-foreground hover:bg-accent"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
