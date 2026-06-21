import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import type {
  SearchIndexAction,
  SearchIndexEntityType,
} from "@/db/schema/search-index-jobs";
import { search as typesenseClient } from "@/lib/typesense";
import { auditService } from "./audit";

export const search = typesenseClient;

export const COLLECTIONS = {
  USERS: "users",
  THREADS: "threads",
  POSTS: "posts",
  FORUMS: "forums",
  BADGES: "badges",
  TROPHIES: "trophies",
  CONVERSATION_MESSAGES: "conversation_messages",
  MARKETPLACE_LISTINGS: "marketplace_listings",
  MARKETPLACE_SELLERS: "marketplace_sellers",
} as const;

export class TypesenseSyncService {
  /**
   * Initialize all collection schemas in Typesense if they don't exist
   */
  async initializeCollections(): Promise<void> {
    const collections = [
      {
        name: COLLECTIONS.USERS,
        fields: [
          { name: "id", type: "string" },
          { name: "username", type: "string" },
          { name: "displayName", type: "string" },
          { name: "reputation", type: "int32" },
          { name: "level", type: "string" },
          { name: "badgeCount", type: "int32" },
          { name: "joinDate", type: "int64" },
        ],
        default_sorting_field: "reputation",
      },
      {
        name: COLLECTIONS.THREADS,
        fields: [
          { name: "id", type: "string" },
          { name: "title", type: "string" },
          { name: "slug", type: "string" },
          { name: "content", type: "string" },
          { name: "tags", type: "string[]", optional: true },
          { name: "author", type: "string" },
          { name: "authorId", type: "string" },
          { name: "forum", type: "string" },
          { name: "forumId", type: "string" },
          { name: "forumSlug", type: "string" },
          { name: "category", type: "string" },
          { name: "categoryId", type: "string" },
          { name: "categorySlug", type: "string" },
          { name: "views", type: "int32" },
          { name: "replies", type: "int32" },
          { name: "visibility", type: "string", facet: true },
          { name: "createdAt", type: "int64" },
        ],
        default_sorting_field: "createdAt",
      },
      {
        name: COLLECTIONS.POSTS,
        fields: [
          { name: "id", type: "string" },
          { name: "content", type: "string" },
          { name: "author", type: "string" },
          { name: "authorId", type: "string" },
          { name: "threadId", type: "string" },
          { name: "threadTitle", type: "string" },
          { name: "threadSlug", type: "string" },
          { name: "forumId", type: "string" },
          { name: "forumSlug", type: "string" },
          { name: "categoryId", type: "string" },
          { name: "categorySlug", type: "string" },
          { name: "visibility", type: "string", facet: true },
          { name: "createdAt", type: "int64" },
        ],
        default_sorting_field: "createdAt",
      },
      {
        name: COLLECTIONS.FORUMS,
        fields: [
          { name: "id", type: "string" },
          { name: "title", type: "string" },
          { name: "description", type: "string", optional: true },
          { name: "category", type: "string" },
        ],
      },
      {
        name: COLLECTIONS.BADGES,
        fields: [
          { name: "id", type: "string" },
          { name: "name", type: "string" },
          { name: "description", type: "string" },
        ],
      },
      {
        name: COLLECTIONS.TROPHIES,
        fields: [
          { name: "id", type: "string" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "points", type: "int32" },
        ],
        default_sorting_field: "points",
      },
      {
        name: COLLECTIONS.CONVERSATION_MESSAGES,
        fields: [
          { name: "id", type: "string" },
          { name: "conversationId", type: "string" },
          { name: "senderId", type: "string" },
          { name: "content", type: "string" },
          { name: "participantIds", type: "string[]", facet: true },
          { name: "createdAt", type: "int64" },
        ],
        default_sorting_field: "createdAt",
      },
      {
        name: COLLECTIONS.MARKETPLACE_LISTINGS,
        fields: [
          { name: "id", type: "string" },
          { name: "title", type: "string" },
          { name: "slug", type: "string" },
          { name: "short_description", type: "string" },
          { name: "seller_id", type: "string" },
          { name: "seller_name", type: "string" },
          { name: "category_id", type: "string" },
          { name: "category_name", type: "string" },
          { name: "listing_type", type: "string" },
          { name: "status", type: "string" },
          { name: "visibility", type: "string", facet: true },
          { name: "base_price", type: "int32" },
          { name: "delivery_days", type: "int32" },
          { name: "revisions", type: "int32" },
          { name: "views", type: "int32" },
          { name: "favorites", type: "int32" },
          { name: "sales", type: "int32" },
          { name: "rating", type: "int32" },
          { name: "review_count", type: "int32" },
          { name: "featured", type: "bool", facet: true },
          { name: "created_at", type: "int64" },
        ],
        default_sorting_field: "created_at",
      },
      {
        name: COLLECTIONS.MARKETPLACE_SELLERS,
        fields: [
          { name: "id", type: "string" },
          { name: "user_id", type: "string" },
          { name: "username", type: "string" },
          { name: "display_name", type: "string" },
          { name: "bio", type: "string" },
          { name: "avatar", type: "string" },
          { name: "website", type: "string" },
          { name: "telegram", type: "string" },
          { name: "discord", type: "string" },
          { name: "joined_marketplace_at", type: "int64" },
          { name: "verification_status", type: "string", facet: true },
          { name: "total_sales", type: "int32" },
          { name: "total_reviews", type: "int32" },
          { name: "average_rating", type: "int32" },
          { name: "trust_score", type: "int32" },
          { name: "response_rate", type: "int32" },
          { name: "response_time", type: "int32" },
          { name: "completion_rate", type: "int32" },
          { name: "is_verified_seller", type: "bool" },
          { name: "is_top_seller", type: "bool" },
          { name: "created_at", type: "int64" },
        ],
        default_sorting_field: "created_at",
      },
    ];

    for (const schemaDef of collections) {
      await typesenseClient.createCollection(schemaDef as any);
    }
  }

  /**
   * Queue an index job
   */
  async queueIndexJob(
    entityType: SearchIndexEntityType,
    entityId: string,
    action: SearchIndexAction,
  ): Promise<void> {
    const db = getDatabase();
    await db.insert(schema.searchIndexJobs).values({
      entityType,
      entityId,
      action,
      status: "PENDING",
    });

    // Trigger queue processing asynchronously in the background
    this.processQueue().catch((error) => {
      console.error(
        "[TypesenseSync] Background queue processing failed:",
        error,
      );
    });
  }

  /**
   * Process all pending jobs in the queue
   */
  async processQueue(): Promise<void> {
    const db = getDatabase();

    // Lock and get pending jobs
    const pendingJobs = await db.query.searchIndexJobs.findMany({
      where: eq(schema.searchIndexJobs.status, "PENDING"),
      limit: 100,
    });

    if (pendingJobs.length === 0) return;

    // Mark as PROCESSING
    const jobIds = pendingJobs.map((j) => j.id);
    await db
      .update(schema.searchIndexJobs)
      .set({ status: "PROCESSING" })
      .where(inArray(schema.searchIndexJobs.id, jobIds));

    for (const job of pendingJobs) {
      try {
        if (job.action === "DELETE") {
          const collection = this.getCollectionName(job.entityType);
          await typesenseClient.deleteDocument(collection, job.entityId);
        } else {
          // CREATE or UPDATE
          const doc = await this.buildDocument(job.entityType, job.entityId);
          if (doc) {
            const collection = this.getCollectionName(job.entityType);
            await typesenseClient.indexDocument(collection, doc);
          }
        }

        await db
          .update(schema.searchIndexJobs)
          .set({
            status: "COMPLETED",
            processedAt: new Date(),
          })
          .where(eq(schema.searchIndexJobs.id, job.id));
      } catch (error: any) {
        console.error(`[TypesenseSync] Job ${job.id} failed:`, error);
        await db
          .update(schema.searchIndexJobs)
          .set({
            status: job.attempts >= 3 ? "FAILED" : "PENDING",
            attempts: job.attempts + 1,
            lastError: error.message || String(error),
          })
          .where(eq(schema.searchIndexJobs.id, job.id));
      }
    }
  }

  /**
   * Triggers a full bulk reindex of an entity
   */
  async bulkSync(entityType: SearchIndexEntityType): Promise<void> {
    const db = getDatabase();
    const collection = this.getCollectionName(entityType);

    // Delete existing collection first
    try {
      await typesenseClient.deleteCollection(collection);
    } catch {}

    // Initialize collections again
    await this.initializeCollections();

    // Fetch and index in batches
    if (entityType === "USER") {
      const records = await db.query.users.findMany();
      const docs = await Promise.all(
        records.map((r) => this.buildDocument("USER", r.id)),
      );
      const filtered = docs.filter(Boolean) as any[];
      if (filtered.length > 0)
        await typesenseClient.indexDocuments(collection, filtered);
    } else if (entityType === "THREAD") {
      const records = await db.query.threads.findMany();
      const docs = await Promise.all(
        records.map((r) => this.buildDocument("THREAD", r.id)),
      );
      const filtered = docs.filter(Boolean) as any[];
      if (filtered.length > 0)
        await typesenseClient.indexDocuments(collection, filtered);
    } else if (entityType === "POST") {
      const records = await db.query.posts.findMany();
      const docs = await Promise.all(
        records.map((r) => this.buildDocument("POST", r.id)),
      );
      const filtered = docs.filter(Boolean) as any[];
      if (filtered.length > 0)
        await typesenseClient.indexDocuments(collection, filtered);
    } else if (entityType === "FORUM") {
      const records = await db.query.forums.findMany();
      const docs = await Promise.all(
        records.map((r) => this.buildDocument("FORUM", r.id)),
      );
      const filtered = docs.filter(Boolean) as any[];
      if (filtered.length > 0)
        await typesenseClient.indexDocuments(collection, filtered);
    } else if (entityType === "BADGE") {
      const records = await db.query.badges.findMany();
      const docs = await Promise.all(
        records.map((r) => this.buildDocument("BADGE", r.id)),
      );
      const filtered = docs.filter(Boolean) as any[];
      if (filtered.length > 0)
        await typesenseClient.indexDocuments(collection, filtered);
    } else if (entityType === "TROPHY") {
      const records = await db.query.trophies.findMany();
      const docs = await Promise.all(
        records.map((r) => this.buildDocument("TROPHY", r.id)),
      );
      const filtered = docs.filter(Boolean) as any[];
      if (filtered.length > 0)
        await typesenseClient.indexDocuments(collection, filtered);
    } else if (entityType === "CONVERSATION_MESSAGE") {
      const records = await db.query.conversationMessages.findMany();
      const docs = await Promise.all(
        records.map((r) => this.buildDocument("CONVERSATION_MESSAGE", r.id)),
      );
      const filtered = docs.filter(Boolean) as any[];
      if (filtered.length > 0)
        await typesenseClient.indexDocuments(collection, filtered);
    }
  }

  // Helpers
  private getCollectionName(type: SearchIndexEntityType): string {
    switch (type) {
      case "USER":
        return COLLECTIONS.USERS;
      case "THREAD":
        return COLLECTIONS.THREADS;
      case "POST":
        return COLLECTIONS.POSTS;
      case "FORUM":
        return COLLECTIONS.FORUMS;
      case "BADGE":
        return COLLECTIONS.BADGES;
      case "TROPHY":
        return COLLECTIONS.TROPHIES;
      case "CONVERSATION_MESSAGE":
        return COLLECTIONS.CONVERSATION_MESSAGES;
      case "MARKETPLACE_LISTING":
        return COLLECTIONS.MARKETPLACE_LISTINGS;
      case "MARKETPLACE_SELLER":
        return COLLECTIONS.MARKETPLACE_SELLERS;
      default:
        throw new Error(`Unknown entity type: ${type}`);
    }
  }

  private async buildDocument(
    type: SearchIndexEntityType,
    id: string,
  ): Promise<Record<string, any> | null> {
    const db = getDatabase();

    if (type === "USER") {
      const record = (await db.query.users.findFirst({
        where: eq(schema.users.id, id),
        with: {
          badges: true,
          reputation: true,
        } as any,
      })) as any;
      if (!record) return null;

      return {
        id: record.id,
        username: record.username ?? "",
        displayName: record.displayName ?? record.username ?? "",
        reputation: (record as any).reputation?.reputationPoints ?? 0,
        level: "Level 1", // Mocked or fetched from levels helper
        badgeCount: record.badges?.length ?? 0,
        joinDate: record.createdAt.getTime(),
      };
    }

    if (type === "THREAD") {
      const record = (await db.query.threads.findFirst({
        where: eq(schema.threads.id, id),
        with: {
          author: true,
          forum: {
            with: {
              category: true,
            },
          },
          tags: true,
        } as any,
      })) as any;
      if (!record || record.status !== "PUBLISHED") return null;

      return {
        id: record.id,
        title: record.title,
        slug: record.slug,
        content: record.content,
        tags: record.tags?.map((t: any) => t.tag) ?? [],
        author:
          (record as any).author?.displayName ??
          (record as any).author?.username ??
          "Unknown",
        authorId: record.authorId,
        forum: (record as any).forum?.title ?? "General",
        forumId: record.forumId,
        forumSlug: (record as any).forum?.slug ?? "general",
        category: (record as any).forum?.category?.title ?? "General",
        categoryId: (record as any).forum?.categoryId ?? "",
        categorySlug: (record as any).forum?.category?.slug ?? "general",
        views: record.viewCount,
        replies: record.replyCount,
        visibility: record.visibility,
        createdAt: record.createdAt.getTime(),
      };
    }

    if (type === "POST") {
      const record = (await db.query.posts.findFirst({
        where: eq(schema.posts.id, id),
        with: {
          author: true,
          thread: {
            with: {
              forum: {
                with: {
                  category: true,
                },
              },
            },
          },
        } as any,
      })) as any;
      if (
        !record ||
        record.status !== "PUBLISHED" ||
        (record as any).thread?.status !== "PUBLISHED"
      )
        return null;

      return {
        id: record.id,
        content: record.content,
        author:
          (record as any).author?.displayName ??
          (record as any).author?.username ??
          "Unknown",
        authorId: record.authorId,
        threadId: record.threadId,
        threadTitle: (record as any).thread?.title ?? "",
        threadSlug: (record as any).thread?.slug ?? "",
        forumId: (record as any).thread?.forumId ?? "",
        forumSlug: (record as any).thread?.forum?.slug ?? "",
        categoryId: (record as any).thread?.forum?.categoryId ?? "",
        categorySlug: (record as any).thread?.forum?.category?.slug ?? "",
        visibility: (record as any).thread?.visibility ?? "PUBLIC",
        createdAt: record.createdAt.getTime(),
      };
    }

    if (type === "FORUM") {
      const record = await db.query.forums.findFirst({
        where: eq(schema.forums.id, id),
        with: {
          category: true,
        } as any,
      });
      if (!record || !record.isVisible) return null;

      return {
        id: record.id,
        title: record.title,
        description: record.description ?? "",
        category: (record as any).category?.title ?? "General",
      };
    }

    if (type === "BADGE") {
      const record = await db.query.badges.findFirst({
        where: eq(schema.badges.id, id),
      });
      if (!record) return null;

      return {
        id: record.id,
        name: record.name,
        description: record.description ?? "",
      };
    }

    if (type === "TROPHY") {
      const record = (await db.query.trophies.findFirst({
        where: eq(schema.trophies.id, id),
      })) as any;
      if (!record) return null;

      return {
        id: record.id,
        title: record.title,
        description: record.description ?? "",
        points: record.reputationReward ?? 0,
      };
    }

    if (type === "CONVERSATION_MESSAGE") {
      const record = await db.query.conversationMessages.findFirst({
        where: eq(schema.conversationMessages.id, id),
      });
      if (!record || record.isDeleted) return null;

      // Extract raw text content from TipTap JSON
      const extractText = (node: any): string => {
        if (!node) return "";
        if (node.type === "text") return node.text || "";
        if (node.content && Array.isArray(node.content)) {
          return node.content.map(extractText).join(" ");
        }
        return "";
      };

      const plainText = extractText(record.contentJson);

      // Find participants
      const parts = await db.query.conversationParticipants.findMany({
        where: eq(
          schema.conversationParticipants.conversationId,
          record.conversationId,
        ),
      });

      const participantIds = parts.map((p) => p.userId);

      return {
        id: record.id,
        conversationId: record.conversationId,
        senderId: record.senderId,
        content: plainText,
        participantIds,
        createdAt: record.createdAt.getTime(),
      };
    }
    if (type === "MARKETPLACE_LISTING") {
      const record = (await db.query.marketplaceListings.findFirst({
        where: eq(schema.marketplaceListings.id, id),
        with: {
          seller: true,
          category: true,
        },
      })) as any;
      if (!record) return null;

      return {
        id: record.id,
        title: record.title,
        slug: record.slug,
        short_description: record.shortDescription,
        seller_id: record.sellerId,
        seller_name: record.seller?.displayName ?? "",
        category_id: record.categoryId,
        category_name: record.category?.name ?? "",
        listing_type: record.listingType,
        status: record.status,
        visibility: record.visibility,
        base_price: record.basePrice,
        delivery_days: record.deliveryDays,
        revisions: record.revisions,
        views: record.views,
        favorites: record.favorites,
        sales: record.sales,
        rating: Math.round((record.rating ?? 0) * 10),
        review_count: record.reviewCount,
        featured: record.featured,
        created_at: record.createdAt.getTime(),
      };
    }
    if (type === "MARKETPLACE_SELLER") {
      const record = (await db.query.sellerProfiles.findFirst({
        where: eq(schema.sellerProfiles.id, id),
        with: {
          user: true,
        },
      })) as any;
      if (!record) return null;

      return {
        id: record.id,
        user_id: record.userId,
        username: record.user?.username ?? "",
        display_name: record.displayName ?? "",
        bio: record.bio ?? "",
        avatar: record.avatar ?? "",
        website: record.website ?? "",
        telegram: record.telegram ?? "",
        discord: record.discord ?? "",
        joined_marketplace_at: record.joinedMarketplaceAt.getTime(),
        verification_status: record.verificationStatus,
        total_sales: record.totalSales,
        total_reviews: record.totalReviews,
        average_rating: Math.round((record.averageRating ?? 0) * 10),
        trust_score: record.trustScore,
        response_rate: record.responseRate,
        response_time: record.responseTime,
        completion_rate: record.completionRate,
        is_verified_seller: record.isVerifiedSeller,
        is_top_seller: record.isTopSeller,
        created_at: record.createdAt.getTime(),
      };
    }

    return null;
  }
}

export const typesenseSyncService = new TypesenseSyncService();
export default typesenseSyncService;
