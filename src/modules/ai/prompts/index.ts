import { eq } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import { assistantPrompt } from "./assistant.prompt";
import { moderationPrompt } from "./moderation.prompt";
import { searchPrompt } from "./search.prompt";
import { sellerAnalysisPrompt } from "./seller-analysis.prompt";
import { threadSummaryPrompt } from "./thread-summary.prompt";

const DEFAULT_PROMPTS: Record<string, { system: string; user: string }> = {
  moderation: moderationPrompt,
  search_assistant: searchPrompt,
  thread_assistant: assistantPrompt,
  seller_assistant: sellerAnalysisPrompt,
  summarize: threadSummaryPrompt,
  assistant: assistantPrompt,
  search: searchPrompt,
};

export class PromptManager {
  static formatPrompt(
    template: string,
    variables: Record<string, string>,
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{${key}}`, "g"), value || "");
    }
    return result;
  }

  static async getPrompt(name: string): Promise<{
    systemPrompt: string;
    userPromptTemplate: string;
    modelId: string;
    providerId: string;
  }> {
    const fallback = DEFAULT_PROMPTS[name] || DEFAULT_PROMPTS.moderation;
    // Set default models for OpenRouter free stack
    let defaultModel = "google/gemini-2.0-flash-exp:free";
    if (name.includes("assistant") || name.includes("marketplace")) {
      defaultModel = "deepseek/deepseek-chat-v3-0324:free";
    }

    try {
      const db = getDatabase();
      const dbPrompt = await db.query.aiPromptTemplates.findFirst({
        where: eq(schema.aiPromptTemplates.name, name),
      });

      if (dbPrompt && dbPrompt.isActive) {
        return {
          systemPrompt: dbPrompt.systemPrompt,
          userPromptTemplate: dbPrompt.userPromptTemplate,
          modelId: dbPrompt.modelId,
          providerId: dbPrompt.providerId,
        };
      }

      // Seed default template if absent in database
      if (!dbPrompt) {
        await db
          .insert(schema.aiPromptTemplates)
          .values({
            name,
            description: `Auto-seeded OpenRouter cost-optimized prompt for ${name}`,
            systemPrompt: fallback.system,
            userPromptTemplate: fallback.user,
            modelId: defaultModel,
            providerId: "openrouter",
            version: 1,
            isActive: true,
          })
          .onConflictDoNothing();
      }
    } catch {
      // Quiet fail during build/compile
    }

    return {
      systemPrompt: fallback.system,
      userPromptTemplate: fallback.user,
      modelId: defaultModel,
      providerId: "openrouter",
    };
  }
}
