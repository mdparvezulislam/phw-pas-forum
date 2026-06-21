import "server-only";
import { getDatabase } from "@/db";
import { getEnv } from "@/validations/env";
import { logger } from "@/lib/logger";

interface IndexRecommendation {
  table: string;
  columns: string[];
  type: "btree" | "gin" | "gist" | "hash" | "brin";
  name: string;
  description: string;
  estimatedImpact: "critical" | "high" | "medium" | "low";
  condition?: string;
}

interface MissingIndex {
  table: string;
  columns: string[];
  query: string;
  seqScan: boolean;
  estimatedRows: number;
}

export class IndexStrategyService {
  async getRecommendedIndexes(): Promise<IndexRecommendation[]> {
    return [
      {
        table: "users",
        columns: ["email"],
        type: "btree",
        name: "idx_users_email",
        description: "User lookup by email (login/auth)",
        estimatedImpact: "critical",
      },
      {
        table: "users",
        columns: ["username"],
        type: "btree",
        name: "idx_users_username",
        description: "User lookup by username (profiles, mentions)",
        estimatedImpact: "critical",
      },
      {
        table: "users",
        columns: ["role_id"],
        type: "btree",
        name: "idx_users_role_id",
        description: "User filtering by role (admin queries)",
        estimatedImpact: "medium",
      },
      {
        table: "users",
        columns: ["is_banned", "is_verified"],
        type: "btree",
        name: "idx_users_status",
        description: "User status filtering (moderation)",
        estimatedImpact: "high",
      },
      {
        table: "users",
        columns: ["created_at"],
        type: "brin",
        name: "idx_users_created_at_brin",
        description: "New user queries, registration analytics",
        estimatedImpact: "medium",
      },
      {
        table: "threads",
        columns: ["forum_id", "status", "visibility", "created_at"],
        type: "btree",
        name: "idx_threads_forum_status_visibility_created",
        description: "Primary thread listing query",
        estimatedImpact: "critical",
      },
      {
        table: "threads",
        columns: ["author_id", "created_at"],
        type: "btree",
        name: "idx_threads_author_created",
        description: "User thread listing (profile, dashboard)",
        estimatedImpact: "high",
      },
      {
        table: "threads",
        columns: ["title"],
        type: "gin",
        name: "idx_threads_title_trgm",
        description: "Text search on thread titles (pg_trgm)",
        estimatedImpact: "high",
        condition: "Requires pg_trgm extension",
      },
      {
        table: "threads",
        columns: ["slug"],
        type: "btree",
        name: "idx_threads_slug",
        description: "Unique thread lookup by slug",
        estimatedImpact: "critical",
      },
      {
        table: "threads",
        columns: ["is_pinned", "created_at"],
        type: "btree",
        name: "idx_threads_pinned_created",
        description: "Pinned threads listing",
        estimatedImpact: "high",
      },
      {
        table: "threads",
        columns: ["status", "visibility"],
        type: "btree",
        name: "idx_threads_status_visibility",
        description: "Thread visibility filtering",
        estimatedImpact: "high",
      },
      {
        table: "posts",
        columns: ["thread_id", "post_number"],
        type: "btree",
        name: "idx_posts_thread_number",
        description: "Sequential post retrieval within thread",
        estimatedImpact: "critical",
      },
      {
        table: "posts",
        columns: ["author_id", "created_at"],
        type: "btree",
        name: "idx_posts_author_created",
        description: "User's post history",
        estimatedImpact: "high",
      },
      {
        table: "posts",
        columns: ["thread_id", "status"],
        type: "btree",
        name: "idx_posts_thread_status",
        description: "Filter visible posts in thread",
        estimatedImpact: "high",
      },
      {
        table: "posts",
        columns: ["created_at"],
        type: "brin",
        name: "idx_posts_created_at_brin",
        description: "Time-based post queries",
        estimatedImpact: "medium",
      },
      {
        table: "reactions",
        columns: ["target_id", "target_type"],
        type: "btree",
        name: "idx_reactions_target",
        description: "Reaction lookup by target",
        estimatedImpact: "critical",
      },
      {
        table: "reactions",
        columns: ["user_id", "target_id", "target_type"],
        type: "btree",
        name: "idx_reactions_user_target",
        description: "User reaction check (unique constraint backing)",
        estimatedImpact: "critical",
      },
      {
        table: "reputation_transactions",
        columns: ["user_id", "created_at"],
        type: "btree",
        name: "idx_reputation_user_created",
        description: "User reputation history",
        estimatedImpact: "high",
      },
      {
        table: "reputation_transactions",
        columns: ["entity_id", "entity_type"],
        type: "btree",
        name: "idx_reputation_entity",
        description: "Reputation lookup by entity",
        estimatedImpact: "high",
      },
      {
        table: "notifications",
        columns: ["user_id", "is_read", "created_at"],
        type: "btree",
        name: "idx_notifications_user_read_created",
        description: "Unread notification queries",
        estimatedImpact: "critical",
      },
      {
        table: "notifications",
        columns: ["type", "created_at"],
        type: "btree",
        name: "idx_notifications_type_created",
        description: "Notification type filtering",
        estimatedImpact: "medium",
      },
      {
        table: "conversation_messages",
        columns: ["conversation_id", "created_at"],
        type: "btree",
        name: "idx_conversation_messages_conv_created",
        description: "Message retrieval within conversation",
        estimatedImpact: "critical",
      },
      {
        table: "conversation_messages",
        columns: ["sender_id", "created_at"],
        type: "btree",
        name: "idx_conversation_messages_sender",
        description: "User's sent messages",
        estimatedImpact: "high",
      },
      {
        table: "conversation_participants",
        columns: ["user_id", "conversation_id"],
        type: "btree",
        name: "idx_conv_participants_user_conv",
        description: "User's conversations lookup",
        estimatedImpact: "critical",
      },
      {
        table: "marketplace_listings",
        columns: ["seller_id", "status", "created_at"],
        type: "btree",
        name: "idx_listings_seller_status_created",
        description: "Seller's listings",
        estimatedImpact: "critical",
      },
      {
        table: "marketplace_listings",
        columns: ["category_id", "status", "visibility"],
        type: "btree",
        name: "idx_listings_category_status_visibility",
        description: "Category browsing",
        estimatedImpact: "critical",
      },
      {
        table: "marketplace_listings",
        columns: ["status", "visibility", "rating", "created_at"],
        type: "btree",
        name: "idx_listings_discover",
        description: "Listing discovery and search",
        estimatedImpact: "critical",
      },
      {
        table: "marketplace_listings",
        columns: ["slug"],
        type: "btree",
        name: "idx_listings_slug",
        description: "Unique listing lookup",
        estimatedImpact: "critical",
      },
      {
        table: "orders",
        columns: ["buyer_id", "created_at"],
        type: "btree",
        name: "idx_orders_buyer_created",
        description: "Buyer's order history",
        estimatedImpact: "critical",
      },
      {
        table: "orders",
        columns: ["seller_id", "created_at"],
        type: "btree",
        name: "idx_orders_seller_created",
        description: "Seller's order history",
        estimatedImpact: "critical",
      },
      {
        table: "orders",
        columns: ["listing_id", "status"],
        type: "btree",
        name: "idx_orders_listing_status",
        description: "Orders for a listing",
        estimatedImpact: "high",
      },
      {
        table: "orders",
        columns: ["order_number"],
        type: "btree",
        name: "idx_orders_order_number",
        description: "Order number lookup",
        estimatedImpact: "critical",
      },
      {
        table: "orders",
        columns: ["status", "created_at"],
        type: "btree",
        name: "idx_orders_status_created",
        description: "Order status filtering",
        estimatedImpact: "high",
      },
      {
        table: "audit_logs",
        columns: ["user_id", "created_at"],
        type: "btree",
        name: "idx_audit_logs_user_created",
        description: "User audit trail",
        estimatedImpact: "high",
      },
      {
        table: "audit_logs",
        columns: ["action", "created_at"],
        type: "brin",
        name: "idx_audit_logs_action_created_brin",
        description: "Action-based audit queries",
        estimatedImpact: "medium",
      },
      {
        table: "ai_moderation_results",
        columns: ["entity_id", "entity_type"],
        type: "btree",
        name: "idx_ai_moderation_entity",
        description: "AI moderation lookup",
        estimatedImpact: "high",
      },
      {
        table: "ai_moderation_results",
        columns: ["decision", "created_at"],
        type: "btree",
        name: "idx_ai_moderation_decision",
        description: "Moderation decision filtering",
        estimatedImpact: "medium",
      },
      {
        table: "search_index_jobs",
        columns: ["status", "created_at"],
        type: "btree",
        name: "idx_search_index_jobs_status_created",
        description: "Pending job processing",
        estimatedImpact: "critical",
      },
      {
        table: "seller_profiles",
        columns: ["user_id"],
        type: "btree",
        name: "idx_seller_profiles_user",
        description: "Seller profile lookup",
        estimatedImpact: "critical",
      },
      {
        table: "seller_profiles",
        columns: ["verification_status", "trust_score"],
        type: "btree",
        name: "idx_seller_profiles_verification_trust",
        description: "Verified/top seller queries",
        estimatedImpact: "high",
      },
    ];
  }

  async detectMissingIndexes(): Promise<MissingIndex[]> {
    const db = getDatabase();
    try {
      const result = await db.execute(
        `SELECT
          schemaname || '.' || relname AS table_name,
          seq_scan,
          seq_tup_read,
          idx_scan,
          seq_tup_read / NULLIF(seq_scan, 0) AS avg_rows_per_seq_scan
        FROM pg_stat_user_tables
        WHERE seq_scan > 1000
          AND seq_tup_read / NULLIF(seq_scan, 0) > 100
        ORDER BY seq_tup_read DESC
        LIMIT 20`,
      );
      const rows = result as unknown as Array<{
        table_name: string;
        seq_scan: number;
        seq_tup_read: number;
        avg_rows_per_seq_scan: number;
      }>;
      return (Array.isArray(rows) ? rows : []).map((row: any) => ({
        table: row.table_name ?? "unknown",
        columns: [],
        query: `Potential missing index on ${row.table_name} (${row.seq_scan} seq scans, ~${Math.round(row.avg_rows_per_seq_scan || 0)} rows/scan)`,
        seqScan: (row.seq_scan ?? 0) > 100,
        estimatedRows: Math.round(row.seq_tup_read || 0),
      }));
    } catch (err) {
      logger.warn("[IndexStrategy] Could not detect missing indexes", {
        error: (err as Error).message,
      });
      return [];
    }
  }

  getCreateIndexSQL(index: IndexRecommendation): string {
    const unique =
      index.name.includes("slug") ||
      index.name.includes("email") ||
      index.name.includes("username");
    const uniqueStr = unique ? "UNIQUE " : "";
    const columns = index.columns.join(", ");
    return `CREATE ${uniqueStr}INDEX IF NOT EXISTS ${index.name} ON ${index.table} USING ${index.type} (${columns});`;
  }

  async generateAllIndexSQL(): Promise<string> {
    const indexes = await this.getRecommendedIndexes();
    return indexes.map((idx) => this.getCreateIndexSQL(idx)).join("\n");
  }

  getCoveringIndexSuggestions(): string[] {
    return [
      `CREATE INDEX CONCURRENTLY idx_threads_listing
        ON threads (forum_id, status, visibility, created_at DESC)
        INCLUDE (id, title, slug, author_id, view_count, reply_count, reaction_count);`,

      `CREATE INDEX CONCURRENTLY idx_posts_thread_listing
        ON posts (thread_id, post_number, status)
        INCLUDE (id, author_id, created_at);`,

      `CREATE INDEX CONCURRENTLY idx_listings_search
        ON marketplace_listings (status, visibility, category_id, rating DESC NULLS LAST)
        INCLUDE (id, title, slug, seller_id, base_price, sales);`,
    ];
  }
}

export const indexStrategyService = new IndexStrategyService();
