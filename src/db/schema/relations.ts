import { relations } from "drizzle-orm";
import { attachments } from "./attachments";
import { badges } from "./badges";
import { categories } from "./categories";
import { conversationAttachments } from "./conversation-attachments";
import { conversationMessageEditHistory } from "./conversation-message-edit-history";
import { conversationMessages } from "./conversation-messages";
import { conversationParticipants } from "./conversation-participants";
import { conversations } from "./conversations";
import { favoriteListings } from "./favorite-listings";
import { featuredListings } from "./featured-listings";
import { forums } from "./forums";
import { listingBoosts } from "./listing-boosts";
import { listingFaq } from "./listing-faq";
import { listingMedia } from "./listing-media";
import { listingPackages } from "./listing-packages";
import { marketplaceAuditLogs } from "./marketplace-audit-logs";
import { marketplaceCategories } from "./marketplace-categories";
import { marketplaceFlags } from "./marketplace-flags";
import { marketplaceListings } from "./marketplace-listings";
import { marketplaceReviews } from "./marketplace-reviews";
import { marketplaceSubmissions } from "./marketplace-submissions";
import { membershipBenefits } from "./membership-benefits";
import { membershipPlans } from "./membership-plans";
import { messageReadReceipts } from "./message-read-receipts";
import { notifications } from "./notifications";
import { postEditHistory } from "./post-edit-history";
import { postReports } from "./post-reports";
import { posts } from "./posts";
import { premiumResources } from "./premium-resources";
import { roles } from "./roles";
import { searchHistories } from "./search-histories";
import { searchQueries } from "./search-queries";
import { sellerProfiles } from "./seller-profiles";
import { sellerVerifications } from "./seller-verifications";
import { subscriptions } from "./subscriptions";
import { threadTags } from "./thread-tags";
import { threads } from "./threads";
import { userBadges } from "./user-badges";
import { userBans } from "./user-bans";
import { userMemberships } from "./user-memberships";
import { userReputation } from "./user-reputation";
import { userWarnings } from "./user-warnings";
import { users } from "./users";

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
  ordersAsBuyer: many(orders, { relationName: "buyerOrders" }),
  ordersAsSeller: many(orders, { relationName: "sellerOrders" }),
  trustProfile: one(sellerTrustProfiles, {
    fields: [users.id],
    references: [sellerTrustProfiles.sellerId],
  }),
  itraderReceived: many(itraderFeedback, { relationName: "itraderToUser" }),
  itraderGiven: many(itraderFeedback, { relationName: "itraderFromUser" }),
  disputesAsBuyer: many(disputes, { relationName: "buyerDisputes" }),
  disputesAsSeller: many(disputes, { relationName: "sellerDisputes" }),
  memberships: many(userMemberships),
  subscriptions: many(subscriptions),
  warnings: many(userWarnings),
  ban: one(userBans, {
    fields: [users.id],
    references: [userBans.userId],
  }),
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
  buyerReviews: many(buyerReviews),
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

export const postEditHistoryRelations = relations(
  postEditHistory,
  ({ one }) => ({
    post: one(posts, {
      fields: [postEditHistory.postId],
      references: [posts.id],
    }),
    editor: one(users, {
      fields: [postEditHistory.editedBy],
      references: [users.id],
    }),
  }),
);

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
export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    creator: one(users, {
      fields: [conversations.createdBy],
      references: [users.id],
    }),
    participants: many(conversationParticipants),
    messages: many(conversationMessages),
  }),
);

export const conversationParticipantsRelations = relations(
  conversationParticipants,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationParticipants.conversationId],
      references: [conversations.id],
    }),
    user: one(users, {
      fields: [conversationParticipants.userId],
      references: [users.id],
    }),
  }),
);

export const conversationMessagesRelations = relations(
  conversationMessages,
  ({ one, many }) => ({
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
  }),
);

export const conversationMessageEditHistoryRelations = relations(
  conversationMessageEditHistory,
  ({ one }) => ({
    message: one(conversationMessages, {
      fields: [conversationMessageEditHistory.messageId],
      references: [conversationMessages.id],
    }),
    editor: one(users, {
      fields: [conversationMessageEditHistory.editedBy],
      references: [users.id],
    }),
  }),
);

export const conversationAttachmentsRelations = relations(
  conversationAttachments,
  ({ one }) => ({
    message: one(conversationMessages, {
      fields: [conversationAttachments.messageId],
      references: [conversationMessages.id],
    }),
    attachment: one(attachments, {
      fields: [conversationAttachments.attachmentId],
      references: [attachments.id],
    }),
  }),
);

export const messageReadReceiptsRelations = relations(
  messageReadReceipts,
  ({ one }) => ({
    message: one(conversationMessages, {
      fields: [messageReadReceipts.messageId],
      references: [conversationMessages.id],
    }),
    user: one(users, {
      fields: [messageReadReceipts.userId],
      references: [users.id],
    }),
  }),
);

export const searchHistoriesRelations = relations(
  searchHistories,
  ({ one }) => ({
    user: one(users, {
      fields: [searchHistories.userId],
      references: [users.id],
    }),
  }),
);

export const searchQueriesRelations = relations(searchQueries, ({ one }) => ({
  user: one(users, {
    fields: [searchQueries.userId],
    references: [users.id],
  }),
}));

export const marketplaceSubmissionsRelations = relations(
  marketplaceSubmissions,
  ({ one, many }) => ({
    listing: one(marketplaceListings, {
      fields: [marketplaceSubmissions.listingId],
      references: [marketplaceListings.id],
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
  }),
);

export const marketplaceReviewsRelations = relations(
  marketplaceReviews,
  ({ one }) => ({
    submission: one(marketplaceSubmissions, {
      fields: [marketplaceReviews.submissionId],
      references: [marketplaceSubmissions.id],
    }),
    moderator: one(users, {
      fields: [marketplaceReviews.moderatorId],
      references: [users.id],
    }),
  }),
);

export const sellerVerificationsRelations = relations(
  sellerVerifications,
  ({ one }) => ({
    seller: one(users, {
      fields: [sellerVerifications.sellerId],
      references: [users.id],
    }),
    verifiedByUser: one(users, {
      fields: [sellerVerifications.verifiedBy],
      references: [users.id],
    }),
  }),
);

export const marketplaceAuditLogsRelations = relations(
  marketplaceAuditLogs,
  ({ one }) => ({
    listing: one(marketplaceListings, {
      fields: [marketplaceAuditLogs.listingId],
      references: [marketplaceListings.id],
    }),
    moderator: one(users, {
      fields: [marketplaceAuditLogs.moderatorId],
      references: [users.id],
    }),
  }),
);

export const marketplaceFlagsRelations = relations(
  marketplaceFlags,
  ({ one }) => ({
    listing: one(marketplaceListings, {
      fields: [marketplaceFlags.listingId],
      references: [marketplaceListings.id],
    }),
    user: one(users, {
      fields: [marketplaceFlags.userId],
      references: [users.id],
    }),
    resolver: one(users, {
      fields: [marketplaceFlags.resolvedBy],
      references: [users.id],
    }),
  }),
);

export const featuredListingsRelations = relations(
  featuredListings,
  ({ one }) => ({
    listing: one(threads, {
      fields: [featuredListings.listingId],
      references: [threads.id],
    }),
    promotedByUser: one(users, {
      fields: [featuredListings.featuredBy],
      references: [users.id],
    }),
  }),
);

import { buyerReviews } from "./buyer-reviews";
import { disputeMessages, disputes } from "./disputes";
import { itraderFeedback } from "./itrader-feedback";
import {
  orderDeliveries,
  orderMessages,
  orderRevisions,
  orders,
} from "./orders";
import { sellerTrustProfiles } from "./seller-trust-profiles";
import { transactions } from "./transactions";

export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
  }),
  seller: one(users, {
    fields: [orders.sellerId],
    references: [users.id],
  }),
  listing: one(marketplaceListings, {
    fields: [orders.listingId],
    references: [marketplaceListings.id],
  }),
  package: one(listingPackages, {
    fields: [orders.packageId],
    references: [listingPackages.id],
  }),
  messages: many(orderMessages),
  deliveries: many(orderDeliveries),
  revisions: many(orderRevisions),
  transactions: many(transactions),
  dispute: one(disputes),
  review: one(buyerReviews),
}));

export const orderMessagesRelations = relations(orderMessages, ({ one }) => ({
  order: one(orders, {
    fields: [orderMessages.orderId],
    references: [orders.id],
  }),
  sender: one(users, {
    fields: [orderMessages.senderId],
    references: [users.id],
  }),
}));

export const orderDeliveriesRelations = relations(
  orderDeliveries,
  ({ one }) => ({
    order: one(orders, {
      fields: [orderDeliveries.orderId],
      references: [orders.id],
    }),
    seller: one(users, {
      fields: [orderDeliveries.sellerId],
      references: [users.id],
    }),
  }),
);

export const orderRevisionsRelations = relations(orderRevisions, ({ one }) => ({
  order: one(orders, {
    fields: [orderRevisions.orderId],
    references: [orders.id],
  }),
  requester: one(users, {
    fields: [orderRevisions.requestedBy],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  order: one(orders, {
    fields: [transactions.orderId],
    references: [orders.id],
  }),
  buyer: one(users, {
    fields: [transactions.buyerId],
    references: [users.id],
  }),
  seller: one(users, {
    fields: [transactions.sellerId],
    references: [users.id],
  }),
}));

export const itraderFeedbackRelations = relations(
  itraderFeedback,
  ({ one }) => ({
    order: one(orders, {
      fields: [itraderFeedback.orderId],
      references: [orders.id],
    }),
    fromUser: one(users, {
      fields: [itraderFeedback.fromUserId],
      references: [users.id],
    }),
    toUser: one(users, {
      fields: [itraderFeedback.toUserId],
      references: [users.id],
    }),
  }),
);

export const sellerTrustProfilesRelations = relations(
  sellerTrustProfiles,
  ({ one }) => ({
    seller: one(users, {
      fields: [sellerTrustProfiles.sellerId],
      references: [users.id],
    }),
  }),
);

export const disputesRelations = relations(disputes, ({ one, many }) => ({
  order: one(orders, {
    fields: [disputes.orderId],
    references: [orders.id],
  }),
  buyer: one(users, {
    fields: [disputes.buyerId],
    references: [users.id],
  }),
  seller: one(users, {
    fields: [disputes.sellerId],
    references: [users.id],
  }),
  moderator: one(users, {
    fields: [disputes.moderatorId],
    references: [users.id],
  }),
  messages: many(disputeMessages),
}));

export const disputeMessagesRelations = relations(
  disputeMessages,
  ({ one }) => ({
    dispute: one(disputes, {
      fields: [disputeMessages.disputeId],
      references: [disputes.id],
    }),
    sender: one(users, {
      fields: [disputeMessages.senderId],
      references: [users.id],
    }),
  }),
);

export const buyerReviewsRelations = relations(buyerReviews, ({ one }) => ({
  order: one(orders, {
    fields: [buyerReviews.orderId],
    references: [orders.id],
  }),
  listing: one(marketplaceListings, {
    fields: [buyerReviews.listingId],
    references: [marketplaceListings.id],
  }),
  buyer: one(users, {
    fields: [buyerReviews.buyerId],
    references: [users.id],
  }),
  seller: one(users, {
    fields: [buyerReviews.sellerId],
    references: [users.id],
  }),
}));

export const sellerProfilesRelations = relations(
  sellerProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [sellerProfiles.userId],
      references: [users.id],
    }),
    listings: many(marketplaceListings),
  }),
);

export const marketplaceCategoriesRelations = relations(
  marketplaceCategories,
  ({ many }) => ({
    listings: many(marketplaceListings),
  }),
);

export const marketplaceListingsRelations = relations(
  marketplaceListings,
  ({ one, many }) => ({
    seller: one(sellerProfiles, {
      fields: [marketplaceListings.sellerId],
      references: [sellerProfiles.id],
    }),
    category: one(marketplaceCategories, {
      fields: [marketplaceListings.categoryId],
      references: [marketplaceCategories.id],
    }),
    media: many(listingMedia),
    packages: many(listingPackages),
    faqs: many(listingFaq),
    favorites: many(favoriteListings),
    marketplaceSubmission: one(marketplaceSubmissions, {
      fields: [marketplaceListings.id],
      references: [marketplaceSubmissions.listingId],
    }),
    marketplaceAuditLogs: many(marketplaceAuditLogs),
    marketplaceFlags: many(marketplaceFlags),
    featuredListing: one(featuredListings, {
      fields: [marketplaceListings.id],
      references: [featuredListings.listingId],
    }),
    orders: many(orders),
    buyerReviews: many(buyerReviews),
    boosts: many(listingBoosts),
  }),
);

export const listingMediaRelations = relations(listingMedia, ({ one }) => ({
  listing: one(marketplaceListings, {
    fields: [listingMedia.listingId],
    references: [marketplaceListings.id],
  }),
  attachment: one(attachments, {
    fields: [listingMedia.attachmentId],
    references: [attachments.id],
  }),
}));

export const listingPackagesRelations = relations(
  listingPackages,
  ({ one }) => ({
    listing: one(marketplaceListings, {
      fields: [listingPackages.listingId],
      references: [marketplaceListings.id],
    }),
  }),
);

export const listingFaqRelations = relations(listingFaq, ({ one }) => ({
  listing: one(marketplaceListings, {
    fields: [listingFaq.listingId],
    references: [marketplaceListings.id],
  }),
}));

export const favoriteListingsRelations = relations(
  favoriteListings,
  ({ one }) => ({
    user: one(users, {
      fields: [favoriteListings.userId],
      references: [users.id],
    }),
    listing: one(marketplaceListings, {
      fields: [favoriteListings.listingId],
      references: [marketplaceListings.id],
    }),
  }),
);

export const membershipPlansRelations = relations(
  membershipPlans,
  ({ many }) => ({
    benefits: many(membershipBenefits),
    userMemberships: many(userMemberships),
  }),
);

export const membershipBenefitsRelations = relations(
  membershipBenefits,
  ({ one }) => ({
    plan: one(membershipPlans, {
      fields: [membershipBenefits.planId],
      references: [membershipPlans.id],
    }),
  }),
);

export const userMembershipsRelations = relations(
  userMemberships,
  ({ one, many }) => ({
    user: one(users, {
      fields: [userMemberships.userId],
      references: [users.id],
    }),
    plan: one(membershipPlans, {
      fields: [userMemberships.planId],
      references: [membershipPlans.id],
    }),
    subscriptions: many(subscriptions),
  }),
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  membership: one(userMemberships, {
    fields: [subscriptions.membershipId],
    references: [userMemberships.id],
  }),
}));

export const listingBoostsRelations = relations(listingBoosts, ({ one }) => ({
  listing: one(marketplaceListings, {
    fields: [listingBoosts.listingId],
    references: [marketplaceListings.id],
  }),
}));

export const premiumResourcesRelations = relations(
  premiumResources,
  ({ one }) => ({
    attachment: one(attachments, {
      fields: [premiumResources.attachmentId],
      references: [attachments.id],
    }),
  }),
);

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  premiumResource: one(premiumResources, {
    fields: [attachments.id],
    references: [premiumResources.attachmentId],
  }),
}));
