import "server-only";
import { redisService } from "@/modules/performance/cache/redis-service";
import { CACHE_TTL } from "@/constants";
import { logger } from "@/lib/logger";

interface CostMetrics {
  timestamp: string;
  aiCostCents: number;
  storageCostCents: number;
  searchCostCents: number;
  realtimeCostCents: number;
  infrastructureCostCents: number;
  totalCostCents: number;
}

interface CostBudget {
  dailyCents: number;
  monthlyCents: number;
  alertThreshold: number;
}

interface CostBreakdown {
  category: string;
  currentCents: number;
  dailyCents: number;
  monthlyCents: number;
  budgetCents: number;
  percentage: number;
}

export class CostMonitorService {
  private budgets: Record<string, CostBudget> = {
    ai: { dailyCents: 100000, monthlyCents: 2500000, alertThreshold: 0.8 },
    storage: { dailyCents: 50000, monthlyCents: 1500000, alertThreshold: 0.8 },
    search: { dailyCents: 10000, monthlyCents: 300000, alertThreshold: 0.8 },
    realtime: { dailyCents: 20000, monthlyCents: 600000, alertThreshold: 0.8 },
    infrastructure: {
      dailyCents: 200000,
      monthlyCents: 6000000,
      alertThreshold: 0.8,
    },
  };

  async trackAICost(costMicrocents: number): Promise<void> {
    await this.trackCost("ai", costMicrocents / 1000000);
  }

  async trackStorageCost(bytes: number): Promise<void> {
    const costCents = (bytes / 1024 / 1024 / 1024) * 0.01;
    await this.trackCost("storage", costCents);
  }

  async trackSearchRequests(count: number): Promise<void> {
    const costCents = count * 0.0001;
    await this.trackCost("search", costCents);
  }

  async trackRealtimeMessages(count: number): Promise<void> {
    const costCents = count * 0.0005;
    await this.trackCost("realtime", costCents);
  }

  private async trackCost(category: string, costCents: number): Promise<void> {
    const today = new Date().toISOString().split("T")[0];
    const month = new Date().toISOString().substring(0, 7);

    const pipeline = [
      redisService.incrby(
        `cost:daily:${category}:${today}`,
        Math.round(costCents * 100),
      ),
      redisService.incrby(
        `cost:monthly:${category}:${month}`,
        Math.round(costCents * 100),
      ),
      redisService.incrby(
        "cost:daily:total:" + today,
        Math.round(costCents * 100),
      ),
      redisService.expire(`cost:daily:${category}:${today}`, 172800),
      redisService.expire(`cost:daily:total:${today}`, 172800),
    ];

    await Promise.all(pipeline);
  }

  async getCurrentCosts(): Promise<CostMetrics> {
    const today = new Date().toISOString().split("T")[0];
    const month = new Date().toISOString().substring(0, 7);

    const [ai, storage, search, realtime, infra, total] = await Promise.all([
      redisService.get<number>(`cost:daily:ai:${today}`) ?? 0,
      redisService.get<number>(`cost:daily:storage:${today}`) ?? 0,
      redisService.get<number>(`cost:daily:search:${today}`) ?? 0,
      redisService.get<number>(`cost:daily:realtime:${today}`) ?? 0,
      redisService.get<number>(`cost:monthly:infrastructure:${month}`) ?? 0,
      redisService.get<number>(`cost:daily:total:${today}`) ?? 0,
    ]);

    return {
      timestamp: new Date().toISOString(),
      aiCostCents: (ai as number) / 100,
      storageCostCents: (storage as number) / 100,
      searchCostCents: (search as number) / 100,
      realtimeCostCents: (realtime as number) / 100,
      infrastructureCostCents: (infra as number) / 100,
      totalCostCents: (total as number) / 100,
    };
  }

  async getCostBreakdown(): Promise<CostBreakdown[]> {
    const today = new Date().toISOString().split("T")[0];
    const month = new Date().toISOString().substring(0, 7);

    const categories = [
      "ai",
      "storage",
      "search",
      "realtime",
      "infrastructure",
    ];
    const breakdown: CostBreakdown[] = [];

    for (const category of categories) {
      const daily =
        (await redisService.get<number>(`cost:daily:${category}:${today}`)) ??
        0;
      const monthly =
        (await redisService.get<number>(`cost:monthly:${category}:${month}`)) ??
        0;
      const budget = this.budgets[category];

      breakdown.push({
        category,
        currentCents: (daily as number) / 100,
        dailyCents: (daily as number) / 100,
        monthlyCents: (monthly as number) / 100,
        budgetCents: budget.dailyCents,
        percentage: ((daily as number) / budget.dailyCents) * 100,
      });
    }

    return breakdown;
  }

  async checkBudgetAlerts(): Promise<string[]> {
    const alerts: string[] = [];
    const today = new Date().toISOString().split("T")[0];
    const month = new Date().toISOString().substring(0, 7);

    for (const [category, budget] of Object.entries(this.budgets)) {
      const dailySpend =
        ((await redisService.get<number>(`cost:daily:${category}:${today}`)) ??
          0) / 100;
      const monthlySpend =
        ((await redisService.get<number>(
          `cost:monthly:${category}:${month}`,
        )) ?? 0) / 100;

      if (dailySpend > budget.dailyCents * budget.alertThreshold) {
        alerts.push(
          `[${category}] Daily spend $${(dailySpend / 100).toFixed(2)} exceeds ${budget.alertThreshold * 100}% of $${(budget.dailyCents / 100).toFixed(2)} budget`,
        );
      }

      if (monthlySpend > budget.monthlyCents * budget.alertThreshold) {
        alerts.push(
          `[${category}] Monthly spend $${(monthlySpend / 100).toFixed(2)} exceeds ${budget.alertThreshold * 100}% of $${(budget.monthlyCents / 100).toFixed(2)} budget`,
        );
      }
    }

    return alerts;
  }

  async getHealth(): Promise<{
    trackedCategories: number;
    hasAlerts: boolean;
    dailyTotal: number;
  }> {
    const today = new Date().toISOString().split("T")[0];
    const total =
      ((await redisService.get<number>(`cost:daily:total:${today}`)) ?? 0) /
      100;
    const alerts = await this.checkBudgetAlerts();

    return {
      trackedCategories: Object.keys(this.budgets).length,
      hasAlerts: alerts.length > 0,
      dailyTotal: total,
    };
  }
}

export const costMonitorService = new CostMonitorService();
