"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Star, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { scaleInBounce, staggerContainer, staggerItem } from "@/lib/motion";

/* ============================================
   LEVEL UP MODAL
   Celebration modal for reaching a new level
   ============================================ */

interface LevelUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newLevel: number;
  previousLevel?: number;
  xpRequired?: number;
  currentXp?: number;
}

const LEVEL_BENEFITS: Record<number, string[]> = {
  1: ["Access to community forums", "Create your profile"],
  5: ["Create threads", "Unlock custom titles"],
  10: ["Access to premium forums", "Custom avatar borders"],
  15: ["Priority support access", "Exclusive badge"],
  20: ["Marketplace access", "Seller profile unlocked"],
  25: ["Premium badge", "Custom profile themes"],
  30: ["Moderator nomination eligibility", "VIP lounge access"],
};

function getBenefitsForLevel(level: number): string[] {
  const allBenefits: string[] = [];
  for (const [threshold, benefits] of Object.entries(LEVEL_BENEFITS)) {
    if (level >= Number(threshold)) {
      allBenefits.push(...benefits);
    }
  }
  return allBenefits.slice(-3);
}

function LevelNumber({ level }: { level: number }) {
  const [displayLevel, setDisplayLevel] = useState(level - 1);

  useEffect(() => {
    if (displayLevel >= level) return;

    const timer = setTimeout(() => {
      setDisplayLevel((prev) => Math.min(prev + 1, level));
    }, 80);

    return () => clearTimeout(timer);
  }, [displayLevel, level]);

  return (
    <motion.div
      className="relative flex h-24 w-24 items-center justify-center"
      variants={scaleInBounce}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 ring-2 ring-primary/50"
        animate={{
          boxShadow: [
            "0 0 20px 6px rgba(99,102,241,0.3)",
            "0 0 50px 12px rgba(99,102,241,0.5)",
            "0 0 20px 6px rgba(99,102,241,0.3)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <span className="relative z-10 font-mono text-4xl font-bold text-primary">
        {displayLevel}
      </span>
    </motion.div>
  );
}

function ProgressBar({
  current,
  required,
}: {
  current: number;
  required: number;
}) {
  const [progress, setProgress] = useState(0);
  const targetPercent =
    required > 0 ? Math.min((current / required) * 100, 100) : 0;

  useEffect(() => {
    const timer = setTimeout(() => setProgress(targetPercent), 100);
    return () => clearTimeout(timer);
  }, [targetPercent]);

  return (
    <div className="w-full max-w-xs">
      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>
          {current.toLocaleString()} / {required.toLocaleString()} XP
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function SparkleDecoration() {
  const sparkles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 12 + Math.random() * 10,
        delay: Math.random() * 2,
        duration: 1.5 + Math.random() * 1,
      })),
    [],
  );

  return (
    <>
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="pointer-events-none absolute text-primary/40"
          style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: s.size }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.2, 0.8],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <Star className="fill-current" />
        </motion.div>
      ))}
    </>
  );
}

export function LevelUpModal({
  open,
  onOpenChange,
  newLevel,
  previousLevel = 1,
  xpRequired = 1000,
  currentXp = 0,
}: LevelUpModalProps) {
  const benefits = getBenefitsForLevel(newLevel);

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
            <SparkleDecoration />

            <div className="relative flex flex-col items-center px-6 pt-10 pb-8 text-center">
              <LevelNumber level={newLevel} />

              <motion.h2
                className="mt-4 mb-2 bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-3xl font-bold text-transparent"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                Level Up!
              </motion.h2>

              <motion.p
                className="mb-6 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                You reached level {newLevel}
                {previousLevel < newLevel && ` (was level ${previousLevel})`}
              </motion.p>

              {xpRequired > 0 && (
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <ProgressBar current={currentXp} required={xpRequired} />
                </motion.div>
              )}

              {benefits.length > 0 && (
                <motion.div
                  className="mb-6 w-full max-w-xs"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Unlocked Benefits
                  </h3>
                  <div className="space-y-2">
                    {benefits.map((benefit) => (
                      <motion.div
                        key={benefit}
                        variants={staggerItem}
                        className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm"
                      >
                        <Check className="h-4 w-4 shrink-0 text-success" />
                        <span>{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full px-8"
                  icon={<Sparkles className="h-4 w-4" />}
                >
                  Continue
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
