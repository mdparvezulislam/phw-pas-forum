export const SITE_NAME = "BHW PAS";
export const SITE_DESCRIPTION = "A premium community forum platform";

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  THREADS_PER_PAGE: 20,
  POSTS_PER_PAGE: 10,
} as const;

export const RATE_LIMITS = {
  LOGIN: { window: 15 * 60, max: 5 },
  REGISTER: { window: 60 * 60, max: 3 },
  API: { window: 60, max: 60 },
  FORUM_POST: { window: 60, max: 10 },
} as const;

export const CACHE_TAGS = {
  USER: "user",
  ROLE: "role",
  PERMISSION: "permission",
  FORUM: "forum",
  THREAD: "thread",
  POST: "post",
  SETTINGS: "settings",
} as const;

export const CACHE_PROFILES = {
  USER_PROFILE: { revalidate: 60, stale: 30 },
  FORUM_LISTING: { revalidate: 300, stale: 60 },
  THREAD_LISTING: { revalidate: 60, stale: 30 },
  POST_LISTING: { revalidate: 30, stale: 15 },
  STATIC_CONTENT: { revalidate: 86400, stale: 3600 },
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

export const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;
export const DISPLAY_NAME_REGEX = /^[a-zA-Z0-9\s_-]{3,50}$/;
