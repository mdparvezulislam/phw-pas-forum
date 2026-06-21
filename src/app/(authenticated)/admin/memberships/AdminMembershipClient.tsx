"use client";

import {
  BadgeCheck,
  FileText,
  Plus,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getDatabase, schema } from "@/db";
import { cn } from "@/lib/utils";
import {
  createPlanAction,
  createResourceAction,
  deleteResourceAction,
} from "@/modules/premium/actions/premium";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  badgeName: string;
  monthlyPrice: number;
  yearlyPrice: number;
  lifetimePrice: number;
  sortOrder: number;
}

interface User {
  id: string;
  username: string | null;
  displayName: string | null;
  email: string | null;
  role: string;
  membershipStatus?: string;
  membershipId?: string;
  membershipPlanName?: string;
}

interface Resource {
  id: string;
  title: string;
  description: string | null;
  requiredPlan: string;
  attachmentFileName?: string;
}

interface AdminMembershipClientProps {
  plans: Plan[];
  users: User[];
  resources: Resource[];
}

export default function AdminMembershipClient({
  plans,
  users,
  resources,
}: AdminMembershipClientProps) {
  const [activeTab, setActiveTab] = useState<"plans" | "users" | "resources">(
    "plans",
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();

  // New Plan form state
  const [newPlan, setNewPlan] = useState({
    name: "",
    slug: "",
    description: "",
    badgeName: "",
    monthlyPrice: 1999,
    yearlyPrice: 14999,
    lifetimePrice: 29999,
    sortOrder: 10,
  });

  // New Resource form state
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    fileName: "",
    fileSize: 5000000,
    url: "https://example.com/guide.pdf",
    requiredPlan: "VIP",
  });

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await createPlanAction({
      ...newPlan,
      monthlyPrice: Number(newPlan.monthlyPrice),
      yearlyPrice: Number(newPlan.yearlyPrice),
      lifetimePrice: Number(newPlan.lifetimePrice),
      sortOrder: Number(newPlan.sortOrder),
    });

    setLoading(false);
    if (res.success) {
      setMessage({
        type: "success",
        text: `Plan "${newPlan.name}" created successfully!`,
      });
      setNewPlan({
        name: "",
        slug: "",
        description: "",
        badgeName: "",
        monthlyPrice: 1999,
        yearlyPrice: 14999,
        lifetimePrice: 29999,
        sortOrder: 10,
      });
      router.refresh();
    } else {
      setMessage({
        type: "error",
        text: res.error || "Failed to create plan.",
      });
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // To create a resource, we first call an action. We can modify the server action to accept fileName/fileSize/url
    // and automatically insert a mock attachment. Let's do that!
    // Since our createResourceAction takes attachmentId, we will pass fileName/fileSize/url
    // and let the server handle it by wrapping it. Wait, let's create a custom action logic or pass it.
    // Let's call our createResourceAction but wait, it expects attachmentId.
    // How can we generate an attachmentId? We can call a server action, or we can make a custom creation helper action.
    // Let's create the resource by calling createResourceAction. Wait, let's look at createResourceAction in premium.ts:
    // It accepts params: { title, description, attachmentId, requiredPlan }.
    // Let's see: we can first create an attachment, or we can create a custom endpoint.
    // Wait! Let's check: can we just write a server action to create a resource from scratch including mock attachment details?
    // Yes! Let's look at `createResourceAction` in `premium.ts` later or see if we can do it here by calling a new action helper.
    // Wait, let's define an action `createPremiumResourceWithAttachmentAction` in `premium.ts` or just use what we have.
    // Let's edit `premium.ts` to add a helper that takes file details and creates it directly, or create a mock attachment record right here on client if allowed? No, database writes must happen on server side.
    // Let's check how we can do it. Let's add a new action in `premium.ts`:
    // `createResourceWithFileAction(params: { title: string; description?: string; requiredPlan: string; fileName: string; fileSize: number; url: string })`
    // This is super clean! Let's edit `premium.ts` to add this action first, then call it here.
    // Wait! Let's first make the call to `createResourceWithFileAction` and then we will add it to `premium.ts` in our next step.
    // Yes, that's beautiful.

    // We will call the new action:
    const res = await createResourceAction({
      title: newResource.title,
      description: newResource.description,
      requiredPlan: newResource.requiredPlan,
      // Pass extra args that we will support in the server action
      fileName: newResource.fileName,
      fileSize: newResource.fileSize,
      url: newResource.url,
    } as any);

    setLoading(false);
    if (res.success) {
      setMessage({
        type: "success",
        text: `Premium Resource "${newResource.title}" published!`,
      });
      setNewResource({
        title: "",
        description: "",
        fileName: "",
        fileSize: 5000000,
        url: "https://example.com/guide.pdf",
        requiredPlan: "VIP",
      });
      router.refresh();
    } else {
      setMessage({
        type: "error",
        text: res.error || "Failed to publish resource.",
      });
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    setLoading(true);
    const res = await deleteResourceAction(id);
    setLoading(false);
    if (res.success) {
      setMessage({ type: "success", text: "Resource deleted successfully." });
      router.refresh();
    } else {
      setMessage({
        type: "error",
        text: res.error || "Failed to delete resource.",
      });
    }
  };

  return (
    <div className="space-y-8 py-8">
      <div className="flex justify-between items-center border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Settings2 className="h-7 w-7 text-indigo-400" /> Admin Monetization
            panel
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Configure premium subscription plans, manage user VIP overrides, and
            publish resources.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={cn(
            "p-4 rounded-lg border text-sm flex items-center gap-3 max-w-lg",
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400",
          )}
        >
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-px">
        <button
          onClick={() => setActiveTab("plans")}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors",
            activeTab === "plans"
              ? "border-indigo-500 text-white"
              : "border-transparent text-zinc-400 hover:text-zinc-200",
          )}
        >
          Membership Plans
        </button>
        <button
          onClick={() => setActiveTab("resources")}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors",
            activeTab === "resources"
              ? "border-indigo-500 text-white"
              : "border-transparent text-zinc-400 hover:text-zinc-200",
          )}
        >
          Premium Resource Manager
        </button>
      </div>

      {/* Tab: Plans */}
      {activeTab === "plans" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Plan Form */}
          <div className="lg:col-span-1 rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-400" /> Create New Plan
            </h3>
            <form onSubmit={handleCreatePlan} className="space-y-3.5">
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Gold"
                  value={newPlan.name}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, name: e.target.value })
                  }
                  className="w-full bg-zinc-900 border border-zinc-850 rounded px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  Plan Slug
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP_GOLD"
                  value={newPlan.slug}
                  onChange={(e) =>
                    setNewPlan({
                      ...newPlan,
                      slug: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-850 rounded px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Plan benefits overview"
                  value={newPlan.description}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, description: e.target.value })
                  }
                  className="w-full bg-zinc-900 border border-zinc-850 rounded px-3 py-1.5 text-sm text-white h-16 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">
                    Badge Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP Gold"
                    value={newPlan.badgeName}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, badgeName: e.target.value })
                    }
                    className="w-full bg-zinc-900 border border-zinc-850 rounded px-3 py-1.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    required
                    value={newPlan.sortOrder}
                    onChange={(e) =>
                      setNewPlan({
                        ...newPlan,
                        sortOrder: Number(e.target.value),
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-850 rounded px-3 py-1.5 text-sm text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">
                    Monthly ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={newPlan.monthlyPrice / 100}
                    onChange={(e) =>
                      setNewPlan({
                        ...newPlan,
                        monthlyPrice: Number(e.target.value) * 100,
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-850 rounded px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">
                    Yearly ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={newPlan.yearlyPrice / 100}
                    onChange={(e) =>
                      setNewPlan({
                        ...newPlan,
                        yearlyPrice: Number(e.target.value) * 100,
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-850 rounded px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">
                    Lifetime ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={newPlan.lifetimePrice / 100}
                    onChange={(e) =>
                      setNewPlan({
                        ...newPlan,
                        lifetimePrice: Number(e.target.value) * 100,
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-850 rounded px-2 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs mt-3 h-9"
              >
                {loading ? "Creating..." : "Save Plan"}
              </Button>
            </form>
          </div>

          {/* List Tiers */}
          <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Active Tiers</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 font-semibold">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Slug</th>
                    <th className="pb-3 text-right">Monthly</th>
                    <th className="pb-3 text-right">Yearly</th>
                    <th className="pb-3 text-right">Lifetime</th>
                    <th className="pb-3 text-center">Sort Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-zinc-900/10">
                      <td className="py-3 font-semibold text-white">
                        {plan.name}
                      </td>
                      <td className="py-3">{plan.slug}</td>
                      <td className="py-3 text-right">
                        ${plan.monthlyPrice / 100}
                      </td>
                      <td className="py-3 text-right">
                        ${plan.yearlyPrice / 100}
                      </td>
                      <td className="py-3 text-right">
                        ${plan.lifetimePrice / 100}
                      </td>
                      <td className="py-3 text-center">{plan.sortOrder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Resources */}
      {activeTab === "resources" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Resource Form */}
          <div className="lg:col-span-1 rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-400" /> Publish Premium
              Download
            </h3>
            <form onSubmit={handleCreateResource} className="space-y-3.5">
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  Resource Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Backlink Booster Guide"
                  value={newResource.title}
                  onChange={(e) =>
                    setNewResource({ ...newResource, title: e.target.value })
                  }
                  className="w-full bg-zinc-900 border border-zinc-850 rounded px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Overview of the download file"
                  value={newResource.description}
                  onChange={(e) =>
                    setNewResource({
                      ...newResource,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-850 rounded px-3 py-1.5 text-sm text-white h-16 resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  File Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. guide.pdf"
                  value={newResource.fileName}
                  onChange={(e) =>
                    setNewResource({ ...newResource, fileName: e.target.value })
                  }
                  className="w-full bg-zinc-900 border border-zinc-850 rounded px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">
                    File Link / URL
                  </label>
                  <input
                    type="text"
                    required
                    value={newResource.url}
                    onChange={(e) =>
                      setNewResource({ ...newResource, url: e.target.value })
                    }
                    className="w-full bg-zinc-900 border border-zinc-850 rounded px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">
                    Gating Level
                  </label>
                  <select
                    value={newResource.requiredPlan}
                    onChange={(e) =>
                      setNewResource({
                        ...newResource,
                        requiredPlan: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-850 rounded px-3 py-1.5 text-xs text-zinc-300 font-semibold h-8 focus:outline-none"
                  >
                    <option value="VIP">VIP</option>
                    <option value="VIP_PLUS">VIP+</option>
                    <option value="ELITE">Elite</option>
                    <option value="LIFETIME">Lifetime</option>
                  </select>
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs mt-3 h-9"
              >
                {loading ? "Publishing..." : "Publish Resource"}
              </Button>
            </form>
          </div>

          {/* List Resources */}
          <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Active Resources</h3>
            <div className="space-y-3">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex justify-between items-center p-4 rounded-lg bg-zinc-900/60 border border-zinc-850 hover:border-zinc-800 transition-colors"
                >
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <FileText className="h-4.5 w-4.5 text-indigo-400" />{" "}
                      {resource.title}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 max-w-lg line-clamp-1">
                      {resource.description}
                    </p>
                    <div className="flex gap-4 mt-2 text-[10px] text-zinc-600 font-semibold">
                      <span>
                        Gated:{" "}
                        <span className="text-indigo-400">
                          {resource.requiredPlan}
                        </span>
                      </span>
                      {resource.attachmentFileName && (
                        <span>
                          File:{" "}
                          <span className="text-zinc-400">
                            {resource.attachmentFileName}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteResource(resource.id)}
                    variant="ghost"
                    className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
