import { relations } from "drizzle-orm";
import { users } from "./users";
import { threads } from "./threads";
import { posts } from "./posts";
import { categories } from "./categories";
import { forums } from "./forums";
import { notifications } from "./notifications";
import { badges } from "./badges";
import { userBadges } from "./user-badges";
import { userReputation } from "./user-reputation";
import { threadTags } from "./thread-tags";
import { postEditHistory } from "./post-edit-history";
import { postReports } from "./post-reports";
import { conversations } from "./conversations";
import { conversationParticipants } from "./conversation-participants";
import { conversationMessages } from "./conversation-messages";
import { conversationMessageEditHistory } from "./conversation-message-edit-history";
import { conversationAttachments } from "./conversation-attachments";
import { messageReadReceipts } from "./message-read-receipts";
import { attachments } from "./attachments";
import { roles } from "./roles";
import { searchHistories } from "./search-histories";
import { searchQueries } from "./search-queries";

export const usersRelations = relations(users, ({ many, one }) => ({
  threads: many(threads),
  posts: many(posts),
  notifications: many(notifications),
  badges: many(userBadges),
  reputation: one(userReputation, {
    fields: [users.id],
    references: [userReputation.userId],
  }),
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  searchHistory: many(searchHistories),
  searchQueries: many(searchQueries),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  author: one(users, {
    fields: [threads.authorId],
    references: [users.id],
  }),
  posts: many(posts),
  tags: many(threadTags),
  forum: one(forums, {
    fields: [threads.forumId],
    references: [forums.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  thread: one(threads, {
    fields: [posts.threadId],
    references: [threads.id],
  }),
  editHistory: many(postEditHistory),
  reports: many(postReports),
}));

export const forumsRelations = relations(forums, ({ one, many }) => ({
  category: one(categories, {
    fields: [forums.categoryId],
    references: [categories.id],
  }),
  threads: many(threads),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  forums: many(forums),
}));

export const threadTagsRelations = relations(threadTags, ({ one }) => ({
  thread: one(threads, {
    fields: [threadTags.threadId],
    references: [threads.id],
  }),
}));

export const postEditHistoryRelations = relations(postEditHistory, ({ one }) => ({
  post: one(posts, {
    fields: [postEditHistory.postId],
    references: [posts.id],
  }),
  editor: one(users, {
    fields: [postEditHistory.editedBy],
    references: [users.id],
  }),
}));

export const postReportsRelations = relations(postReports, ({ one }) => ({
  post: one(posts, {
    fields: [postReports.postId],
    references: [posts.id],
  }),
  reporter: one(users, {
    fields: [postReports.reporterId],
    references: [users.id],
  }),
  resolver: one(users, {
    fields: [postReports.resolvedBy],
    references: [users.id],
  }),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

// PM relations
export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  creator: one(users, {
    fields: [conversations.createdBy],
    references: [users.id],
  }),
  participants: many(conversationParticipants),
  messages: many(conversationMessages),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationParticipants.userId],
    references: [users.id],
  }),
}));

export const conversationMessagesRelations = relations(conversationMessages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [conversationMessages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [conversationMessages.senderId],
    references: [users.id],
  }),
  attachments: many(conversationAttachments),
  readReceipts: many(messageReadReceipts),
  editHistory: many(conversationMessageEditHistory),
}));

export const conversationMessageEditHistoryRelations = relations(conversationMessageEditHistory, ({ one }) => ({
  message: one(conversationMessages, {
    fields: [conversationMessageEditHistory.messageId],
    references: [conversationMessages.id],
  }),
  editor: one(users, {
    fields: [conversationMessageEditHistory.editedBy],
    references: [users.id],
  }),
}));

export const conversationAttachmentsRelations = relations(conversationAttachments, ({ one }) => ({
  message: one(conversationMessages, {
    fields: [conversationAttachments.messageId],
    references: [conversationMessages.id],
  }),
  attachment: one(attachments, {
    fields: [conversationAttachments.attachmentId],
    references: [attachments.id],
  }),
}));

export const messageReadReceiptsRelations = relations(messageReadReceipts, ({ one }) => ({
  message: one(conversationMessages, {
    fields: [messageReadReceipts.messageId],
    references: [conversationMessages.id],
  }),
  user: one(users, {
    fields: [messageReadReceipts.userId],
    references: [users.id],
  }),
}));

export const searchHistoriesRelations = relations(searchHistories, ({ one }) => ({
  user: one(users, {
    fields: [searchHistories.userId],
    references: [users.id],
  }),
}));

export const searchQueriesRelations = relations(searchQueries, ({ one }) => ({
  user: one(users, {
    fields: [searchQueries.userId],
    references: [users.id],
  }),
}));
