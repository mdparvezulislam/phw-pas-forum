"use client";

import { AlertCircle, Check, Edit3, Loader2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";
import { reviewSubmissionAction } from "../actions/moderation";

interface ApprovalPanelProps {
  submissionId: string;
  onSuccess?: () => void;
}

export function ApprovalPanel({ submissionId, onSuccess }: ApprovalPanelProps) {
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showChangesForm, setShowChangesForm] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    const res = await reviewSubmissionAction(
      submissionId,
      "APPROVE",
      notes || "Approved by Moderator",
    );
    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || "Failed to approve");
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setError("Rejection reason is required");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await reviewSubmissionAction(
      submissionId,
      "REJECT",
      notes,
      rejectionReason,
    );
    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || "Failed to reject");
    }
  };

  const handleRequestChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError("Notes describing requested changes are required");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await reviewSubmissionAction(
      submissionId,
      "REQUEST_CHANGES",
      notes,
    );
    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || "Failed to request changes");
    }
  };

  return (
    <div className="border rounded-2xl p-6 bg-card/30 backdrop-blur shadow-sm relative">
      <h3 className="font-bold text-base mb-4 flex items-center gap-2">
        <Edit3 className="w-4 h-4 text-primary" />
        Moderation Actions
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-start gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!showRejectForm && !showChangesForm ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Review Notes (Internal/iModBot Report Notes)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide context for review decisions..."
              className="w-full text-xs p-3 border rounded-xl bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={handleApprove}
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-0 py-2.5 rounded-xl font-medium shadow-md transition-all duration-300"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Approve
            </Button>

            <Button
              variant="outline"
              disabled={loading}
              onClick={() => {
                setError(null);
                setShowChangesForm(true);
              }}
              className="w-full flex items-center justify-center gap-1.5 border-dashed border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-400 py-2.5 rounded-xl font-medium transition-all duration-300"
            >
              <AlertCircle className="w-4 h-4" />
              Need Changes
            </Button>

            <Button
              variant="outline"
              disabled={loading}
              onClick={() => {
                setError(null);
                setShowRejectForm(true);
              }}
              className="w-full flex items-center justify-center gap-1.5 border-dashed border-red-500/30 hover:bg-red-500/5 hover:text-red-400 py-2.5 rounded-xl font-medium transition-all duration-300"
            >
              <X className="w-4 h-4" />
              Reject
            </Button>
          </div>
        </div>
      ) : showRejectForm ? (
        <form onSubmit={handleReject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-rose-400 mb-1.5">
              Rejection Reason *
            </label>
            <textarea
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="State clear, compliant reasons why the listing was rejected (visible to seller)..."
              className="w-full text-xs p-3 border border-red-500/20 rounded-xl bg-background/50 focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[100px]"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white border-0 py-2.5 rounded-xl font-medium transition-all duration-300"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Confirm Rejection
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowRejectForm(false);
                setError(null);
              }}
              className="px-4 py-2.5 rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRequestChanges} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-amber-400 mb-1.5">
              Changes Required *
            </label>
            <textarea
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail exactly what structural/content changes are required before approval..."
              className="w-full text-xs p-3 border border-amber-500/20 rounded-xl bg-background/50 focus:outline-none focus:ring-1 focus:ring-amber-500 min-h-[100px]"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-0 py-2.5 rounded-xl font-medium transition-all duration-300"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Send Revision Request
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowChangesForm(false);
                setError(null);
              }}
              className="px-4 py-2.5 rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
