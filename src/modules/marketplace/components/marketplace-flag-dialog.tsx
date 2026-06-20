"use client";

import { useState } from "react";
import { reportListingAction } from "../actions/moderation";
import { Flag, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import type { MarketplaceFlagReason } from "@/db/schema/marketplace-flags";

interface MarketplaceFlagDialogProps {
  listingId: string;
}

export function MarketplaceFlagDialog({ listingId }: MarketplaceFlagDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<MarketplaceFlagReason>("SPAM");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await reportListingAction(listingId, reason, notes);
    setLoading(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setNotes("");
      }, 1500);
    } else {
      setError(res.error || "Failed to submit report");
    }
  };

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/5 py-1 px-3 rounded-lg"
      >
        <Flag className="w-3.5 h-3.5" />
        Report Listing
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md border rounded-2xl bg-card p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
        <h3 className="text-base font-bold mb-1 flex items-center gap-2 text-rose-500">
          <Flag className="w-4 h-4" />
          Report Marketplace Listing
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Submitting a report alerts moderators of potential policy violations.
        </p>

        {success ? (
          <div className="py-6 text-center text-sm font-semibold text-emerald-400 animate-pulse">
            Report submitted successfully!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Reason for Report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as MarketplaceFlagReason)}
                className="w-full text-xs p-3 border rounded-xl bg-background focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="SPAM">Spam Content</option>
                <option value="FRAUD">Fraud / Scam Suspicion</option>
                <option value="MISLEADING">Misleading Information</option>
                <option value="COPYRIGHT">Copyright Infringement</option>
                <option value="DUPLICATE">Duplicate Submission</option>
                <option value="OTHER">Other Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe why this listing violates policies..."
                className="w-full text-xs p-3 border rounded-xl bg-background focus:outline-none focus:ring-1 focus:ring-rose-500 min-h-[80px]"
              />
            </div>

            <div className="flex gap-2 justify-end border-t pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-rose-600 hover:bg-rose-500 text-white border-0 px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
              >
                {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                Submit Report
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
