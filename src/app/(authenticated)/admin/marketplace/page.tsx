"use client";

import { Check, Key, Settings, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { PageHeader, SectionCard } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

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
      <PageHeader
        title="Marketplace"
        description="Marketplace governance, compliance rules, and seller verification"
        icon={<Settings className="h-5 w-5" />}
      />

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 animate-in fade-in slide-in-from-top-1">
          <Check className="h-4 w-4 shrink-0" />
          Settings updated successfully. Configurations applied to new listing
          submissions.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── Compliance ────────────────────────────────── */}
        <SectionCard
          title="iModBot Compliance Baseline"
          description="Baseline rules marketplace threads must meet for a passing compliance score."
          icon={<ShieldCheck className="h-4 w-4 text-emerald-400" />}
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  Minimum Word Count
                </Label>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {minWords} words
                </Badge>
              </div>
              <Input
                type="range"
                min={50}
                max={500}
                step={10}
                value={minWords}
                onChange={(e) => setMinWords(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer accent-primary [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5"
              />
              <p className="text-[10px] text-muted-foreground">
                Threads below this are marked non-compliant.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold">
                  Media Attachment Required
                </Label>
                <p className="text-[10px] text-muted-foreground">
                  Force presence of at least one image or video.
                </p>
              </div>
              <Switch checked={mediaReq} onCheckedChange={setMediaReq} />
            </div>
          </div>
        </SectionCard>

        {/* ── Risk Assessment ───────────────────────────── */}
        <SectionCard
          title="Scoring Risk Tolerances"
          description="Limits for link density and text parsing weights that raise thread risk scores."
          icon={<ShieldAlert className="h-4 w-4 text-rose-400" />}
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  Max Allowed External Links
                </Label>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {maxLinks} links
                </Badge>
              </div>
              <Input
                type="range"
                min={2}
                max={25}
                step={1}
                value={maxLinks}
                onChange={(e) => setMaxLinks(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer accent-primary [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5"
              />
              <p className="text-[10px] text-muted-foreground">
                Exceeding this threshold penalizes the risk index.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  Link Abuse Score Weight
                </Label>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {spamScoreWeight}%
                </Badge>
              </div>
              <Input
                type="range"
                min={10}
                max={80}
                step={5}
                value={spamScoreWeight}
                onChange={(e) => setSpamScoreWeight(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer accent-primary [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5"
              />
              <p className="text-[10px] text-muted-foreground">
                Impact weight on overall automated risk check.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ── Vendor Access ─────────────────────────────── */}
        <SectionCard
          title="Vendor Access Policies"
          description="Control automated vs. moderator verification triggers based on trust level."
          icon={<Key className="h-4 w-4 text-indigo-400" />}
          className="lg:col-span-2"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold">
                  Auto-approve VIP Thread Submissions
                </Label>
                <p className="text-[10px] text-muted-foreground">
                  Skip the moderation queue entirely if the thread creator is a
                  VIP or Staff.
                </p>
              </div>
              <Switch
                checked={autoVerifyVIPs}
                onCheckedChange={setAutoVerifyVIPs}
              />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="flex justify-end border-t pt-4">
        <Button type="submit" className="gap-1.5 px-6">
          <Settings className="h-3.5 w-3.5" />
          Save Configurations
        </Button>
      </div>
    </form>
  );
}
