export interface ModelRouteConfig {
  primary: string;
  fallbacks: string[];
}

export const MODEL_ROUTES: Record<string, ModelRouteConfig> = {
  moderation: {
    primary: "google/gemini-2.0-flash-exp:free",
    fallbacks: ["meta-llama/llama-3.3-70b-instruct:free"],
  },
  assistant: {
    primary: "deepseek/deepseek-chat-v3-0324:free",
    fallbacks: ["meta-llama/llama-3.3-70b-instruct:free"],
  },
  search: {
    primary: "google/gemini-2.0-flash-exp:free",
    fallbacks: ["deepseek/deepseek-chat-v3-0324:free"],
  },
  marketplace: {
    primary: "deepseek/deepseek-chat-v3-0324:free",
    fallbacks: ["google/gemini-2.0-flash-exp:free"],
  },
  summaries: {
    primary: "google/gemini-2.0-flash-exp:free",
    fallbacks: ["deepseek/deepseek-chat-v3-0324:free"],
  },
  categorization: {
    primary: "google/gemini-2.0-flash-exp:free",
    fallbacks: ["meta-llama/llama-3.3-70b-instruct:free"],
  },
  recommendations: {
    primary: "deepseek/deepseek-chat-v3-0324:free",
    fallbacks: ["google/gemini-2.0-flash-exp:free"],
  },
};

// Premium model upgrade maps prepared for future activation triggers
export const PREMIUM_UPGRADES = {
  assistant: {
    openai: "openai/gpt-5",
    anthropic: "anthropic/claude-3.5-sonnet",
    gemini: "google/gemini-2.5-pro",
  },
  marketplace: {
    anthropic: "anthropic/claude-3.5-sonnet",
  },
  search: {
    openai: "openai/gpt-5-mini",
  },
};

export class ModelRouter {
  static getRoute(feature: string, isPremiumUser = false): ModelRouteConfig {
    const config = MODEL_ROUTES[feature] || MODEL_ROUTES.moderation;

    if (isPremiumUser) {
      if (feature === "assistant") {
        return {
          primary: "anthropic/claude-3.5-sonnet",
          fallbacks: [config.primary, ...config.fallbacks],
        };
      }
      if (feature === "marketplace") {
        return {
          primary: "anthropic/claude-3.5-sonnet",
          fallbacks: [config.primary, ...config.fallbacks],
        };
      }
      if (feature === "search") {
        return {
          primary: "openai/gpt-5-mini",
          fallbacks: [config.primary, ...config.fallbacks],
        };
      }
    }

    return config;
  }
}
