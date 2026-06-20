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
import { marketplaceSubmissions } from "./marketplace-submissions";
import { marketplaceReviews } from "./marketplace-reviews";
import { sellerVerifications } from "./seller-verifications";
import { marketplaceAuditLogs } from "./marketplace-audit-logs";
import { marketplaceFlags } from "./marketplace-flags";
import { featuredListings } from "./featured-listings";

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
  submissions: many(marketplaceSubmissions),
  reviews: many(marketplaceReviews),
  verifications: many(sellerVerifications),
  flags: many(marketplaceFlags),
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
  marketplaceSubmission: one(marketplaceSubmissions, {
    fields: [threads.id],
    references: [marketplaceSubmissions.listingId],
  }),
  marketplaceAuditLogs: many(marketplaceAuditLogs),
  marketplaceFlags: many(marketplaceFlags),
  featuredListing: one(featuredListings, {
    fields: [threads.id],
    references: [featuredListings.listingId],
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

export const marketplaceSubmissionsRelations = relations(marketplaceSubmissions, ({ one, many }) => ({
  listing: one(threads, {
    fields: [marketplaceSubmissions.listingId],
    references: [threads.id],
  }),
  seller: one(users, {
    fields: [marketplaceSubmissions.sellerId],
    references: [users.id],
  }),
  assignedModerator: one(users, {
    fields: [marketplaceSubmissions.assignedModeratorId],
    references: [users.id],
  }),
  reviews: many(marketplaceReviews),
}));

export const marketplaceReviewsRelations = relations(marketplaceReviews, ({ one }) => ({
  submission: one(marketplaceSubmissions, {
    fields: [marketplaceReviews.submissionId],
    references: [marketplaceSubmissions.id],
  }),
  moderator: one(users, {
    fields: [marketplaceReviews.moderatorId],
    references: [users.id],
  }),
}));

export const sellerVerificationsRelations = relations(sellerVerifications, ({ one }) => ({
  seller: one(users, {
    fields: [sellerVerifications.sellerId],
    references: [users.id],
  }),
  verifiedByUser: one(users, {
    fields: [sellerVerifications.verifiedBy],
    references: [users.id],
  }),
}));

export const marketplaceAuditLogsRelations = relations(marketplaceAuditLogs, ({ one }) => ({
  listing: one(threads, {
    fields: [marketplaceAuditLogs.listingId],
    references: [threads.id],
  }),
  moderator: one(users, {
    fields: [marketplaceAuditLogs.moderatorId],
    references: [users.id],
  }),
}));

export const marketplaceFlagsRelations = relations(marketplaceFlags, ({ one }) => ({
  listing: one(threads, {
    fields: [marketplaceFlags.listingId],
    references: [threads.id],
  }),
  user: one(users, {
    fields: [marketplaceFlags.userId],
    references: [users.id],
  }),
  resolver: one(users, {
    fields: [marketplaceFlags.resolvedBy],
    references: [users.id],
  }),
}));

export const featuredListingsRelations = relations(featuredListings, ({ one }) => ({
  listing: one(threads, {
    fields: [featuredListings.listingId],
    references: [threads.id],
  }),
  promotedByUser: one(users, {
    fields: [featuredListings.featuredBy],
    references: [users.id],
  }),
}));
