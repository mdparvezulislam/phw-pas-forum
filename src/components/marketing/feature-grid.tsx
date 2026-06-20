import {
  MessageSquare,
  Store,
  MessageCircle,
  GraduationCap,
  Award,
  Shield,
  Zap,
  Bell,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Forums",
    description: "Engage in rich discussions with advanced formatting, quotes, mentions, and reactions.",
  },
  {
    icon: Store,
    title: "Marketplace",
    description: "Buy and sell services with escrow protection, reviews, and seller verification.",
  },
  {
    icon: MessageCircle,
    title: "Private Messaging",
    description: "Connect one-on-one with encrypted private messaging and group conversations.",
  },
  {
    icon: GraduationCap,
    title: "Learning Resources",
    description: "Access premium guides, templates, case studies, and downloadable resources.",
  },
  {
    icon: Award,
    title: "Reputation System",
    description: "Earn reputation, unlock badges, collect trophies, and level up your profile.",
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    description: "Verified sellers, dispute resolution, buyer protection, and community moderation.",
  },
  {
    icon: Zap,
    title: "Premium Memberships",
    description: "Unlock VIP forums, premium resources, marketplace boosts, and priority support.",
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    description: "Stay updated with instant notifications for replies, orders, and community activity.",
  },
];

export function FeatureGrid() {
  return (
    <section className="border-t border-border py-20">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Everything You Need</h2>
          <p className="mt-3 text-muted-foreground">
            A complete ecosystem for digital professionals
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-lg"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
