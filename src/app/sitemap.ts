import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/forums`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/leaderboards`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/reputation`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/achievements`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.3,
    },
  ];

  let forumRoutes: MetadataRoute.Sitemap = [];
  let threadRoutes: MetadataRoute.Sitemap = [];
  let listingRoutes: MetadataRoute.Sitemap = [];

  try {
    const { getDatabase, schema } = await import("@/db");
    const { eq, and } = await import("drizzle-orm");
    const db = getDatabase();

    const forums = await db.query.forums.findMany({
      where: and(
        eq(schema.forums.isVisible, true),
        eq(schema.forums.isLocked, false),
      ),
      columns: { slug: true, categoryId: true },
    });

    forumRoutes = forums.map((forum) => ({
      url: `${baseUrl}/forums/${forum.slug}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.8,
    }));

    const threads = await db.query.threads.findMany({
      where: and(
        eq(schema.threads.status, "PUBLISHED"),
        eq(schema.threads.visibility, "PUBLIC"),
      ),
      columns: { slug: true, forumId: true },
      orderBy: (t: any, { desc }: any) => [desc(t.createdAt)],
      limit: 5000,
    });

    threadRoutes = threads.map((thread) => ({
      url: `${baseUrl}/threads/${thread.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

    const listings = await db.query.marketplaceListings.findMany({
      where: and(
        eq(schema.marketplaceListings.status, "ACTIVE"),
        eq(schema.marketplaceListings.visibility, "PUBLIC"),
      ),
      columns: { slug: true },
      orderBy: (l: any, { desc }: any) => [desc(l.createdAt)],
      limit: 5000,
    });

    listingRoutes = listings.map((listing) => ({
      url: `${baseUrl}/marketplace/${listing.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));
  } catch {
    /* sitemap generation continues without dynamic routes */
  }

  return [...staticRoutes, ...forumRoutes, ...threadRoutes, ...listingRoutes];
}
