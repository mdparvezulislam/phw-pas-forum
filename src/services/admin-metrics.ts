import "server-only";

import { and, eq, gte, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";

export class AdminMetricsService {
  async getPlatformOverview() {
    const db = getDatabase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalUsers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users);

    const [newToday] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(gte(schema.users.createdAt, today));

    const [newThisMonth] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(gte(schema.users.createdAt, thisMonth));

    const [activeUsers] = await db
      .select({ count: sql<number>`count(distinct user_id)` })
      .from(schema.auditLogs)
      .where(
        and(
          gte(schema.auditLogs.createdAt, today),
          eq(schema.auditLogs.action, "auth:login"),
        ),
      );

    const [totalThreads] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.threads);

    const [totalPosts] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.posts);

    const [totalListings] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.marketplaceListings)
      .where(eq(schema.marketplaceListings.status, "ACTIVE"));

    const [totalOrders] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.orders);

    const [completedOrders] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.orders)
      .where(eq(schema.orders.status, "COMPLETED"));

    const [revenue] = await db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(schema.transactions)
      .where(
        and(
          eq(schema.transactions.type, "PAYMENT"),
          eq(schema.transactions.status, "SUCCESS"),
        ),
      );

    const [disputedOrders] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.orders)
      .where(eq(schema.orders.status, "DISPUTED"));

    const [totalVip] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.userMemberships)
      .where(eq(schema.userMemberships.status, "ACTIVE"));

    const [totalReports] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.postReports)
      .where(eq(schema.postReports.status, "OPEN"));

    const [pendingSubmissions] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.marketplaceSubmissions)
      .where(eq(schema.marketplaceSubmissions.status, "PENDING"));

    return {
      totalUsers: Number(totalUsers?.count ?? 0),
      newToday: Number(newToday?.count ?? 0),
      newThisMonth: Number(newThisMonth?.count ?? 0),
      activeUsersToday: Number(activeUsers?.count ?? 0),
      totalThreads: Number(totalThreads?.count ?? 0),
      totalPosts: Number(totalPosts?.count ?? 0),
      totalListings: Number(totalListings?.count ?? 0),
      totalOrders: Number(totalOrders?.count ?? 0),
      completedOrders: Number(completedOrders?.count ?? 0),
      revenue: Number(revenue?.total ?? 0),
      disputedOrders: Number(disputedOrders?.count ?? 0),
      activeVip: Number(totalVip?.count ?? 0),
      pendingReports: Number(totalReports?.count ?? 0),
      pendingSubmissions: Number(pendingSubmissions?.count ?? 0),
    };
  }

  async getUserAnalytics(days = 30) {
    const db = getDatabase();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const registrations = await db
      .select({
        date: sql<string>`DATE(${schema.users.createdAt})`,
        count: sql<number>`count(*)`,
      })
      .from(schema.users)
      .where(gte(schema.users.createdAt, since))
      .groupBy(sql`DATE(${schema.users.createdAt})`)
      .orderBy(sql`DATE(${schema.users.createdAt})`);

    return { registrations, days };
  }

  async getRevenueAnalytics(days = 30) {
    const db = getDatabase();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const dailyRevenue = await db
      .select({
        date: sql<string>`DATE(${schema.transactions.createdAt})`,
        amount: sql<number>`COALESCE(SUM(${schema.transactions.amount}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(schema.transactions)
      .where(
        and(
          eq(schema.transactions.type, "PAYMENT"),
          eq(schema.transactions.status, "SUCCESS"),
          gte(schema.transactions.createdAt, since),
        ),
      )
      .groupBy(sql`DATE(${schema.transactions.createdAt})`)
      .orderBy(sql`DATE(${schema.transactions.createdAt})`);

    const totalRevenue = dailyRevenue.reduce(
      (sum, r) => sum + Number(r.amount),
      0,
    );

    return { dailyRevenue, totalRevenue, days };
  }

  async getOrderAnalytics(days = 30) {
    const db = getDatabase();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const dailyOrders = await db
      .select({
        date: sql<string>`DATE(${schema.orders.createdAt})`,
        count: sql<number>`count(*)`,
        revenue: sql<number>`COALESCE(SUM(${schema.orders.amount}), 0)`,
      })
      .from(schema.orders)
      .where(gte(schema.orders.createdAt, since))
      .groupBy(sql`DATE(${schema.orders.createdAt})`)
      .orderBy(sql`DATE(${schema.orders.createdAt})`);

    const statusBreakdown = await db
      .select({
        status: schema.orders.status,
        count: sql<number>`count(*)`,
      })
      .from(schema.orders)
      .groupBy(schema.orders.status);

    return { dailyOrders, statusBreakdown, days };
  }

  async getForumAnalytics() {
    const db = getDatabase();

    const topCategories = await db
      .select({
        name: schema.categories.title,
        threadCount: sql<number>`count(distinct ${schema.threads.id})`,
        postCount: sql<number>`count(distinct ${schema.posts.id})`,
      })
      .from(schema.categories)
      .leftJoin(
        schema.forums,
        eq(schema.forums.categoryId, schema.categories.id),
      )
      .leftJoin(schema.threads, eq(schema.threads.forumId, schema.forums.id))
      .leftJoin(schema.posts, eq(schema.posts.threadId, schema.threads.id))
      .groupBy(schema.categories.id, schema.categories.title)
      .orderBy(sql`count(distinct ${schema.threads.id}) desc`)
      .limit(10);

    return { topCategories };
  }

  async getMarketplaceAnalytics() {
    const db = getDatabase();

    const topSellers = await db
      .select({
        userId: schema.sellerProfiles.userId,
        displayName: schema.users.displayName,
        username: schema.users.username,
        totalSales: schema.sellerProfiles.totalSales,
        averageRating: schema.sellerProfiles.averageRating,
        trustScore: schema.sellerProfiles.trustScore,
      })
      .from(schema.sellerProfiles)
      .innerJoin(
        schema.users,
        eq(schema.sellerProfiles.userId, schema.users.id),
      )
      .orderBy(sql`${schema.sellerProfiles.totalSales} desc`)
      .limit(10);

    const categoryBreakdown = await db
      .select({
        name: schema.marketplaceCategories.name,
        count: sql<number>`count(*)`,
      })
      .from(schema.marketplaceCategories)
      .leftJoin(
        schema.marketplaceListings,
        eq(
          schema.marketplaceListings.categoryId,
          schema.marketplaceCategories.id,
        ),
      )
      .groupBy(schema.marketplaceCategories.name)
      .orderBy(sql`count(*) desc`);

    return { topSellers, categoryBreakdown };
  }

  async getMembershipAnalytics() {
    const db = getDatabase();

    const plans = await db.query.membershipPlans.findMany({
      with: {
        userMemberships: {
          where: eq(schema.userMemberships.status, "ACTIVE"),
        },
      },
    });

    const activeByPlan = plans.map((plan) => ({
      planName: plan.name,
      slug: plan.slug,
      activeCount: plan.userMemberships?.length ?? 0,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
    }));

    const totalActive = activeByPlan.reduce((sum, p) => sum + p.activeCount, 0);

    return { activeByPlan, totalActive };
  }

  async getSearchAnalytics(days = 7) {
    const db = getDatabase();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const topSearches = await db
      .select({
        query: schema.searchQueries.query,
        count: sql<number>`count(*)`,
      })
      .from(schema.searchQueries)
      .where(gte(schema.searchQueries.searchedAt, since))
      .groupBy(schema.searchQueries.query)
      .orderBy(sql`count(*) desc`)
      .limit(20);

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.searchQueries)
      .where(gte(schema.searchQueries.searchedAt, since));

    return { topSearches, totalSearches: Number(total[0]?.count ?? 0), days };
  }

  async getStaffActivity(days = 7) {
    const db = getDatabase();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const activity = await db
      .select({
        staffId: schema.staffActionLogs.staffId,
        action: schema.staffActionLogs.action,
        count: sql<number>`count(*)`,
      })
      .from(schema.staffActionLogs)
      .where(gte(schema.staffActionLogs.createdAt, since))
      .groupBy(schema.staffActionLogs.staffId, schema.staffActionLogs.action)
      .orderBy(sql`count(*) desc`)
      .limit(50);

    return { activity, days };
  }
}

export const adminMetricsService = new AdminMetricsService();
