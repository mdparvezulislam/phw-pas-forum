import { getDatabase, schema } from "@/db";
import { reputationEngine } from "@/services/reputation-engine";

const DEFAULT_LEVELS = [
  { name: "New Member", minPoints: 0 },
  { name: "Junior Member", minPoints: 50 },
  { name: "Member", minPoints: 200 },
  { name: "Senior Member", minPoints: 500 },
  { name: "Elite Member", minPoints: 1500 },
  { name: "Veteran Member", minPoints: 5000 },
  { name: "Legendary Member", minPoints: 15000 },
];

const DEFAULT_BADGES = [
  {
    name: "First Post",
    slug: "first-post",
    icon: "📝",
    description: "Made your first post",
    color: "blue",
    category: "POSTING" as const,
    isSystem: true,
  },
  {
    name: "10 Posts",
    slug: "10-posts",
    icon: "✍️",
    description: "Made 10 posts",
    color: "emerald",
    category: "POSTING" as const,
    isSystem: true,
  },
  {
    name: "100 Posts",
    slug: "100-posts",
    icon: "💬",
    description: "Made 100 posts",
    color: "purple",
    category: "POSTING" as const,
    isSystem: true,
  },
  {
    name: "1000 Posts",
    slug: "1000-posts",
    icon: "🏆",
    description: "Made 1000 posts",
    color: "amber",
    category: "POSTING" as const,
    isSystem: true,
  },
  {
    name: "First Thread",
    slug: "first-thread",
    icon: "🧵",
    description: "Created your first thread",
    color: "cyan",
    category: "POSTING" as const,
    isSystem: true,
  },
  {
    name: "10 Threads",
    slug: "10-threads",
    icon: "📌",
    description: "Created 10 threads",
    color: "blue",
    category: "POSTING" as const,
    isSystem: true,
  },
  {
    name: "First Like Received",
    slug: "first-like",
    icon: "👍",
    description: "Received your first like",
    color: "blue",
    category: "COMMUNITY" as const,
    isSystem: true,
  },
  {
    name: "100 Likes Received",
    slug: "100-likes",
    icon: "⭐",
    description: "Received 100 likes",
    color: "amber",
    category: "COMMUNITY" as const,
    isSystem: true,
  },
  {
    name: "Helpful Contributor",
    slug: "helpful-contributor",
    icon: "💡",
    description: "Received 10 helpful reactions",
    color: "emerald",
    category: "COMMUNITY" as const,
    isSystem: true,
  },
  {
    name: "Elite Contributor",
    slug: "elite-contributor",
    icon: "🌟",
    description: "Received 50 helpful reactions",
    color: "purple",
    category: "COMMUNITY" as const,
    isSystem: true,
  },
  {
    name: "Rising Star",
    slug: "rising-star",
    icon: "🌅",
    description: "Reached 100 reputation points",
    color: "blue",
    category: "ACHIEVEMENT" as const,
    isSystem: true,
  },
  {
    name: "Established",
    slug: "established",
    icon: "🌳",
    description: "Reached 500 reputation points",
    color: "emerald",
    category: "ACHIEVEMENT" as const,
    isSystem: true,
  },
  {
    name: "Veteran",
    slug: "veteran",
    icon: "🎖️",
    description: "Been a member for over a year",
    color: "red",
    category: "ACHIEVEMENT" as const,
    isSystem: true,
  },
  {
    name: "Community Legend",
    slug: "community-legend",
    icon: "👑",
    description: "Reached 10000 reputation points",
    color: "amber",
    category: "ACHIEVEMENT" as const,
    isSystem: true,
  },
];

const DEFAULT_TROPHIES = [
  {
    title: "First Post",
    description: "Published your first post",
    icon: "📝",
    reputationReward: 10,
    conditionType: "POST_COUNT" as const,
    conditionValue: 1,
  },
  {
    title: "10 Posts",
    description: "Published 10 posts",
    icon: "✍️",
    reputationReward: 20,
    conditionType: "POST_COUNT" as const,
    conditionValue: 10,
  },
  {
    title: "100 Posts",
    description: "Published 100 posts",
    icon: "💬",
    reputationReward: 50,
    conditionType: "POST_COUNT" as const,
    conditionValue: 100,
  },
  {
    title: "1000 Posts",
    description: "Published 1000 posts",
    icon: "🏆",
    reputationReward: 200,
    conditionType: "POST_COUNT" as const,
    conditionValue: 1000,
  },
  {
    title: "First Like",
    description: "Received your first like",
    icon: "👍",
    reputationReward: 10,
    conditionType: "REACTION_COUNT" as const,
    conditionValue: 1,
  },
  {
    title: "100 Likes",
    description: "Received 100 likes",
    icon: "⭐",
    reputationReward: 50,
    conditionType: "REACTION_COUNT" as const,
    conditionValue: 100,
  },
  {
    title: "Helpful Contributor",
    description: "Received 10 helpful reactions",
    icon: "💡",
    reputationReward: 30,
    conditionType: "HELPFUL_COUNT" as const,
    conditionValue: 10,
  },
  {
    title: "Elite Contributor",
    description: "Received 50 helpful reactions",
    icon: "🌟",
    reputationReward: 100,
    conditionType: "HELPFUL_COUNT" as const,
    conditionValue: 50,
  },
  {
    title: "Veteran",
    description: "Been a member for 1 year",
    icon: "🎖️",
    reputationReward: 100,
    conditionType: "JOIN_DURATION_DAYS" as const,
    conditionValue: 365,
  },
  {
    title: "Community Legend",
    description: "Reached 10000 reputation points",
    icon: "👑",
    reputationReward: 500,
    conditionType: "REPUTATION_COUNT" as const,
    conditionValue: 10000,
  },
];

const DEFAULT_MARKETPLACE_CATEGORIES = [
  { name: "SEO", slug: "seo", description: "Search Engine Optimization services", position: 1 },
  { name: "Link Building", slug: "link-building", description: "Backlinks and off-page optimization", position: 2 },
  { name: "Social Media", slug: "social-media", description: "SMM panels, signals, and marketing", position: 3 },
  { name: "YouTube", slug: "youtube", description: "YouTube views, subscribers, and channels", position: 4 },
  { name: "TikTok", slug: "tiktok", description: "TikTok marketing and growth", position: 5 },
  { name: "AI Services", slug: "ai-services", description: "AI content generation, models, and tooling", position: 6 },
  { name: "Programming", slug: "programming", description: "Scripts, software, bots, and custom development", position: 7 },
  { name: "Design", slug: "design", description: "Logos, banners, thread designs, and UI/UX", position: 8 },
  { name: "Domains", slug: "domains", description: "Buy, sell, and auction domain names", position: 9 },
  { name: "Web Hosting", slug: "web-hosting", description: "Shared, VPS, and dedicated servers", position: 10 },
];

async function main() {
  const db = getDatabase();

  console.log("Seeding levels...");
  for (const level of DEFAULT_LEVELS) {
    const existing = await db.query.userLevels.findFirst({
      where: (l, { eq }) => eq(l.name, level.name),
    });
    if (!existing) {
      await db.insert(schema.userLevels).values(level);
      console.log(`  Created level: ${level.name}`);
    }
  }

  console.log("Seeding badges...");
  for (const badge of DEFAULT_BADGES) {
    const existing = await db.query.badges.findFirst({
      where: (b, { eq }) => eq(b.slug, badge.slug),
    });
    if (!existing) {
      await db.insert(schema.badges).values(badge);
      console.log(`  Created badge: ${badge.name}`);
    }
  }

  console.log("Seeding trophies...");
  for (const trophy of DEFAULT_TROPHIES) {
    const existing = await db.query.trophies.findFirst({
      where: (t, { eq }) => eq(t.title, trophy.title),
    });
    if (!existing) {
      await db.insert(schema.trophies).values(trophy);
      console.log(`  Created trophy: ${trophy.title}`);
    }
  }

  console.log("Seeding marketplace categories...");
  for (const cat of DEFAULT_MARKETPLACE_CATEGORIES) {
    const existing = await db.query.marketplaceCategories.findFirst({
      where: (c, { eq }) => eq(c.slug, cat.slug),
    });
    if (!existing) {
      await db.insert(schema.marketplaceCategories).values(cat);
      console.log(`  Created marketplace category: ${cat.name}`);
    }
  }

  console.log("Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
