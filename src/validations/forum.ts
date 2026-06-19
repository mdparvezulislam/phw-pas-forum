import { z } from "zod";

export const createCategorySchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex color")
    .optional(),
  position: z.coerce.number().int().min(0).default(0),
  isVisible: z.coerce.boolean().default(true),
  isPremiumOnly: z.coerce.boolean().default(false),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().min(1),
});

export const createForumSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  parentForumId: z.string().optional(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  position: z.coerce.number().int().min(0).default(0),
  isVisible: z.coerce.boolean().default(true),
  isLocked: z.coerce.boolean().default(false),
  isPremiumOnly: z.coerce.boolean().default(false),
});

export const updateForumSchema = createForumSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateForumInput = z.infer<typeof createForumSchema>;
export type UpdateForumInput = z.infer<typeof updateForumSchema>;
