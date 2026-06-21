"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Lightbulb,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { haptics } from "@/components/mobile/haptics-vibrator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { enhanceListingAction } from "../actions";

interface SellerCopilotProps {
  title: string;
  description: string;
  category: string;
  price: number; // in dollars
  onSelectTitle?: (newTitle: string) => void;
  onSelectPackages?: (packages: string) => void;
}

export function SellerCopilot({
  title,
  description,
  category,
  price,
  onSelectTitle,
  onSelectPackages,
}: SellerCopilotProps) {
  const [suggestions, setSuggestions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnhance = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Please fill out both Title and Description before scanning.");
      return;
    }

    haptics.tap();
    setLoading(true);
    setError(null);

    const res = await enhanceListingAction({
      title,
      description,
      category,
      priceCents: Math.round(price * 100),
    });

    setLoading(false);
    if (res.success && res.suggestions) {
      haptics.success();
      setSuggestions(res.suggestions);
    } else {
      haptics.error();
      setError(res.error || "Failed to fetch suggestions.");
    }
  };

  return (
    <div className="rounded-2xl border bg-card/45 backdrop-blur-xl p-5 shadow-xl relative overflow-hidden before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-br before:from-premium/15 before:to-transparent before:pointer-events-none">
      {/* Copilot Header */}
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-premium/10 text-premium">
            <Sparkles className="h-5 w-5 animate-pulse-glow" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
              Seller Copilot{" "}
              <span className="text-[10px] bg-premium/10 text-premium px-1.5 py-0.5 rounded-full font-semibold">
                AI Gated
              </span>
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Optimize copy, pricing tiers, and search visibility
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleEnhance}
          disabled={loading}
          className="bg-premium hover:bg-premium/90 text-white h-8 text-xs font-semibold rounded-full"
        >
          {loading ? "Analyzing..." : "AI Assist"}
        </Button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-danger/10 p-3 text-xs text-danger">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Suggested Copy Panel */}
      <AnimatePresence mode="wait">
        {suggestions ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 text-sm"
          >
            {/* Title Suggestions */}
            {suggestions.titleSuggestions?.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Recommended Titles
                </span>
                <div className="space-y-1.5">
                  {suggestions.titleSuggestions.map(
                    (item: string, i: number) => (
                      <div
                        key={i}
                        onClick={() => {
                          haptics.tap();
                          onSelectTitle?.(item);
                        }}
                        className="flex items-center justify-between gap-3 rounded-lg border bg-background/50 hover:bg-premium/5 p-2.5 cursor-pointer text-xs transition-colors hover:border-premium/25"
                      >
                        <span className="font-medium truncate">{item}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Description Copywriting Feedback */}
            <div className="rounded-xl border bg-muted/20 p-3 text-xs space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-foreground text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-yellow-500 shrink-0" />{" "}
                Copy Critique
              </span>
              <p className="text-muted-foreground leading-relaxed font-sans">
                {suggestions.descriptionFeedback}
              </p>
            </div>

            {/* SEO Improvements */}
            {suggestions.seoImprovements && (
              <div className="rounded-xl border bg-muted/20 p-3 text-xs space-y-1.5">
                <span className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                  SEO Audit Notes
                </span>
                <p className="text-muted-foreground leading-relaxed font-sans">
                  {suggestions.seoImprovements}
                </p>
              </div>
            )}

            {/* Packages suggestions */}
            {suggestions.suggestedPackages && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Suggested Tiers
                </span>
                <div
                  onClick={() => {
                    haptics.tap();
                    onSelectPackages?.(suggestions.suggestedPackages);
                  }}
                  className="rounded-xl border bg-background/50 p-3 text-xs hover:border-premium/25 cursor-pointer flex justify-between items-center transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <ShoppingBag className="h-4.5 w-4.5 text-premium shrink-0 mt-0.5" />
                    <p className="text-muted-foreground leading-relaxed truncate font-sans">
                      {suggestions.suggestedPackages}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                </div>
              </div>
            )}

            {/* FAQs Suggestions */}
            {suggestions.faqSuggestions?.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  FAQ Boilerplates
                </span>
                <div className="space-y-2">
                  {suggestions.faqSuggestions.map((faq: any, i: number) => (
                    <div
                      key={i}
                      className="rounded-lg border bg-background/50 p-2.5 text-xs font-sans"
                    >
                      <p className="font-semibold text-foreground">
                        Q: {faq.question}
                      </p>
                      <p className="text-muted-foreground mt-1">
                        A: {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground"
          >
            <Sparkles className="h-8 w-8 text-premium/20 mb-2 animate-bounce-subtle" />
            <p className="text-xs">
              Fill out details above and click AI Assist to scan copy
              diagnostics.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
