import { AIOrchestrator } from "../orchestration/orchestrator";

export class AIAssistantService {
  /**
   * Platform assistant chatbot answering navigational and resource questions.
   */
  static async askAssistant(params: {
    query: string;
    userId?: string;
    context?: string;
  }): Promise<string> {
    const { query, userId, context = "" } = params;

    try {
      const result = await AIOrchestrator.run(
        "assistant",
        {
          query,
          context:
            context || "Standard community navigation and help guides context.",
        },
        {
          userId,
          actionType: "ASSISTANT_CHAT",
        },
      );

      if (!result.success) throw new Error(result.error);
      return result.text;
    } catch (err: any) {
      return `BHW PAS Assistant is currently offline: ${err.message || String(err)}`;
    }
  }
}
