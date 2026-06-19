import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const attachmentStatus = ["PENDING", "ACTIVE", "DELETED", "QUARANTINED"] as const;
export type AttachmentStatus = (typeof attachmentStatus)[number];

export const attachments = pgTable(
  "attachment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    uploaderId: text("uploader_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSize: integer("file_size").notNull(),
    storageKey: text("storage_key").notNull(),
    url: text("url").notNull(),
    width: integer("width"),
    height: integer("height"),
    status: text("status", { enum: attachmentStatus })
      .$type<AttachmentStatus>()
      .default("ACTIVE")
      .notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("attachment_uploader_id_idx").on(table.uploaderId),
    index("attachment_status_idx").on(table.status),
  ],
);

export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;
