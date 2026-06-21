export type AIProviderId =
  | "openai"
  | "anthropic"
  | "gemini"
  | "deepseek"
  | "openrouter"
  | "mock";

export interface AIModel {
  id: string;
  name: string;
  provider: AIProviderId;
  costPerInputTokenMicrocents: number; // 1/1,000,000 of a cent
  costPerOutputTokenMicrocents: number;
}

export interface AICompletionOptions {
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
  responseFormat?: "text" | "json";
}

export interface AIResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  costMicrocents: number;
  success: boolean;
  error?: string;
}

export interface AIRiskScores {
  spamScore: number; // 0 to 100
  scamScore: number;
  fraudScore: number;
  toxicityScore: number;
  trustRiskScore: number;
  marketplaceRiskScore: number;
  decision: "APPROVED" | "FLAGGED" | "QUEUED" | "BLOCKED";
  explanation: string;
}

export interface AISearchAnalysis {
  summary: string;
  keyInsights: string[];
  suggestedThreads: Array<{ id: string; title: string; score: number }>;
  suggestedListings: Array<{
    id: string;
    title: string;
    price: number;
    score: number;
  }>;
}

export interface AILineSuggestions {
  titleSuggestions: string[];
  tags: string[];
  categoryRecommendation: string;
  seoEnhancements: string;
  formattingFeedback: string;
}

export interface AISellerSuggestions {
  titleSuggestions: string[];
  descriptionFeedback: string;
  suggestedPricingMicrocents: number;
  suggestedPackages: string;
  faqSuggestions: Array<{ question: string; answer: string }>;
  seoImprovements: string;
}
