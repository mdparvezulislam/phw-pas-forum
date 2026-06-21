"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Award } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { scaleInBounce } from "@/lib/motion";

/* ============================================
   ACHIEVEMENT MODAL
   Celebration modal for unlocking achievements
   ============================================ */

interface AchievementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  icon?: ReactNode;
  badge?: { name: string; icon: string; color: string };
  xpReward?: number;
}

const CONFETTI_COLORS = [
  "bg-primary",
  "bg-success",
  "bg-warning",
  "bg-info",
  "bg-premium",
  "bg-amber-400",
  "bg-emerald-400",
  "bg-sky-400",
];

interface ConfettiParticle {
  id: number;
  color: string;
  size: number;
  angle: number;
  distance: number;
  delay: number;
  duration: number;
}

function generateConfettiParticles(): ConfettiParticle[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 5 + Math.floor(Math.random() * 4),
    angle: (Math.PI * 2 * i) / 10,
    distance: 100 + Math.random() * 120,
    delay: Math.random() * 0.2,
    duration: 0.6 + Math.random() * 0.8,
  }));
}

function XpCounter({ xp }: { xp: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (xp <= 0) return;

    const step = Math.max(1, Math.floor(xp / 20));
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev + step >= xp) {
          clearInterval(interval);
          return xp;
        }
        return prev + step;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [xp]);

  return (
    <span className="font-mono text-lg font-bold text-amber-400">
      +{count.toLocaleString()} XP
    </span>
  );
}

export function AchievementModal({
  open,
  onOpenChange,
  title,
  description,
  icon,
  badge,
  xpReward,
}: AchievementModalProps) {
  const particles = useMemo(() => generateConfettiParticles(), []);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
          />

          <motion.div
            className={cn(
              "relative z-50 mx-4 w-full max-w-sm overflow-hidden rounded-2xl",
              "border border-white/10 bg-gradient-to-b from-white/10 to-white/5",
              "shadow-2xl shadow-primary/20 backdrop-blur-xl",
            )}
            variants={scaleInBounce}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  className={cn("absolute rounded-full", p.color)}
                  style={{
                    width: p.size,
                    height: p.size,
                    left: "50%",
                    top: "40%",
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(p.angle) * p.distance,
                    y: Math.sin(p.angle) * p.distance,
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay + 0.3,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>

            <div className="relative flex flex-col items-center px-6 pt-10 pb-8 text-center">
              <motion.div
                className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/10 ring-2 ring-amber-500/40"
                animate={{
                  boxShadow: [
                    "0 0 20px 4px rgba(245,158,11,0.3)",
                    "0 0 40px 8px rgba(245,158,11,0.5)",
                    "0 0 20px 4px rgba(245,158,11,0.3)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="text-amber-400"
                >
                  {icon || <Award className="h-10 w-10" strokeWidth={1.5} />}
                </motion.div>
              </motion.div>

              {badge && (
                <Badge
                  className="mb-3"
                  style={{
                    backgroundColor: badge.color + "20",
                    color: badge.color,
                    borderColor: badge.color + "40",
                  }}
                >
                  {badge.icon} {badge.name}
                </Badge>
              )}

              <h2 className="mb-2 bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-2xl font-bold text-transparent">
                {title}
              </h2>

              <p className="mb-6 max-w-[280px] text-sm text-muted-foreground">
                {description}
              </p>

              {xpReward && xpReward > 0 && (
                <motion.div
                  className="mb-6 flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <XpCounter xp={xpReward} />
                </motion.div>
              )}

              <Button
                variant="gradient"
                size="lg"
                onClick={() => onOpenChange(false)}
                className="rounded-full px-8"
              >
                Awesome!
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
