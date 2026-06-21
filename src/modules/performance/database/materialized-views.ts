import "server-only";
import { getDatabase } from "@/db";
import { logger } from "@/lib/logger";

interface MaterializedViewDefinition {
  name: string;
  query: string;
  refreshSchedule:
    | "every_minute"
    | "every_5_minutes"
    | "every_hour"
    | "every_6_hours"
    | "daily";
  description: string;
  indexes: string[];
}

export class MaterializedViewService {
  getViewDefinitions(): MaterializedViewDefinition[] {
    return [
      {
        name: "mv_thread_stats",
        query: `
          SELECT
            f.id AS forum_id,
            f.title AS forum_title,
            c.id AS category_id,
            c.title AS category_title,
            COUNT(t.id) AS thread_count,
            COUNT(t.id) FILTER (WHERE t.created_at >= now() - interval '24 hours') AS threads_last_24h,
            COUNT(t.id) FILTER (WHERE t.created_at >= now() - interval '7 days') AS threads_last_7d,
            MAX(t.created_at) AS last_thread_at,
            COALESCE(SUM(t.view_count), 0) AS total_views,
            COALESCE(SUM(t.reply_count), 0) AS total_replies,
            COALESCE(SUM(t.reaction_count), 0) AS total_reactions
          FROM forums f
          JOIN categories c ON c.id = f.category_id
          LEFT JOIN threads t ON t.forum_id = f.id AND t.status = 'PUBLISHED' AND t.visibility = 'PUBLIC'
          GROUP BY f.id, f.title, c.id, c.title
        `,
        refreshSchedule: "every_5_minutes",
        description: "Aggregated forum statistics for listing pages",
        indexes: ["CREATE UNIQUE INDEX ON mv_thread_stats (forum_id)"],
      },
      {
        name: "mv_user_stats",
        query: `
          SELECT
            u.id AS user_id,
            u.username,
            u.display_name,
            u.created_at AS join_date,
            COALESCE(r.reputation_points, 0) AS reputation_points,
            COALESCE(r.trust_score, 0) AS trust_score,
            COALESCE(r.trophy_count, 0) AS trophy_count,
            COALESCE(r.badge_count, 0) AS badge_count,
            COALESCE(t.thread_count, 0) AS thread_count,
            COALESCE(p.post_count, 0) AS post_count,
            COALESCE(l.listing_count, 0) AS listing_count,
            COALESCE(o.seller_order_count, 0) AS sales_count,
            COALESCE(ur.total_reactions_received, 0) AS reactions_received
          FROM users u
          LEFT JOIN user_reputation r ON r.user_id = u.id
          LEFT JOIN (
            SELECT author_id, COUNT(*) AS thread_count
            FROM threads WHERE status = 'PUBLISHED'
            GROUP BY author_id
          ) t ON t.author_id = u.id
          LEFT JOIN (
            SELECT author_id, COUNT(*) AS post_count
            FROM posts WHERE status = 'PUBLISHED'
            GROUP BY author_id
          ) p ON p.author_id = u.id
          LEFT JOIN (
            SELECT seller_id, COUNT(*) AS listing_count
            FROM marketplace_listings WHERE status = 'ACTIVE'
            GROUP BY seller_id
          ) l ON l.seller_id = u.id
          LEFT JOIN (
            SELECT seller_id, COUNT(*) AS seller_order_count
            FROM orders WHERE status IN ('COMPLETED', 'DELIVERED')
            GROUP BY seller_id
          ) o ON o.seller_id = u.id
          LEFT JOIN (
            SELECT target_author_id AS user_id, COUNT(*) AS total_reactions_received
            FROM reactions
            GROUP BY target_author_id
          ) ur ON ur.user_id = u.id
        `,
        refreshSchedule: "every_5_minutes",
        description: "Aggregated user statistics for profiles and leaderboards",
        indexes: [
          "CREATE UNIQUE INDEX ON mv_user_stats (user_id)",
          "CREATE INDEX ON mv_user_stats (reputation_points DESC)",
          "CREATE INDEX ON mv_user_stats (sales_count DESC)",
        ],
      },
      {
        name: "mv_listing_stats",
        query: `
          SELECT
            l.id AS listing_id,
            l.seller_id,
            l.category_id,
            l.status,
            l.visibility,
            l.views,
            l.favorites,
            l.sales,
            l.rating,
            l.review_count,
            COALESCE(oi.order_count, 0) AS total_orders,
            COALESCE(oi.completed_orders, 0) AS completed_order_count,
            COALESCE(oi.revenue, 0) AS total_revenue
          FROM marketplace_listings l
          LEFT JOIN (
            SELECT
              listing_id,
              COUNT(*) AS order_count,
              COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed_orders,
              COALESCE(SUM(amount), 0) AS revenue
            FROM orders
            GROUP BY listing_id
          ) oi ON oi.listing_id = l.id
        `,
        refreshSchedule: "every_5_minutes",
        description: "Aggregated marketplace listing statistics",
        indexes: [
          "CREATE UNIQUE INDEX ON mv_listing_stats (listing_id)",
          "CREATE INDEX ON mv_listing_stats (rating DESC NULLS LAST)",
          "CREATE INDEX ON mv_listing_stats (sales DESC)",
        ],
      },
      {
        name: "mv_leaderboard_reputation",
        query: `
          SELECT
            u.id AS user_id,
            u.username,
            u.display_name,
            u.avatar_url,
            COALESCE(r.reputation_points, 0) AS reputation,
            COALESCE(r.trophy_count, 0) AS trophies,
            COALESCE(r.badge_count, 0) AS badges,
            COALESCE(r.helpful_count, 0) AS helpful_count,
            CASE
              WHEN u.role_id IN (SELECT id FROM roles WHERE name IN ('ADMIN', 'SUPER_ADMIN')) THEN false
              ELSE true
            END AS is_eligible,
            u.created_at
          FROM users u
          JOIN user_reputation r ON r.user_id = u.id
          WHERE u.is_banned = false
          ORDER BY r.reputation_points DESC
        `,
        refreshSchedule: "every_hour",
        description: "Reputation leaderboard data",
        indexes: [
          "CREATE UNIQUE INDEX ON mv_leaderboard_reputation (user_id)",
          "CREATE INDEX ON mv_leaderboard_reputation (reputation DESC)",
        ],
      },
      {
        name: "mv_leaderboard_sellers",
        query: `
          SELECT
            sp.user_id,
            u.username,
            u.display_name,
            sp.total_sales,
            sp.average_rating,
            sp.total_reviews,
            sp.trust_score,
            sp.completion_rate,
            sp.response_time,
            sp.is_verified_seller,
            sp.is_top_seller
          FROM seller_profiles sp
          JOIN users u ON u.id = sp.user_id
          WHERE u.is_banned = false
          ORDER BY sp.total_sales DESC
        `,
        refreshSchedule: "every_hour",
        description: "Seller leaderboard data",
        indexes: [
          "CREATE UNIQUE INDEX ON mv_leaderboard_sellers (user_id)",
          "CREATE INDEX ON mv_leaderboard_sellers (total_sales DESC)",
          "CREATE INDEX ON mv_leaderboard_sellers (average_rating DESC NULLS LAST)",
        ],
      },
      {
        name: "mv_daily_analytics",
        query: `
          SELECT
            DATE(created_at) AS day,
            COUNT(*) FILTER (WHERE type = 'THREAD_CREATED') AS threads_created,
            COUNT(*) FILTER (WHERE type = 'POST_CREATED') AS posts_created,
            COUNT(*) FILTER (WHERE type = 'REACTION_CREATED') AS reactions_given,
            COUNT(*) FILTER (WHERE type IN ('USER_REGISTERED', 'USER_LOGIN')) AS user_activity,
            COUNT(DISTINCT user_id) AS active_users
          FROM audit_logs
          WHERE created_at >= now() - interval '30 days'
          GROUP BY DATE(created_at)
          ORDER BY day DESC
        `,
        refreshSchedule: "daily",
        description: "Daily platform analytics for admin dashboard",
        indexes: ["CREATE UNIQUE INDEX ON mv_daily_analytics (day)"],
      },
      {
        name: "mv_marketplace_analytics",
        query: `
          SELECT
            DATE(created_at) AS day,
            COUNT(*) AS orders_created,
            COUNT(*) FILTER (WHERE status = 'COMPLETED') AS orders_completed,
            COUNT(*) FILTER (WHERE status = 'CANCELLED') AS orders_cancelled,
            COUNT(*) FILTER (WHERE status = 'DISPUTED') AS orders_disputed,
            COALESCE(SUM(amount) FILTER (WHERE status = 'COMPLETED'), 0) AS revenue,
            COUNT(DISTINCT buyer_id) AS unique_buyers,
            COUNT(DISTINCT seller_id) AS unique_sellers
          FROM orders
          WHERE created_at >= now() - interval '30 days'
          GROUP BY DATE(created_at)
          ORDER BY day DESC
        `,
        refreshSchedule: "daily",
        description: "Daily marketplace analytics",
        indexes: ["CREATE UNIQUE INDEX ON mv_marketplace_analytics (day)"],
      },
    ];
  }

  async getRefreshSQL(viewName: string): Promise<string> {
    return `REFRESH MATERIALIZED VIEW CONCURRENTLY ${viewName};`;
  }

  async refreshAll(): Promise<void> {
    const db = getDatabase();
    const views = this.getViewDefinitions();

    for (const view of views) {
      try {
        await db.execute(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${view.name}`);
        logger.debug("[MaterializedView] Refreshed", { view: view.name });
      } catch (err: any) {
        if (err.message?.includes("does not exist")) {
          logger.info("[MaterializedView] Creating view", { view: view.name });
          await this.createView(view);
        } else {
          logger.error("[MaterializedView] Refresh failed", err as Error, {
            view: view.name,
          });
        }
      }
    }
  }

  async createView(view: MaterializedViewDefinition): Promise<void> {
    const db = getDatabase();
    try {
      await db.execute(
        `CREATE MATERIALIZED VIEW IF NOT EXISTS ${view.name} AS ${view.query}`,
      );
      for (const idx of view.indexes) {
        await db.execute(idx);
      }
      logger.info("[MaterializedView] Created view with indexes", {
        view: view.name,
      });
    } catch (err) {
      logger.error("[MaterializedView] Creation failed", err as Error, {
        view: view.name,
      });
    }
  }

  async createAllViews(): Promise<void> {
    for (const view of this.getViewDefinitions()) {
      await this.createView(view);
    }
  }

  async dropView(viewName: string): Promise<void> {
    const db = getDatabase();
    await db.execute(`DROP MATERIALIZED VIEW IF EXISTS ${viewName}`);
  }
}

export const materializedViewService = new MaterializedViewService();
