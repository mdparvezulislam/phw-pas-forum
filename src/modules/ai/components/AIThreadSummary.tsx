"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { haptics } from "@/components/mobile/haptics-vibrator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getThreadSummaryAction } from "../actions";

interface AIThreadSummaryProps {
  threadId: string;
  replyCount: number;
}

export function AIThreadSummary({
  threadId,
  replyCount,
}: AIThreadSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Summaries are only active for discussions with replies to ensure quality
  const isEligible = replyCount >= 2;

  if (!isEligible) return null;

  const handleToggle = async () => {
    haptics.tap();
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && !summary) {
      setLoading(true);
      setError(null);
      const res = await getThreadSummaryAction(threadId);
      setLoading(false);
      if (res.success && res.summary) {
        haptics.notification();
        setSummary(res.summary);
      } else {
        haptics.error();
        setError(res.error || "Failed to generate summary.");
      }
    }
  };

  return (
    <div className="rounded-xl border bg-card/65 backdrop-blur-md overflow-hidden shadow-sm mb-4">
      {/* Summary Header */}
      <button
        onClick={handleToggle}
        className="flex w-full items-center justify-between p-4 hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-premium/15 text-premium">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 leading-none">
              AI Thread Digest
            </span>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Synthesize discussion key insights instantly
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Summary Content Body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t bg-muted/5 font-sans"
          >
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-6 gap-2 text-xs text-muted-foreground font-medium">
                  <Loader2 className="h-4 w-4 animate-spin text-premium" />
                  Generating summary...
                </div>
              ) : error ? (
                <p className="text-xs text-danger">{error}</p>
              ) : (
                <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                  {summary}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
