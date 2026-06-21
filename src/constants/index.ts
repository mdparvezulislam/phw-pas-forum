export const SITE_NAME = "BHW PAS";
export const SITE_DESCRIPTION = "A premium community forum platform";

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  THREADS_PER_PAGE: 20,
  POSTS_PER_PAGE: 10,
} as const;

export const CACHE_TTL = {
  USER_PROFILE: 300,
  USER_PERMISSIONS: 600,
  USER_MEMBERSHIP: 300,
  FORUM_LISTING: 600,
  FORUM_TREE: 900,
  THREAD_LISTING: 300,
  THREAD_DETAIL: 120,
  POST_LISTING: 120,
  CATEGORY_LISTING: 900,
  MARKETPLACE_LISTING: 300,
  MARKETPLACE_CATEGORIES: 900,
  TRENDING_THREADS: 300,
  TRENDING_LISTINGS: 300,
  LEADERBOARD: 300,
  BADGES: 900,
  TROPHIES: 900,
  STATIC_CONTENT: 86400,
  RECOMMENDATIONS: 600,
  VIP_CONTENT: 600,
  SEARCH_SUGGESTIONS: 300,
  NOTIFICATION_COUNT: 60,
  AI_RESPONSE: 3600,
  RATE_LIMIT: 60,
  SESSION: 1800,
  SYSTEM_SETTINGS: 900,
} as const;

export const CACHE_PROFILES = {
  USER_PROFILE: { revalidate: 60, stale: 30 },
  FORUM_LISTING: { revalidate: 300, stale: 60 },
  THREAD_LISTING: { revalidate: 60, stale: 30 },
  POST_LISTING: { revalidate: 30, stale: 15 },
  STATIC_CONTENT: { revalidate: 86400, stale: 3600 },
} as const;

export const CACHE_TAGS = {
  USER: "user",
  ROLE: "role",
  PERMISSION: "permission",
  FORUM: "forum",
  CATEGORY: "category",
  THREAD: "thread",
  POST: "post",
  SETTINGS: "settings",
  MARKETPLACE: "marketplace",
  LISTING: "listing",
  ORDER: "order",
  REVIEW: "review",
  SELLER: "seller",
  BADGE: "badge",
  TROPHY: "trophy",
  NOTIFICATION: "notification",
  CONVERSATION: "conversation",
  MESSAGE: "message",
  MEMBERSHIP: "membership",
  AI: "ai",
  SEARCH: "search",
  LEADERBOARD: "leaderboard",
  TRENDING: "trending",
} as const;

export const RATE_LIMITS = {
  LOGIN: { window: 15 * 60, max: 5 },
  REGISTER: { window: 60 * 60, max: 3 },
  FORGOT_PASSWORD: { window: 15 * 60, max: 3 },
  API: { window: 60, max: 60 },
  FORUM_POST: { window: 60, max: 10 },
  SEARCH: { window: 60, max: 30 },
  MESSAGING: { window: 60, max: 20 },
  MARKETPLACE: { window: 60, max: 10 },
  AI: { window: 60, max: 5 },
  AUTH: { window: 15 * 60, max: 10 },
} as const;

export const RATE_LIMIT_DEFAULTS = {
  GLOBAL: { window: 60, max: 1000 },
  PER_USER: { window: 60, max: 100 },
  PER_IP: { window: 60, max: 200 },
} as const;

export const QUEUE_NAMES = {
  EMAIL: "email",
  NOTIFICATION: "notification",
  AI: "ai",
  SEARCH_INDEX: "search-index",
  ANALYTICS: "analytics",
  MODERATION: "moderation",
  MARKETPLACE: "marketplace",
  IMAGE_PROCESSING: "image-processing",
  LEADERBOARD: "leaderboard",
  AGGREGATION: "aggregation",
  AUDIT_LOG: "audit-log",
  CLEANUP: "cleanup",
} as const;

export const FILE_LIMITS = {
  AVATAR_MAX_SIZE: 2 * 1024 * 1024,
  ATTACHMENT_MAX_SIZE: 10 * 1024 * 1024,
  AVATAR_ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ATTACHMENT_ALLOWED_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
    "application/zip",
    "application/x-rar-compressed",
    "video/mp4",
  ],
  IMAGE_ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  DOCUMENT_ALLOWED_TYPES: [
    "application/pdf",
    "application/zip",
    "application/x-rar-compressed",
  ],
  VIDEO_ALLOWED_TYPES: ["video/mp4"],
  IMAGE_MAX_SIZE: 5 * 1024 * 1024,
  VIDEO_MAX_SIZE: 50 * 1024 * 1024,
  DOCUMENT_MAX_SIZE: 10 * 1024 * 1024,
  MAX_IMAGE_DIMENSIONS: { width: 4096, height: 4096 },
} as const;

export const IMAGE_PROCESSING = {
  THUMBNAIL_WIDTH: 150,
  THUMBNAIL_HEIGHT: 150,
  PREVIEW_WIDTH: 800,
  PREVIEW_HEIGHT: 600,
  AVATAR_SIZE: 256,
  COVER_SIZE: 1200,
  QUALITY: 85,
  THUMBNAIL_QUALITY: 70,
  ALLOWED_FORMATS: ["jpeg", "png", "webp", "avif"] as const,
  PREFERRED_FORMAT: "webp" as const,
  MAX_INPUT_SIZE: 20 * 1024 * 1024,
} as const;

export const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;
export const DISPLAY_NAME_REGEX = /^[a-zA-Z0-9\s_-]{3,50}$/;

export const CIRCUIT_BREAKER = {
  ERROR_THRESHOLD: 5,
  RESET_TIMEOUT_MS: 30000,
  HALF_OPEN_MAX: 3,
  MONITORING_WINDOW_MS: 60000,
} as const;

export const RETRY_POLICY = {
  MAX_ATTEMPTS: 3,
  BASE_DELAY_MS: 1000,
  MAX_DELAY_MS: 30000,
  BACKOFF_FACTOR: 2,
  JITTER: true,
} as const;
