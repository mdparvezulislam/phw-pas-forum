import type { Metadata } from "next";
import { FeatureGrid } from "@/components/marketing";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Features",
};

const features = [
  {
    title: "Advanced Forums",
    description: "Rich content creation with TipTap editor, real-time previews, quotes, mentions, and reactions.",
    items: ["TipTap WYSIWYG editor", "Mentions & quotes", "Post reactions", "Thread watching & bookmarks", "Draft management"],
  },
  {
    title: "Trusted Marketplace",
    description: "Secure escrow-based marketplace with seller verification, dispute resolution, and buyer protection.",
    items: ["Escrow payment protection", "Seller verification", "Dispute resolution", "Order management", "iTrader feedback"],
  },
  {
    title: "Reputation & Trust",
    description: "Multi-dimensional reputation system with levels, badges, trophies, and trust scores.",
    items: ["Reputation points", "Leveling system", "Achievement badges", "Trophy cabinet", "Trust scoring"],
  },
  {
    title: "Premium Memberships",
    description: "Tiered membership plans with VIP forums, premium resources, and marketplace boosts.",
    items: ["VIP-only forums", "Premium downloads", "Listing boosts", "Priority support", "Profile badges"],
  },
  {
    title: "Private Messaging",
    description: "Encrypted private messaging with group conversations, attachments, and read receipts.",
    items: ["End-to-end encrypted PMs", "Group conversations", "File attachments", "Read receipts", "Message history"],
  },
  {
    title: "Search & Discovery",
    description: "Powerful search with Typesense, filters, and AI-powered recommendations.",
    items: ["Full-text search", "Advanced filters", "Tag-based discovery", "Search history", "AI recommendations"],
  },
  {
    title: "Notifications",
    description: "Real-time notifications for replies, mentions, orders, and community activity.",
    items: ["Real-time alerts", "Email notifications", "Push notifications", "Custom preferences", "Activity digest"],
  },
  {
    title: "Moderation Tools",
    description: "Comprehensive moderation suite with reports, warnings, bans, and staff management.",
    items: ["Report system", "Warning points", "Temporary & permanent bans", "Moderator notes", "Staff action logs"],
  },
];

export default function FeaturesPage() {
  return (
    <div className="pt-24">
      <div className="mx-auto max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">Everything You Need</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A complete platform for building your online presence, connecting with peers,
            and growing your business.
          </p>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold">{feature.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              <ul className="mt-4 space-y-2">
                {feature.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <Check className="h-3.5 w-3.5 text-premium" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
