import { z } from "zod";

export const createThreadSchema = z.object({
  forumId: z.string().min(1, "Forum is required"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters"),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .max(100000, "Content must be at most 100,000 characters"),
  tags: z.array(z.string().max(50)).max(10).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
});

export const updateThreadSchema = z.object({
  id: z.string().min(1),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200)
    .optional(),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .max(100000)
    .optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const threadPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(20),
  sort: z
    .enum(["latest", "oldest", "most_viewed", "most_replies"])
    .default("latest"),
});

export type CreateThreadInput = z.infer<typeof createThreadSchema>;
export type UpdateThreadInput = z.infer<typeof updateThreadSchema>;
export type ThreadPaginationInput = z.infer<typeof threadPaginationSchema>;
