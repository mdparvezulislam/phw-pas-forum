import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const auditLogs = pgTable("audit_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  resource: text("resource"),
  resourceId: text("resource_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

export const AUDIT_ACTIONS = {
  LOGIN: "auth:login",
  LOGOUT: "auth:logout",
  LOGIN_FAILED: "auth:login_failed",
  REGISTER: "auth:register",
  VERIFY_EMAIL: "auth:verify_email",
  FORGOT_PASSWORD: "auth:forgot_password",
  RESET_PASSWORD: "auth:reset_password",
  CHANGE_PASSWORD: "auth:change_password",
  UPDATE_PROFILE: "user:update_profile",
  UPDATE_AVATAR: "user:update_avatar",
  REMOVE_AVATAR: "user:remove_avatar",
  UPDATE_COVER: "user:update_cover",
  REMOVE_COVER: "user:remove_cover",
  UPDATE_SETTINGS: "user:update_settings",
  ROLE_CHANGE: "admin:role_change",
  USER_BAN: "admin:user_ban",
  USER_UNBAN: "admin:user_unban",
  FORUM_CATEGORY_CREATE: "forum:category:create",
  FORUM_CATEGORY_UPDATE: "forum:category:update",
  FORUM_CATEGORY_DELETE: "forum:category:delete",
  FORUM_CREATE: "forum:create",
  FORUM_UPDATE: "forum:update",
  FORUM_DELETE: "forum:delete",
  THREAD_CREATE: "thread:create",
  THREAD_UPDATE: "thread:update",
  THREAD_DELETE: "thread:delete",
  THREAD_PIN: "thread:pin",
  THREAD_UNPIN: "thread:unpin",
  THREAD_LOCK: "thread:lock",
  THREAD_UNLOCK: "thread:unlock",
  THREAD_FEATURE: "thread:feature",
  THREAD_UNFEATURE: "thread:unfeature",
  THREAD_WATCH: "thread:watch",
  THREAD_UNWATCH: "thread:unwatch",
  THREAD_BOOKMARK: "thread:bookmark",
  THREAD_UNBOOKMARK: "thread:unbookmark",
  POST_CREATE: "post:create",
  POST_UPDATE: "post:update",
  POST_DELETE: "post:delete",
  POST_RESTORE: "post:restore",
  POST_HIDE: "post:hide",
  POST_UNHIDE: "post:unhide",
  POST_REPORT_CREATE: "post_report:create",
  POST_REPORT_RESOLVE: "post_report:resolve",
  POST_REPORT_REJECT: "post_report:reject",
} as const;
