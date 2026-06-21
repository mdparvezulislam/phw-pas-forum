"use client";

import {
  Activity,
  Check,
  DollarSign,
  FileCode2,
  Loader2,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { haptics } from "@/components/mobile/haptics-vibrator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAIAnalyticsAction, updatePromptTemplateAction } from "../actions";

export function AIAnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    systemPrompt: "",
    userPromptTemplate: "",
    modelId: "",
    providerId: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const res = await getAIAnalyticsAction();
    setLoading(false);
    if (res.success && res.data) {
      setData(res.data);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleEditClick = (prompt: any) => {
    haptics.tap();
    setEditingPrompt(prompt);
    setEditForm({
      systemPrompt: prompt.systemPrompt,
      userPromptTemplate: prompt.userPromptTemplate,
      modelId: prompt.modelId,
      providerId: prompt.providerId,
    });
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrompt) return;

    haptics.tap();
    setSaving(true);
    setMessage(null);

    const res = await updatePromptTemplateAction(editingPrompt.id, editForm);
    setSaving(false);

    if (res.success) {
      haptics.success();
      setMessage("Prompt template updated successfully!");
      setEditingPrompt(null);
      fetchAnalytics();
    } else {
      haptics.error();
      setMessage(`Error: ${res.error}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-sm text-muted-foreground font-semibold">
        <Loader2 className="h-5 w-5 animate-spin text-premium" />
        Loading AI Analytics...
      </div>
    );
  }

  const summary = data?.usageSummary || [];
  const prompts = data?.prompts || [];
  const logs = data?.auditLogs || [];
  const limits = data?.limits || [];

  const totalCalls = summary.reduce(
    (acc: number, item: any) => acc + item.totalCalls,
    0,
  );
  const totalCostCents =
    summary.reduce(
      (acc: number, item: any) => acc + (Number(item.totalCost) || 0),
      0,
    ) / 1000000; // convert microcents to cents
  const totalCostDollars = totalCostCents / 100;

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Analytics Summary widgets */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1 text-xs font-semibold">
            <Activity className="h-4 w-4 text-premium" /> Total AI Requests
          </div>
          <p className="text-2xl font-bold">{totalCalls}</p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1 text-xs font-semibold">
            <DollarSign className="h-4 w-4 text-green-500" /> Accumulated Cost
          </div>
          <p className="text-2xl font-bold">${totalCostDollars.toFixed(4)}</p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-1 text-xs font-semibold">
            <Terminal className="h-4 w-4 text-blue-500" /> Active Templates
          </div>
          <p className="text-2xl font-bold">{prompts.length}</p>
        </div>
      </div>

      {/* Main Grid: Prompts and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prompts library */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <FileCode2 className="h-5 w-5 text-premium" /> Prompt Templates
              Library
            </h3>
            <button
              onClick={() => {
                haptics.tap();
                fetchAnalytics();
              }}
              className="p-1.5 rounded-lg border hover:bg-accent text-muted-foreground"
              aria-label="Refresh prompts"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {prompts.map((prompt: any) => (
              <div
                key={prompt.id}
                className="rounded-xl border bg-card p-4.5 space-y-3.5 shadow-sm"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-foreground capitalize">
                      {prompt.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {prompt.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-mono font-bold text-muted-foreground">
                      v{prompt.version}
                    </span>
                    <Button
                      onClick={() => handleEditClick(prompt)}
                      size="sm"
                      className="h-7 text-[10px] font-semibold bg-premium hover:bg-premium/90 text-white rounded-full"
                    >
                      Configure
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4 text-[10px] text-muted-foreground font-semibold">
                  <span>
                    Model:{" "}
                    <span className="text-indigo-400 font-mono">
                      {prompt.modelId}
                    </span>
                  </span>
                  <span>
                    Provider:{" "}
                    <span className="text-zinc-400 capitalize">
                      {prompt.providerId}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit logs & cost controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Limits caps */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
              Rate Cost Limits
            </h3>
            <div className="space-y-3 text-xs">
              {limits.map((l: any) => (
                <div
                  key={l.id}
                  className="border-b last:border-0 pb-3 last:pb-0 space-y-1.5"
                >
                  <div className="flex justify-between font-bold">
                    <span className="capitalize">{l.targetType}</span>
                    <span>
                      ${(l.dailyLimitMicrocents / 100000000).toFixed(2)}/day
                    </span>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-premium rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (l.currentDailyUsageMicrocents /
                            l.dailyLimitMicrocents) *
                            100,
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>
                      Used today: $
                      {(l.currentDailyUsageMicrocents / 100000000).toFixed(4)}
                    </span>
                    <span>
                      {Math.round(
                        (l.currentDailyUsageMicrocents /
                          l.dailyLimitMicrocents) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logs */}
          <div className="rounded-xl border bg-card p-5 space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
              Audit Stream
            </h3>
            <div className="space-y-3.5">
              {logs.map((log: any) => (
                <div key={log.id} className="text-xs space-y-1 font-sans">
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                    <span className="font-bold text-foreground capitalize select-none">
                      {log.action.replace("AI_", "")}
                    </span>
                    <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-muted-foreground leading-normal">
                    {log.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Drawer Modal overlay */}
      {editingPrompt && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditingPrompt(null)}
          />
          <div className="relative w-full max-w-2xl bg-card border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-white">
                Configure Prompt: {editingPrompt.name}
              </h3>
              <button
                onClick={() => setEditingPrompt(null)}
                className="text-muted-foreground hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">
                    Model Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.modelId}
                    onChange={(e) =>
                      setEditForm({ ...editForm, modelId: e.target.value })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">
                    Provider ID
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.providerId}
                    onChange={(e) =>
                      setEditForm({ ...editForm, providerId: e.target.value })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  System Prompt
                </label>
                <textarea
                  required
                  value={editForm.systemPrompt}
                  onChange={(e) =>
                    setEditForm({ ...editForm, systemPrompt: e.target.value })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white h-24 resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  User Prompt Template
                </label>
                <textarea
                  required
                  value={editForm.userPromptTemplate}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      userPromptTemplate: e.target.value,
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white h-28"
                />
              </div>

              {message && <p className="text-xs text-yellow-500">{message}</p>}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingPrompt(null)}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-premium hover:bg-premium/90 text-white h-9 text-xs font-semibold"
                >
                  {saving ? "Saving..." : "Save Template"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
