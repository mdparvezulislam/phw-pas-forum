"use client";

import { useState } from "react";
import { verifySellerAction } from "../actions/moderation";
import { Check, X, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import type { SellerVerificationAppStatus } from "@/db/schema/seller-verifications";

interface SellerVerificationCardProps {
  verification: {
    id: string;
    sellerId: string;
    status: string;
    notes?: string | null;
    verificationLevel: string;
    createdAt: Date;
    seller: {
      username: string | null;
      displayName: string | null;
      image: string | null;
    };
  };
  onActionSuccess?: () => void;
}

export function SellerVerificationCard({
  verification,
  onActionSuccess,
}: SellerVerificationCardProps) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [level, setLevel] = useState(verification.verificationLevel || "LEVEL_1");
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (status: SellerVerificationAppStatus) => {
    setLoading(true);
    setError(null);
    const res = await verifySellerAction(
      verification.sellerId,
      status,
      level,
      notes || `Verified as ${status}`
    );
    setLoading(false);
    if (res.success) {
      if (onActionSuccess) onActionSuccess();
    } else {
      setError(res.error || "Failed to verify seller");
    }
  };

  const sellerName =
    verification.seller.displayName ?? verification.seller.username ?? "Unknown Seller";

  return (
    <div className="border rounded-2xl p-5 bg-card/40 backdrop-blur shadow-sm space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h4 className="font-bold text-sm">{sellerName}</h4>
          <p className="text-[10px] text-muted-foreground">
            Seller ID: {verification.sellerId} • Applied:{" "}
            {new Date(verification.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground uppercase font-semibold">
          {verification.status}
        </span>
      </div>

      {verification.notes && (
        <div className="p-3 bg-secondary/20 rounded-xl text-xs text-muted-foreground border">
          <span className="font-semibold block mb-1 text-foreground">Seller's Notes:</span>
          {verification.notes}
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
            Verification Level
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full text-xs p-2 border rounded-lg bg-background"
          >
            <option value="LEVEL_1">Level 1 (Identity)</option>
            <option value="LEVEL_2">Level 2 (Business)</option>
            <option value="LEVEL_3">Level 3 (Enterprise)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
            Review Notes / Reasons
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add internal moderator verification logs..."
            className="w-full text-xs p-2 border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end border-t pt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => handleVerify("SUSPENDED")}
          className="border-red-500/30 text-red-400 hover:bg-red-500/5 hover:text-red-300 py-1.5 px-3 rounded-xl font-medium text-xs flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          Suspend Seller
        </Button>
        <Button
          size="sm"
          disabled={loading}
          onClick={() => handleVerify("VERIFIED")}
          className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 py-1.5 px-3 rounded-xl font-medium text-xs flex items-center gap-1.5"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          Approve Verification
        </Button>
        <Button
          size="sm"
          disabled={loading}
          onClick={() => handleVerify("TRUSTED")}
          className="bg-blue-600 hover:bg-blue-500 text-white border-0 py-1.5 px-3 rounded-xl font-medium text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5" />
          )}
          Mark Trusted
        </Button>
      </div>
    </div>
  );
}
