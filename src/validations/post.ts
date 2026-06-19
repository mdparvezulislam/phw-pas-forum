import { z } from "zod";

export const POST_CONTENT_MIN = 2;
export const POST_CONTENT_MAX = 50000;
export const EDIT_REASON_MAX = 500;

export const createPostSchema = z.object({
  threadId: z.string().min(1, "Thread is required"),
  content: z
    .string()
    .min(
      POST_CONTENT_MIN,
      `Content must be at least ${POST_CONTENT_MIN} characters`,
    )
    .max(
      POST_CONTENT_MAX,
      `Content must be at most ${POST_CONTENT_MAX} characters`,
    ),
  contentJson: z
    .string()
    .max(500_000, "Content JSON is too large")
    .transform((val) => {
      try {
        const parsed = JSON.parse(val);
        if (!parsed || typeof parsed !== "object" || !parsed.type) {
          return null;
        }
        return JSON.stringify(parsed) as string;
      } catch {
        return null;
      }
    })
    .nullable()
    .optional()
    .default(null),
});

export const updatePostSchema = z.object({
  id: z.string().min(1),
  content: z
    .string()
    .min(
      POST_CONTENT_MIN,
      `Content must be at least ${POST_CONTENT_MIN} characters`,
    )
    .max(
      POST_CONTENT_MAX,
      `Content must be at most ${POST_CONTENT_MAX} characters`,
    ),
  contentJson: z
    .string()
    .max(500_000, "Content JSON is too large")
    .transform((val) => {
      try {
        const parsed = JSON.parse(val);
        if (!parsed || typeof parsed !== "object" || !parsed.type) {
          return null;
        }
        return JSON.stringify(parsed) as string;
      } catch {
        return null;
      }
    })
    .nullable()
    .optional()
    .default(null),
  reason: z
    .string()
    .max(
      EDIT_REASON_MAX,
      `Reason must be at most ${EDIT_REASON_MAX} characters`,
    )
    .optional(),
});

export const postPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(50),
});

export const reportPostSchema = z.object({
  postId: z.string().min(1),
  reason: z.enum(["SPAM", "ABUSE", "SCAM", "DUPLICATE", "OTHER"]),
  description: z.string().max(2000).optional(),
});

export const resolveReportSchema = z.object({
  reportId: z.string().min(1),
  action: z.enum(["RESOLVED", "REJECTED"]),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostPaginationInput = z.infer<typeof postPaginationSchema>;
export type ReportPostInput = z.infer<typeof reportPostSchema>;
export type ResolveReportInput = z.infer<typeof resolveReportSchema>;
