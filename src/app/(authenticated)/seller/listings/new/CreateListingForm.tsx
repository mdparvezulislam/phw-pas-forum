"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { SellerCopilot } from "@/modules/ai/components/SellerCopilot";
import { createListingAction } from "./actions";

interface CreateListingFormProps {
  categories: { id: string; name: string; slug: string }[];
}

export function CreateListingForm({ categories }: CreateListingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [price, setPrice] = useState(49);
  const [deliveryDays, setDeliveryDays] = useState(3);
  const [description, setDescription] = useState("");

  const selectedCategory =
    categories.find((c) => c.id === categoryId)?.name || "Service";

  const handleSelectTitle = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleSelectPackages = (packages: string) => {
    setDescription(
      (prev) => `${prev}\n\nRecommended Service Tiers:\n${packages}`,
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a service title.");
      return;
    }
    if (!description.trim()) {
      setError("Please describe your listing packages and services.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await createListingAction({
          title,
          categoryId,
          price,
          deliveryDays,
          shortDescription: description,
        });
      } catch (err: any) {
        setError(err.message || "Failed to create listing.");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
      {/* Form Area */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/seller/dashboard"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
        </div>

        <div className="rounded-2xl border bg-card/65 backdrop-blur-md p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Listing Details
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Draft your digital product or marketplace service packages below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-foreground font-semibold block mb-1">
                Service Title
              </label>
              <input
                type="text"
                placeholder="e.g. High Authority PBN Links Backlink Campaign"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-background border border-muted rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-premium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-foreground font-semibold block mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-background border border-muted rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-premium"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-foreground font-semibold block mb-1">
                  Base Price (USD)
                </label>
                <input
                  type="number"
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                  className="w-full bg-background border border-muted rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-premium"
                />
              </div>

              <div>
                <label className="text-xs text-foreground font-semibold block mb-1">
                  Delivery (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(Number(e.target.value))}
                  required
                  className="w-full bg-background border border-muted rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-premium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-foreground font-semibold block mb-1">
                Description / Package Info
              </label>
              <textarea
                placeholder="Detail what features and deliverables are included in your service tier..."
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full bg-background border border-muted rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-premium resize-none font-sans"
              />
            </div>

            {error && <p className="text-xs text-danger">{error}</p>}

            <div className="flex justify-end pt-2 border-t mt-6">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-primary hover:bg-primary/95 text-white h-10 px-6 rounded-xl font-semibold text-sm"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Listing...
                  </>
                ) : (
                  "Publish Listing"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Seller AI Assistant / Copilot Panel */}
      <div className="lg:col-span-1 space-y-4">
        <SellerCopilot
          title={title}
          description={description}
          category={selectedCategory}
          price={price}
          onSelectTitle={handleSelectTitle}
          onSelectPackages={handleSelectPackages}
        />
      </div>
    </div>
  );
}
