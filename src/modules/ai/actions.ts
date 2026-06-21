"use server";

import { desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDatabase, schema } from "@/db";
import { requireAuth, requireRole } from "@/modules/auth/guards";
import { RoleName } from "@/types/rbac";
import { AIAnalyticsService } from "./analytics/analytics";
import { AIAssistantService } from "./assistant/assistant";
import { AIMarketplaceIntelligence } from "./marketplace/marketplace";
import { AIModerationEngine } from "./moderation/moderation";
import { AIRecommendationEngine } from "./recommendations/recommendations";
import { AISummariesService } from "./summaries/summaries";

// ─── ASK PLATFORM CHAT ASSISTANT ───
export async function askAIAssistantAction(query: string) {
  try {
    const user = await requireAuth();
    const answer = await AIAssistantService.askAssistant({
      query,
      userId: user.id,
    });
    return { success: true, answer };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

// ─── GENERATE AI THREAD SUMMARY ───
export async function getThreadSummaryAction(threadId: string) {
  try {
    const user = await requireAuth();
    const db = getDatabase();

    const thread = await db.query.threads.findFirst({
      where: eq(schema.threads.id, threadId),
    });

    if (!thread) throw new Error("Thread not found");

    const posts = await db.query.posts.findMany({
      where: eq(schema.posts.threadId, threadId),
      orderBy: [schema.posts.postNumber],
      limit: 10,
      with: {
        author: true,
      },
    });

    const formattedPosts = posts.map((p) => ({
      authorName: p.author.displayName || p.author.username || "Member",
      content: p.content,
    }));

    const summary = await AISummariesService.summarizeThread({
      threadId,
      title: thread.title,
      posts: formattedPosts,
      userId: user.id,
    });

    return { success: true, summary };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

// ─── ENHANCE SELLER LISTING COPY (SELLER COPILOT) ───
export async function enhanceListingAction(params: {
  title: string;
  description: string;
  category: string;
  priceCents: number;
}) {
  try {
    const user = await requireAuth();
    const res = await AIMarketplaceIntelligence.scanListing({
      listingId: "draft",
      title: params.title,
      description: params.description,
      category: params.category,
      priceMicrocents: params.priceCents * 10000, // convert cents to microcents
      userId: user.id,
    });

    return res;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || String(error),
      suggestions: undefined,
    };
  }
}

// ─── UPDATE PROMPT TEMPLATE (ADMIN ONLY) ───
export async function updatePromptTemplateAction(
  id: string,
  input: {
    systemPrompt: string;
    userPromptTemplate: string;
    modelId: string;
    providerId: string;
  },
) {
  try {
    await requireRole(RoleName.ADMIN);
    const db = getDatabase();

    // Check version increase
    const existing = await db.query.aiPromptTemplates.findFirst({
      where: eq(schema.aiPromptTemplates.id, id),
    });

    const nextVersion = existing ? existing.version + 1 : 1;

    await db
      .update(schema.aiPromptTemplates)
      .set({
        systemPrompt: input.systemPrompt,
        userPromptTemplate: input.userPromptTemplate,
        modelId: input.modelId,
        providerId: input.providerId,
        version: nextVersion,
        updatedAt: new Date(),
      })
      .where(eq(schema.aiPromptTemplates.id, id));

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

// ─── OVERRIDE MODERATION DECISION (MODERATOR ONLY) ───
export async function overrideModerationAction(
  resultId: string,
  newDecision: string,
) {
  try {
    const user = await requireRole(RoleName.MODERATOR);
    const db = getDatabase();

    await db
      .update(schema.aiModerationResults)
      .set({
        decision: newDecision,
        isOverridden: true,
        overriddenBy: user.id,
        overriddenAt: new Date(),
      })
      .where(eq(schema.aiModerationResults.id, resultId));

    // Log the override audit log
    await db.insert(schema.aiAuditLogs).values({
      action: "MODERATOR_OVERRIDE",
      description: `Moderator overridden scan result #${resultId} to: ${newDecision}.`,
      userId: user.id,
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

// ─── GET AI METRICS & ANALYTICS (ADMIN ONLY) ───
export async function getAIAnalyticsAction() {
  try {
    await requireRole(RoleName.ADMIN);
    const data = await AIAnalyticsService.getAIAnalytics();
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

// ─── GET PERSONALIZED RECOMMENDATIONS FEED ───
export async function getRecommendationFeedAction() {
  try {
    const user = await requireAuth();
    const data = await AIRecommendationEngine.getForYouFeed({
      userId: user.id,
      limit: 5,
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}
