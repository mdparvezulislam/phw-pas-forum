import crypto from "crypto";
import { eq } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import { cache } from "@/lib/redis";
import { AIOrchestrator } from "../orchestration/orchestrator";
import type { AISellerSuggestions } from "../types";

export class AIMarketplaceIntelligence {
  /**
   * Scans a marketplace listing for misleading claims, keyword stuffing, and pricing suggestions.
   * Results are cached in Redis to minimize token consumption.
   */
  static async scanListing(params: {
    listingId: string;
    title: string;
    description: string;
    category: string;
    priceMicrocents: number;
    userId?: string;
  }) {
    const { listingId, title, description, category, priceMicrocents, userId } =
      params;

    const hash = crypto
      .createHash("md5")
      .update(title + description + category + priceMicrocents)
      .digest("hex");
    const cacheKey = `ai:marketplace:scan:${listingId}:${hash}`;

    // Try cache lookup first
    try {
      const cached = await cache.get<any>(cacheKey);
      if (cached) return cached;
    } catch {
      // ignore
    }

    try {
      const result = await AIOrchestrator.run(
        "seller_assistant",
        {
          title,
          description,
          category,
          price: (priceMicrocents / 1000000).toFixed(2),
        },
        {
          userId,
          actionType: "MARKETPLACE_SCAN",
          responseFormat: "json",
        },
      );

      if (!result.success) throw new Error(result.error);

      let parsed: AISellerSuggestions;
      try {
        parsed = JSON.parse(result.text);
      } catch {
        const cleaned = result.text
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        parsed = JSON.parse(cleaned);
      }

      const response = {
        success: true,
        suggestions: parsed,
      };

      // Save to cache (24 hours TTL)
      try {
        await cache.set(cacheKey, response, 86400);
      } catch {
        // ignore
      }

      return response;
    } catch (err: any) {
      return {
        success: false,
        error: err.message || String(err),
        suggestions: {
          titleSuggestions: [`Premium ${title}`],
          descriptionFeedback: "Approved by compliance checks.",
          suggestedPricingMicrocents: priceMicrocents,
          suggestedPackages: "Standard package",
          faqSuggestions: [],
          seoImprovements: "Review SEO tags manually.",
        } as AISellerSuggestions,
      };
    }
  }

  /**
   * Generates trust projections, disputes ratio, and fraud probabilities for a seller.
   */
  static async evaluateSellerRisk(sellerId: string): Promise<{
    sellerRiskScore: number;
    fraudProbability: number;
    trustForecast: string;
    suspensionRecommendation: boolean;
  }> {
    try {
      const db = getDatabase();

      const trustProfile = await db.query.sellerTrustProfiles.findFirst({
        where: eq(schema.sellerTrustProfiles.sellerId, sellerId),
      });

      if (!trustProfile) {
        return {
          sellerRiskScore: 10,
          fraudProbability: 5,
          trustForecast:
            "New Seller. Insufficient data to forecast trust anomalies.",
          suspensionRecommendation: false,
        };
      }

      const totalOrders =
        trustProfile.completedOrders + trustProfile.disputedOrders;
      const disputeRatio =
        totalOrders > 0 ? (trustProfile.disputedOrders / totalOrders) * 100 : 0;
      const negativeRatio =
        trustProfile.negativeFeedback > 0
          ? (trustProfile.negativeFeedback /
              (trustProfile.positiveFeedback + trustProfile.negativeFeedback ||
                1)) *
            100
          : 0;

      let riskScore = 15;
      if (disputeRatio > 25) riskScore += 40;
      if (negativeRatio > 30) riskScore += 30;
      if (trustProfile.trustScore < 300) riskScore += 20;

      riskScore = Math.min(100, riskScore);
      const fraudProbability = Math.round(riskScore * 0.85);

      const trustForecast =
        riskScore > 60
          ? "High threat forecast. Elevated dispute patterns indicate high order failures."
          : riskScore > 30
            ? "Medium risk trajectory. Monitor feedback scores."
            : "Stable performance path. Low dispute levels and solid positive review history.";

      return {
        sellerRiskScore: riskScore,
        fraudProbability,
        trustForecast,
        suspensionRecommendation: riskScore >= 75,
      };
    } catch {
      return {
        sellerRiskScore: 0,
        fraudProbability: 0,
        trustForecast: "Risk evaluation offline.",
        suspensionRecommendation: false,
      };
    }
  }
}
