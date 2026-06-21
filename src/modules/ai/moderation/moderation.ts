import { getDatabase, schema } from "@/db";
import { AIOrchestrator } from "../orchestration/orchestrator";
import type { AIRiskScores } from "../types";

export class AIModerationEngine {
  /**
   * Scans content to calculate spam, scam, toxicity, and other risk indices.
   */
  static async scanContent(params: {
    targetId: string;
    targetType: "THREAD" | "POST" | "LISTING" | "MESSAGE" | "REVIEW";
    title: string;
    body: string;
    userId?: string;
  }): Promise<AIRiskScores> {
    const { targetId, targetType, title, body, userId } = params;
    const db = getDatabase();

    const fallbackResponse: AIRiskScores = {
      spamScore: 10,
      scamScore: 5,
      fraudScore: 5,
      toxicityScore: 5,
      trustRiskScore: 10,
      marketplaceRiskScore: 5,
      decision: "APPROVED",
      explanation: "Approved by safety filter engine fallback.",
    };

    try {
      const result = await AIOrchestrator.run(
        "moderation",
        { title, body },
        {
          userId,
          actionType: "MODERATION",
          responseFormat: "json",
        },
      );

      if (!result.success) {
        throw new Error(result.error || "LLM execution failed");
      }

      let riskScores: AIRiskScores;
      try {
        riskScores = JSON.parse(result.text);
      } catch {
        const cleaned = result.text
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        riskScores = JSON.parse(cleaned);
      }

      const spamScore = Math.max(0, Math.min(100, riskScores.spamScore ?? 0));
      const scamScore = Math.max(0, Math.min(100, riskScores.scamScore ?? 0));
      const fraudScore = Math.max(0, Math.min(100, riskScores.fraudScore ?? 0));
      const toxicityScore = Math.max(
        0,
        Math.min(100, riskScores.toxicityScore ?? 0),
      );
      const trustRiskScore = Math.max(
        0,
        Math.min(100, riskScores.trustRiskScore ?? 0),
      );
      const marketplaceRiskScore = Math.max(
        0,
        Math.min(100, riskScores.marketplaceRiskScore ?? 0),
      );

      let decision: "APPROVED" | "FLAGGED" | "QUEUED" | "BLOCKED" =
        riskScores.decision;
      const maxRisk = Math.max(spamScore, scamScore, fraudScore, toxicityScore);

      if (maxRisk >= 95) {
        decision = "BLOCKED";
      } else if (maxRisk >= 75) {
        decision = "QUEUED";
      } else if (maxRisk >= 40) {
        decision = "FLAGGED";
      } else {
        decision = "APPROVED";
      }

      // Save results
      await db.insert(schema.aiModerationResults).values({
        targetId,
        targetType,
        spamScore,
        scamScore,
        fraudScore,
        toxicityScore,
        trustRiskScore,
        marketplaceRiskScore,
        decision,
        explanation: riskScores.explanation || "Analyzed by AI Moderation.",
      });

      // Emit audit logs
      try {
        await db.insert(schema.aiAuditLogs).values({
          action: "AI_CONTENT_ANALYZED",
          description: `Scanned ${targetType} #${targetId}. Decision: ${decision}. Max Risk Score: ${maxRisk}.`,
          metadata: {
            targetId,
            targetType,
            spamScore,
            toxicityScore,
            decision,
          },
          userId: userId || null,
        });
      } catch {
        // ignore
      }

      return {
        spamScore,
        scamScore,
        fraudScore,
        toxicityScore,
        trustRiskScore,
        marketplaceRiskScore,
        decision,
        explanation: riskScores.explanation,
      };
    } catch (err: any) {
      try {
        await db.insert(schema.aiAuditLogs).values({
          action: "AI_MODERATION_ERROR",
          description: `Failed to moderate ${targetType} #${targetId}: ${err.message || String(err)}`,
          metadata: { error: err.message || String(err) },
          userId: userId || null,
        });
      } catch {
        // ignore
      }

      return fallbackResponse;
    }
  }
}
