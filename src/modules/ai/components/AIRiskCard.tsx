"use client";

import {
  AlertTriangle,
  Ban,
  Check,
  HelpCircle,
  Loader2,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { haptics } from "@/components/mobile/haptics-vibrator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { overrideModerationAction } from "../actions";

interface AIRiskCardProps {
  result: {
    id: string;
    targetId: string;
    targetType: string;
    spamScore: number;
    scamScore: number;
    toxicityScore: number;
    decision: string;
    explanation: string;
    isOverridden: boolean;
  };
  onUpdate?: () => void;
}

export function AIRiskCard({ result, onUpdate }: AIRiskCardProps) {
  const [decision, setDecision] = useState(result.decision);
  const [loading, setLoading] = useState(false);
  const [overridden, setOverridden] = useState(result.isOverridden);

  const handleOverride = async (
    newDecision: "APPROVED" | "FLAGGED" | "BLOCKED",
  ) => {
    haptics.tap();
    setLoading(true);

    const res = await overrideModerationAction(result.id, newDecision);
    setLoading(false);

    if (res.success) {
      haptics.success();
      setDecision(newDecision);
      setOverridden(true);
      onUpdate?.();
    } else {
      haptics.error();
      alert(res.error || "Failed to update decision.");
    }
  };

  const getBadgeStyles = (dec: string) => {
    switch (dec) {
      case "BLOCKED":
        return "bg-danger/10 border-danger/20 text-danger";
      case "QUEUED":
        return "bg-warning/10 border-warning/20 text-warning";
      case "FLAGGED":
        return "bg-info/10 border-info/20 text-info";
      default:
        return "bg-success/10 border-success/20 text-success";
    }
  };

  const maxScore = Math.max(
    result.spamScore,
    result.scamScore,
    result.toxicityScore,
  );

  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm relative overflow-hidden">
      {/* Target header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
            AI Moderation Audit Log
          </span>
          <h4 className="font-bold text-sm text-foreground mt-0.5 capitalize">
            {result.targetType} #{result.targetId.slice(0, 8)}...
          </h4>
        </div>

        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs font-semibold select-none",
            getBadgeStyles(decision),
          )}
        >
          {decision}
        </span>
      </div>

      {/* Scores metrics grid */}
      <div className="grid grid-cols-3 gap-2 py-1 bg-muted/10 rounded-xl p-3 border">
        <ScoreMeter
          label="Toxicity"
          score={result.toxicityScore}
          color="text-red-500"
        />
        <ScoreMeter
          label="Spam"
          score={result.spamScore}
          color="text-yellow-500"
        />
        <ScoreMeter
          label="Scam"
          score={result.scamScore}
          color="text-orange-500"
        />
      </div>

      {/* Explanation text */}
      <div className="text-xs text-muted-foreground leading-relaxed font-sans border rounded-lg p-3 bg-muted/5">
        <span className="font-bold text-foreground block mb-1">AI Reason</span>
        {result.explanation || "No explanation provided."}
      </div>

      {/* Action buttons (Manual overrides) */}
      <div className="flex items-center justify-between pt-2 border-t gap-3 flex-wrap">
        <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
          <Shield className="h-3.5 w-3.5" />
          {overridden ? "Manually Overridden" : "Automated Analysis"}
        </div>

        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <>
              {decision !== "APPROVED" && (
                <Button
                  onClick={() => handleOverride("APPROVED")}
                  variant="outline"
                  size="sm"
                  className="h-8 text-[11px] rounded-full border-success/35 text-success hover:bg-success/5"
                >
                  <Check className="h-3.5 w-3.5 mr-1" /> Approve
                </Button>
              )}
              {decision !== "BLOCKED" && (
                <Button
                  onClick={() => handleOverride("BLOCKED")}
                  variant="outline"
                  size="sm"
                  className="h-8 text-[11px] rounded-full border-danger/35 text-danger hover:bg-danger/5"
                >
                  <Ban className="h-3.5 w-3.5 mr-1" /> Block
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreMeter({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  return (
    <div className="text-center font-sans">
      <span className="text-[10px] text-muted-foreground block font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className={cn("text-base font-bold block mt-0.5", color)}>
        {score}%
      </span>
      <div className="h-1 w-full bg-muted rounded-full mt-1.5 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full",
            score >= 70
              ? "bg-red-500"
              : score >= 40
                ? "bg-yellow-500"
                : "bg-green-500",
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
