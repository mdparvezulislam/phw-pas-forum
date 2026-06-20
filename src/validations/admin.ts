import { z } from "zod";

export const adminPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const searchUsersSchema = z.object({
  query: z.string().min(1).max(200),
  role: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const banUserSchema = z.object({
  userId: z.string().min(1),
  reason: z.string().min(1).max(5000),
  isPermanent: z.boolean().default(false),
  expiresAt: z.string().optional(),
});

export const warnUserSchema = z.object({
  userId: z.string().min(1),
  reason: z.string().min(1).max(5000),
  points: z.number().int().min(0).max(100).default(0),
  expiresAt: z.string().optional(),
});

export const createModeratorNoteSchema = z.object({
  targetUserId: z.string().min(1),
  note: z.string().min(1).max(10000),
  visibility: z.enum(["PRIVATE", "STAFF_ONLY"]).default("STAFF_ONLY"),
});

export const assignRoleSchema = z.object({
  userId: z.string().min(1),
  roleId: z.string().min(1),
});

export const manageStaffSchema = z.object({
  userId: z.string().min(1),
  roleId: z.string().min(1),
  permissions: z.array(z.string()).optional(),
});

export const updateSettingsSchema = z.object({
  key: z.string().min(1),
  value: z.any(),
  category: z.string().min(1),
  description: z.string().optional(),
});

export const createFeatureFlagSchema = z.object({
  key: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  enabled: z.boolean().default(false),
  isKillSwitch: z.boolean().default(false),
});

export const updateFeatureFlagSchema = z.object({
  flagId: z.string().min(1),
  enabled: z.boolean(),
});

export const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1).max(50000),
  type: z.enum(["INFO", "WARNING", "SUCCESS", "DANGER"]).default("INFO"),
  isPermanent: z.boolean().default(false),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  targetAudience: z.string().optional(),
});

export const resolveReportSchema = z.object({
  reportId: z.string().min(1),
  action: z.enum(["WARN", "BAN", "DELETE", "DISMISS", "ESCALATE"]),
  notes: z.string().max(5000).optional(),
});

export const bulkActionSchema = z.object({
  entityType: z.string().min(1),
  entityIds: z.array(z.string()).min(1).max(500),
  action: z.string().min(1),
  reason: z.string().optional(),
});

export const updateModerationQueueSchema = z.object({
  submissionId: z.string().min(1),
  decision: z.enum(["APPROVE", "REJECT", "REQUEST_CHANGES"]),
  notes: z.string().max(5000).optional(),
});

export type BanUserInput = z.infer<typeof banUserSchema>;
export type WarnUserInput = z.infer<typeof warnUserSchema>;
export type CreateFeatureFlagInput = z.infer<typeof createFeatureFlagSchema>;
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type ResolveReportInput = z.infer<typeof resolveReportSchema>;
