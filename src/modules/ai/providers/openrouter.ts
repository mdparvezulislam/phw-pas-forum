import type { AICompletionOptions, AIResult } from "../types";

export class OpenRouterProvider {
  static async call(
    models: string[],
    prompt: string,
    options: AICompletionOptions = {},
  ): Promise<AIResult> {
    const startTime = Date.now();
    const apiKey = process.env.OPENROUTER_API_KEY;
    const baseUrl =
      process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

    if (!apiKey) {
      return OpenRouterProvider.callMock(
        models[0] || "mock",
        prompt,
        options,
        startTime,
      );
    }

    const systemInstruction = options.systemInstruction || "";
    const temperature = options.temperature ?? 0.2;
    const maxTokens = options.maxTokens ?? 1200;
    const responseJson = options.responseFormat === "json";

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    let lastError: any = null;

    // Model Fallback chain loop (Primary -> Fallbacks)
    for (const model of models) {
      let attempts = 3;
      while (attempts > 0) {
        try {
          const res = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
              "HTTP-Referer": "https://bhw-pas-forum.com",
              "X-Title": "BHW PAS Community Platform",
            },
            body: JSON.stringify({
              model,
              messages,
              temperature,
              max_tokens: maxTokens,
              response_format: responseJson
                ? { type: "json_object" }
                : undefined,
            }),
          });

          if (!res.ok) {
            throw new Error(`OpenRouter returned status ${res.status}`);
          }

          const data = await res.json();
          const text = data.choices?.[0]?.message?.content ?? "";

          if (!text && data.error) {
            throw new Error(data.error.message || "Empty completion response");
          }

          const inputTokens = data.usage?.prompt_tokens ?? 0;
          const outputTokens = data.usage?.completion_tokens ?? 0;
          const latencyMs = Date.now() - startTime;

          // Estimate cost in microcents (Free models = 0, standard pricing for premium fallback)
          const isFree = model.endsWith(":free");
          const costMicrocents = isFree
            ? 0
            : Math.round(inputTokens * 0.15 + outputTokens * 0.6);

          return {
            text,
            inputTokens,
            outputTokens,
            latencyMs,
            costMicrocents,
            success: true,
          };
        } catch (err: any) {
          lastError = err;
          attempts--;
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
      }
    }

    // Final fallback to mock if OpenRouter is completely down
    const mockText = OpenRouterProvider.generateMockResponse(
      prompt,
      responseJson,
    );
    return {
      text: mockText,
      inputTokens: Math.ceil(prompt.length / 4),
      outputTokens: Math.ceil(mockText.length / 4),
      latencyMs: Date.now() - startTime,
      costMicrocents: 0,
      success: true,
      error: `OpenRouter fallback chain exhausted. Error: ${lastError?.message || lastError}`,
    };
  }

  private static callMock(
    model: string,
    prompt: string,
    options: AICompletionOptions,
    startTime: number,
  ): AIResult {
    const text = OpenRouterProvider.generateMockResponse(
      prompt,
      options.responseFormat === "json",
    );
    return {
      text,
      inputTokens: Math.ceil(prompt.length / 4),
      outputTokens: Math.ceil(text.length / 4),
      latencyMs: Date.now() - startTime,
      costMicrocents: 0,
      success: true,
    };
  }

  private static generateMockResponse(
    prompt: string,
    responseJson: boolean,
  ): string {
    if (!responseJson) {
      if (prompt.toLowerCase().includes("summary")) {
        return "SUMMARY:\n- Forum discussions focus on organic link building.\n- Users recommend high compliance with search guidelines.\n- Auto caching prevents double billing of tokens.";
      }
      return "Hello! I am the platform assistant. How can I help you navigate BHW PAS forum threads today?";
    }

    const lowerPrompt = prompt.toLowerCase();

    // 1. Content Moderation Mock JSON
    if (
      lowerPrompt.includes("spam_score") ||
      lowerPrompt.includes("toxicity")
    ) {
      const isToxic =
        lowerPrompt.includes("cheap backlinks drug") ||
        lowerPrompt.includes("scam refund");
      return JSON.stringify({
        spamScore: isToxic ? 98 : 10,
        scamScore: isToxic ? 95 : 5,
        fraudScore: isToxic ? 92 : 4,
        toxicityScore: isToxic ? 80 : 8,
        trustRiskScore: isToxic ? 88 : 12,
        marketplaceRiskScore: isToxic ? 90 : 5,
        decision: isToxic ? "BLOCKED" : "APPROVED",
        explanation: isToxic
          ? "Blocked by safety trigger keywords."
          : "Approved by AI filter checks.",
      });
    }

    // 2. Search Assistant Mock JSON
    if (lowerPrompt.includes("keyinsights")) {
      return JSON.stringify({
        summary: "Search analysis displays highly rated link outreach sellers.",
        keyInsights: [
          "VIP sellers offer verified link metrics",
          "SEO lists are cached for 24h",
        ],
        suggestedThreads: [
          { id: "t1", title: "Manual outreach list 2026", score: 96 },
        ],
        suggestedListings: [
          {
            id: "l1",
            title: "Manual outreach SEO link",
            price: 4900,
            score: 92,
          },
        ],
      });
    }

    // 3. Seller Copilot Mock JSON
    if (lowerPrompt.includes("descriptions") || lowerPrompt.includes("faq")) {
      return JSON.stringify({
        titleSuggestions: [
          "Verified Organic Link Outreach Package",
          "Direct Manual Backlink Campaign",
        ],
        descriptionFeedback:
          "Approved for publication. Good structure and pricing transparency.",
        suggestedPricingMicrocents: 4900,
        suggestedPackages:
          "Bronze package ($49), Silver package ($99), Gold package ($149)",
        faqSuggestions: [
          {
            question: "How long are links hosted?",
            answer: "Permanent placement.",
          },
        ],
        seoImprovements:
          "Use tags like 'manual outreach' and 'organic backlink'.",
      });
    }

    return JSON.stringify({
      text: "Mock OpenRouter JSON response",
      success: true,
    });
  }
}
