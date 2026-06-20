"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Check, ShieldAlert, ShieldCheck, Settings, Key } from "lucide-react";

export default function AdminMarketplaceSettings() {
  const [success, setSuccess] = useState(false);
  const [minWords, setMinWords] = useState(150);
  const [mediaReq, setMediaReq] = useState(true);
  const [maxLinks, setMaxLinks] = useState(10);
  const [spamScoreWeight, setSpamScoreWeight] = useState(40);
  const [autoVerifyVIPs, setAutoVerifyVIPs] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div>
        <h2 className="text-xl font-bold">Marketplace Governance Configuration</h2>
        <p className="text-sm text-muted-foreground font-sans">
          Tune automated risk scoring thresholds, compliance checklists, and seller verification rules.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-sm flex items-center gap-2 animate-pulse font-sans">
          <Check className="w-4 h-4" />
          Settings updated successfully! Configurations applied dynamically to new listing submissions.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance checklist card */}
        <div className="border rounded-2xl p-6 bg-card/30 backdrop-blur space-y-4 border-muted/20">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            iModBot Compliance Baseline
          </h3>
          <p className="text-xs text-muted-foreground font-sans">
            Configure the baseline rules that marketplace threads must meet to receive a passing compliance score.
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Minimum Word Count: {minWords} words
              </label>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={minWords}
                onChange={(e) => setMinWords(Number(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-[10px] text-muted-foreground font-sans block mt-1">Threads below this are marked non-compliant.</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Media Attachment Required
                </label>
                <span className="text-[10px] text-muted-foreground font-sans">Force presence of at least one image or video.</span>
              </div>
              <input
                type="checkbox"
                checked={mediaReq}
                onChange={(e) => setMediaReq(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
            </div>
          </div>
        </div>

        {/* Risk Assessment card */}
        <div className="border rounded-2xl p-6 bg-card/30 backdrop-blur space-y-4 border-muted/20">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Scoring Risk Tolerances
          </h3>
          <p className="text-xs text-muted-foreground font-sans">
            Define limits for link density and text parsing weights that raise thread risk scores.
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Max Allowed External Links: {maxLinks} links
              </label>
              <input
                type="range"
                min="2"
                max="25"
                step="1"
                value={maxLinks}
                onChange={(e) => setMaxLinks(Number(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-[10px] text-muted-foreground font-sans block mt-1">Exceeding this threshold penalizes risk index.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Link Abuse Score Weight: {spamScoreWeight}%
              </label>
              <input
                type="range"
                min="10"
                max="80"
                step="5"
                value={spamScoreWeight}
                onChange={(e) => setSpamScoreWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-[10px] text-muted-foreground font-sans block mt-1">Impact weight on overall automated risk check.</span>
            </div>
          </div>
        </div>

        {/* Vendor/Role Rules */}
        <div className="border rounded-2xl p-6 bg-card/30 backdrop-blur space-y-4 lg:col-span-2 border-muted/20">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400" />
            Vendor Access Policies
          </h3>
          <p className="text-xs text-muted-foreground font-sans">
            Control automated vs. moderator verification triggers based on community trust level and badges.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Auto-approve VIP Thread Submissions
                </label>
                <span className="text-[10px] text-muted-foreground font-sans">
                  Skip the moderation queue entirely if the thread creator is a VIP or Staff.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoVerifyVIPs}
                onChange={(e) => setAutoVerifyVIPs(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-muted/20">
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
        >
          <Settings className="w-3.5 h-3.5" />
          Save Configurations
        </Button>
      </div>
    </form>
  );
}
