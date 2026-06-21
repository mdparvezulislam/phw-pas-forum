import { endOfDay, startOfDay } from "date-fns";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import { RoleName } from "@/types/rbac";
import { ModelRouter } from "../models/router";
import { PromptManager } from "../prompts";
import { OpenRouterProvider } from "../providers/openrouter";
import type { AICompletionOptions, AIResult } from "../types";

export class AIOrchestrator {
  /**
   * Runs an AI task using OpenRouter gateway, falling back across models if needed.
   * Also verifies user-specific daily limits and accumulates microcent costs.
   */
  static async run(
    feature: string,
    variables: Record<string, string>,
    options: {
      userId?: string;
      actionType: string;
      responseFormat?: "text" | "json";
    },
  ): Promise<AIResult> {
    const db = getDatabase();
    const userId = options.userId;

    // 1. If user is guest or member, enforce role limits
    if (userId) {
      try {
        const limitAllowed = await AIOrchestrator.getUserDailyLimit(userId);
        if (limitAllowed <= 0) {
          throw new Error("Guests do not have access to AI features.");
        }

        if (limitAllowed !== Infinity) {
          const todayStart = startOfDay(new Date());
          const todayEnd = endOfDay(new Date());

          const [{ cnt }] = await db
            .select({ cnt: count() })
            .from(schema.aiUsageLogs)
            .where(
              and(
                eq(schema.aiUsageLogs.userId, userId),
                gte(schema.aiUsageLogs.createdAt, todayStart),
                lte(schema.aiUsageLogs.createdAt, todayEnd),
                eq(schema.aiUsageLogs.success, true),
              ),
            );

          if (cnt >= limitAllowed) {
            throw new Error(
              `Daily AI quota of ${limitAllowed} requests reached for your tier.`,
            );
          }
        }
      } catch (err: any) {
        return {
          text: "",
          inputTokens: 0,
          outputTokens: 0,
          latencyMs: 0,
          costMicrocents: 0,
          success: false,
          error: err.message || String(err),
        };
      }
    }

    // 2. Fetch prompt configuration and template format
    let promptConfig;
    try {
      promptConfig = await PromptManager.getPrompt(feature);
    } catch {
      promptConfig = {
        systemPrompt: "You are a helpful platform AI assistant.",
        userPromptTemplate: variables.query || variables.body || "",
        modelId: "google/gemini-2.0-flash-exp:free",
        providerId: "openrouter",
      };
    }

    const formattedPrompt = PromptManager.formatPrompt(
      promptConfig.userPromptTemplate,
      variables,
    );

    // 3. Resolve config-driven model routes (primary + fallbacks)
    const route = ModelRouter.getRoute(feature);
    const modelsToTry = [
      promptConfig.modelId,
      route.primary,
      ...route.fallbacks,
    ];
    // Remove duplicates
    const uniqueModels = Array.from(new Set(modelsToTry));

    // 4. Run through OpenRouter Gateway
    const completionOptions: AICompletionOptions = {
      systemInstruction: promptConfig.systemPrompt,
      responseFormat: options.responseFormat,
    };

    const result = await OpenRouterProvider.call(
      uniqueModels,
      formattedPrompt,
      completionOptions,
    );

    // 5. Track tokens and cost in database
    if (userId) {
      try {
        await db.insert(schema.aiUsageLogs).values({
          userId,
          actionType: options.actionType,
          provider: "openrouter",
          model: result.success
            ? result.text.includes("mock")
              ? "mock"
              : uniqueModels[0]
            : "failed",
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          costMicrocents: result.costMicrocents,
          latencyMs: result.latencyMs,
          success: result.success,
          errorMessage: result.error || null,
        });

        // Also increment global/role cost limits usage if not free
        if (result.costMicrocents > 0) {
          await db
            .update(schema.aiCostLimits)
            .set({
              currentDailyUsageMicrocents: sql`${schema.aiCostLimits.currentDailyUsageMicrocents} + ${result.costMicrocents}`,
              currentMonthlyUsageMicrocents: sql`${schema.aiCostLimits.currentMonthlyUsageMicrocents} + ${result.costMicrocents}`,
            })
            .where(eq(schema.aiCostLimits.targetType, "USER"));
        }
      } catch {
        // Quiet fail to ensure user response goes through even if audit logging drops
      }
    }

    return result;
  }

  private static async getUserDailyLimit(userId: string): Promise<number> {
    const db = getDatabase();
    try {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, userId),
        with: {
          role: true,
        },
      });

      const roleName = user?.role?.name as RoleName;

      if (roleName === RoleName.ADMIN || roleName === RoleName.SUPER_ADMIN) {
        return Infinity;
      }
      if (roleName === RoleName.GUEST) {
        return 0;
      }

      // Check user active membership status
      const membership = await db.query.userMemberships.findFirst({
        where: and(
          eq(schema.userMemberships.userId, userId),
          eq(schema.userMemberships.status, "ACTIVE"),
        ),
        with: {
          plan: true,
        },
      });

      if (membership) {
        const planSlug = membership.plan?.slug?.toUpperCase();
        if (planSlug === "ELITE" || planSlug === "LIFETIME") {
          return 1000;
        }
        if (planSlug === "VIP") {
          return 200;
        }
      }

      if (roleName === RoleName.VIP) {
        return 200;
      }

      return 20; // Default Member quota
    } catch {
      return 20; // Default fallback if DB fails
    }
  }
}
