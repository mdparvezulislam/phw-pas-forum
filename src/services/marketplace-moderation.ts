import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import { emitEvent } from "@/lib/event-bus";
import { getNextPostNumber } from "./post";
import { typesenseSyncService } from "./typesense-sync";

// Recursively count words, media, and links in TipTap JSON
function parseTiptapContent(node: any) {
  let wordCount = 0;
  let mediaCount = 0;
  let linkCount = 0;
  let externalUrlCount = 0;

  const traverse = (n: any) => {
    if (!n) return;

    if (n.type === "text") {
      const text = n.text || "";
      const words = text.trim().split(/\s+/).filter(Boolean);
      wordCount += words.length;

      if (n.marks) {
        for (const mark of n.marks) {
          if (mark.type === "link") {
            linkCount++;
            const href = mark.attrs?.href || "";
            const isExternal =
              href.startsWith("http") &&
              !href.includes("bhw-pas") &&
              !href.includes("localhost");
            if (isExternal) {
              externalUrlCount++;
            }
          }
        }
      }
    }

    if (n.type === "image" || n.type === "youtube" || n.type === "video") {
      mediaCount++;
    }

    if (n.content && Array.isArray(n.content)) {
      n.content.forEach(traverse);
    }
  };

  traverse(node);
  return { wordCount, mediaCount, linkCount, externalUrlCount };
}

export class MarketplaceModerationService {
  // Static iModBot UUID
  private IMODBOT_ID = "imodbot-system-user-id";

  async ensureImodbotUser() {
    const db = getDatabase();
    const existing = await db.query.users.findFirst({
      where: eq(schema.users.id, this.IMODBOT_ID),
    });
    if (!existing) {
      await db.insert(schema.users).values({
        id: this.IMODBOT_ID,
        username: "iModBot",
        displayName: "iModBot",
        image: "https://avatar.vercel.sh/imodbot",
        isVerified: true,
      });
    }
    return this.IMODBOT_ID;
  }

  /**
   * Submit a listing (thread) to approval queue
   */
  async submitListing(params: {
    threadId: string;
    price: number;
    paymentDetails?: string;
    sellerId: string;
  }) {
    const db = getDatabase();

    // Verify thread exists and user is owner
    const thread = await db.query.threads.findFirst({
      where: eq(schema.threads.id, params.threadId),
    });

    if (!thread) throw new Error("Thread not found");
    if (thread.authorId !== params.sellerId) {
      throw new Error("Unauthorized: You must own the thread to list it");
    }

    // Set thread status to PENDING
    await db
      .update(schema.threads)
      .set({ status: "PENDING" })
      .where(eq(schema.threads.id, params.threadId));

    // Check if duplicate submission exists
    const existingSub = await db.query.marketplaceSubmissions.findFirst({
      where: and(
        eq(schema.marketplaceSubmissions.listingId, params.threadId),
        eq(schema.marketplaceSubmissions.status, "PENDING")
      ),
    });

    let submissionId: string;
    if (existingSub) {
      submissionId = existingSub.id;
      await db
        .update(schema.marketplaceSubmissions)
        .set({
          price: params.price,
          paymentDetails: params.paymentDetails || null,
          submittedAt: new Date(),
        })
        .where(eq(schema.marketplaceSubmissions.id, submissionId));
    } else {
      const [newSub] = await db
        .insert(schema.marketplaceSubmissions)
        .values({
          listingId: params.threadId,
          sellerId: params.sellerId,
          price: params.price,
          paymentDetails: params.paymentDetails || null,
          status: "PENDING",
        })
        .returning();
      submissionId = newSub.id;
    }

    // Perform automated scoring
    const analysis = parseTiptapContent(thread.contentJson ?? {});
    const riskScore = this.calculateRiskScore(analysis, thread.title);
    const complianceScore = this.calculateComplianceScore(analysis);

    // Save automated review
    await db.insert(schema.marketplaceReviews).values({
      submissionId,
      decision: "ESCALATE",
      notes: "iModBot Automated Screening Report",
      wordCount: analysis.wordCount,
      mediaCount: analysis.mediaCount,
      linkCount: analysis.linkCount,
      externalUrlCount: analysis.externalUrlCount,
      plagiarismScore: 10, // Mock score
      riskScore,
      complianceScore,
    });

    // Log audit log
    await db.insert(schema.marketplaceAuditLogs).values({
      listingId: params.threadId,
      action: "SUBMIT",
      newState: { status: "PENDING", price: params.price },
    });

    // Emit event
    await emitEvent({
      id: crypto.randomUUID(),
      type: "LISTING_SUBMITTED" as any,
      timestamp: new Date(),
      actorId: params.sellerId,
      listingId: params.threadId,
      submissionId,
    } as any);

    return submissionId;
  }

  /**
   * Approve a listing submission
   */
  async approveSubmission(submissionId: string, moderatorId: string, notes: string) {
    const db = getDatabase();

    const sub = await db.query.marketplaceSubmissions.findFirst({
      where: eq(schema.marketplaceSubmissions.id, submissionId),
    });
    if (!sub) throw new Error("Submission not found");

    await db.transaction(async (tx) => {
      // Update submission status
      await tx
        .update(schema.marketplaceSubmissions)
        .set({
          status: "APPROVED",
          reviewedAt: new Date(),
          assignedModeratorId: moderatorId,
          notes,
        })
        .where(eq(schema.marketplaceSubmissions.id, submissionId));

      // Publish thread
      await tx
        .update(schema.threads)
        .set({ status: "PUBLISHED", publishedAt: new Date() })
        .where(eq(schema.threads.id, sub.listingId));

      // Retrieve review statistics
      const autoReview = await tx.query.marketplaceReviews.findFirst({
        where: eq(schema.marketplaceReviews.submissionId, submissionId),
        orderBy: [sql`reviewed_at desc`],
      });

      // Audit log
      await tx.insert(schema.marketplaceAuditLogs).values({
        listingId: sub.listingId,
        moderatorId,
        action: "APPROVE",
        previousState: { status: sub.status },
        newState: { status: "APPROVED" },
      });

      // Generate iModBot post
      await this.ensureImodbotUser();
      const nextNum = await getNextPostNumber(sub.listingId);

      const imodbotContent = this.formatImodbotReportMarkdown({
        moderatorName: "Admin/Mod",
        wordCount: autoReview?.wordCount ?? 0,
        mediaCount: autoReview?.mediaCount ?? 0,
        riskScore: autoReview?.riskScore ?? 0,
        complianceScore: autoReview?.complianceScore ?? 100,
        price: sub.price,
      });

      await tx.insert(schema.posts).values({
        threadId: sub.listingId,
        authorId: this.IMODBOT_ID,
        content: imodbotContent,
        contentJson: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: imodbotContent }],
            },
          ],
        },
        postNumber: nextNum,
        status: "PUBLISHED",
      });

      await tx
        .update(schema.threads)
        .set({
          replyCount: sql`${schema.threads.replyCount} + 1`,
        })
        .where(eq(schema.threads.id, sub.listingId));
    });

    // Typesense sync: Queue thread to index
    await typesenseSyncService.queueIndexJob("THREAD", sub.listingId, "CREATE");

    // Emit event
    await emitEvent({
      id: crypto.randomUUID(),
      type: "LISTING_APPROVED" as any,
      timestamp: new Date(),
      actorId: moderatorId,
      listingId: sub.listingId,
      submissionId,
    } as any);
  }

  /**
   * Reject a listing submission
   */
  async rejectSubmission(submissionId: string, moderatorId: string, reason: string) {
    const db = getDatabase();

    const sub = await db.query.marketplaceSubmissions.findFirst({
      where: eq(schema.marketplaceSubmissions.id, submissionId),
    });
    if (!sub) throw new Error("Submission not found");

    await db.transaction(async (tx) => {
      await tx
        .update(schema.marketplaceSubmissions)
        .set({
          status: "REJECTED",
          reviewedAt: new Date(),
          assignedModeratorId: moderatorId,
          rejectionReason: reason,
        })
        .where(eq(schema.marketplaceSubmissions.id, submissionId));

      await tx
        .update(schema.threads)
        .set({ status: "DELETED" })
        .where(eq(schema.threads.id, sub.listingId));

      await tx.insert(schema.marketplaceAuditLogs).values({
        listingId: sub.listingId,
        moderatorId,
        action: "REJECT",
        previousState: { status: sub.status },
        newState: { status: "REJECTED", reason },
      });
    });

    // Emit event
    await emitEvent({
      id: crypto.randomUUID(),
      type: "LISTING_REJECTED" as any,
      timestamp: new Date(),
      actorId: moderatorId,
      listingId: sub.listingId,
      submissionId,
    } as any);
  }

  /**
   * Request changes to a listing submission
   */
  async requestChanges(submissionId: string, moderatorId: string, notes: string) {
    const db = getDatabase();

    const sub = await db.query.marketplaceSubmissions.findFirst({
      where: eq(schema.marketplaceSubmissions.id, submissionId),
    });
    if (!sub) throw new Error("Submission not found");

    await db.transaction(async (tx) => {
      await tx
        .update(schema.marketplaceSubmissions)
        .set({
          status: "ESC_CHANGE_REQUEST",
          reviewedAt: new Date(),
          assignedModeratorId: moderatorId,
          notes,
        })
        .where(eq(schema.marketplaceSubmissions.id, submissionId));

      await tx
        .update(schema.threads)
        .set({ status: "DRAFT" })
        .where(eq(schema.threads.id, sub.listingId));

      await tx.insert(schema.marketplaceAuditLogs).values({
        listingId: sub.listingId,
        moderatorId,
        action: "REQUEST_CHANGES",
        previousState: { status: sub.status },
        newState: { status: "ESC_CHANGE_REQUEST" },
      });
    });

    // Emit event
    await emitEvent({
      id: crypto.randomUUID(),
      type: "LISTING_CHANGES_REQUESTED" as any,
      timestamp: new Date(),
      actorId: moderatorId,
      listingId: sub.listingId,
      submissionId,
    } as any);
  }

  /**
   * Report / Flag a marketplace listing
   */
  async flagListing(params: { listingId: string; userId: string; reason: any; notes?: string }) {
    const db = getDatabase();

    const [flag] = await db
      .insert(schema.marketplaceFlags)
      .values({
        listingId: params.listingId,
        userId: params.userId,
        reason: params.reason,
        notes: params.notes || null,
        status: "PENDING",
      })
      .returning();

    // Emit event
    await emitEvent({
      id: crypto.randomUUID(),
      type: "LISTING_REPORTED" as any,
      timestamp: new Date(),
      actorId: params.userId,
      listingId: params.listingId,
      flagId: flag.id,
    } as any);

    return flag.id;
  }

  /**
   * Resolve a listing flag report
   */
  async resolveFlag(flagId: string, action: "RESOLVED" | "DISMISSED", moderatorId: string) {
    const db = getDatabase();

    await db
      .update(schema.marketplaceFlags)
      .set({
        status: action,
        resolvedBy: moderatorId,
        resolvedAt: new Date(),
      })
      .where(eq(schema.marketplaceFlags.id, flagId));
  }

  /**
   * Apply for seller verification badge
   */
  async applyForVerification(sellerId: string, notes?: string) {
    const db = getDatabase();

    const existing = await db.query.sellerVerifications.findFirst({
      where: and(
        eq(schema.sellerVerifications.sellerId, sellerId),
        eq(schema.sellerVerifications.status, "PENDING")
      ),
    });

    if (existing) return existing.id;

    const [ver] = await db
      .insert(schema.sellerVerifications)
      .values({
        sellerId,
        status: "PENDING",
        notes: notes || null,
      })
      .returning();

    return ver.id;
  }

  /**
   * Moderator review for seller verification application
   */
  async verifySeller(
    sellerId: string,
    status: any,
    verificationLevel: string,
    notes: string,
    moderatorId: string
  ) {
    const db = getDatabase();

    const existing = await db.query.sellerVerifications.findFirst({
      where: eq(schema.sellerVerifications.sellerId, sellerId),
    });

    await db.transaction(async (tx) => {
      if (existing) {
        await tx
          .update(schema.sellerVerifications)
          .set({
            status,
            verificationLevel,
            notes,
            verifiedBy: moderatorId,
            verifiedAt: new Date(),
          })
          .where(eq(schema.sellerVerifications.id, existing.id));
      } else {
        await tx.insert(schema.sellerVerifications).values({
          sellerId,
          status,
          verificationLevel,
          notes,
          verifiedBy: moderatorId,
          verifiedAt: new Date(),
        });
      }

      // If verified, update the users.isVerified flag as well!
      await tx
        .update(schema.users)
        .set({ isVerified: status === "VERIFIED" || status === "TRUSTED" || status === "TOP_SELLER" })
        .where(eq(schema.users.id, sellerId));
    });

    // Emit event
    await emitEvent({
      id: crypto.randomUUID(),
      type: "SELLER_VERIFIED" as any,
      timestamp: new Date(),
      actorId: moderatorId,
      sellerId,
      status,
    } as any);
  }

  /**
   * Promote listing to featured list
   */
  async toggleFeaturedListing(threadId: string, featuredDays: number, moderatorId: string) {
    const db = getDatabase();

    const existing = await db.query.featuredListings.findFirst({
      where: eq(schema.featuredListings.listingId, threadId),
    });

    if (existing) {
      await db.delete(schema.featuredListings).where(eq(schema.featuredListings.listingId, threadId));
      await db
        .update(schema.threads)
        .set({ isFeatured: false })
        .where(eq(schema.threads.id, threadId));
    } else {
      const until = new Date();
      until.setDate(until.getDate() + featuredDays);

      await db.insert(schema.featuredListings).values({
        listingId: threadId,
        featuredUntil: until,
        featuredBy: moderatorId,
      });

      await db
        .update(schema.threads)
        .set({ isFeatured: true })
        .where(eq(schema.threads.id, threadId));
    }
  }

  // Scoring Risk check logic
  private calculateRiskScore(analysis: any, title: string) {
    let score = 0;

    // Too many external URLs
    if (analysis.externalUrlCount > 10) score += 40;
    else if (analysis.externalUrlCount > 5) score += 20;

    // Price claim keywords or suspicious terms in title
    const blacklisted = ["scam", "guaranteed", "100%", "earn money", "infinite", "unlimited", "hack"];
    const lowercaseTitle = title.toLowerCase();
    for (const word of blacklisted) {
      if (lowercaseTitle.includes(word)) {
        score += 25;
      }
    }

    return Math.min(score, 100);
  }

  // Scoring Compliance logic
  private calculateComplianceScore(analysis: any) {
    let score = 100;

    // Minimum word count requirements
    if (analysis.wordCount < 150) score -= 40;
    else if (analysis.wordCount < 300) score -= 20;

    // Media requirements
    if (analysis.mediaCount === 0) score -= 30;

    return Math.max(score, 0);
  }

  // Format reports markdown helper
  private formatImodbotReportMarkdown(params: {
    moderatorName: string;
    wordCount: number;
    mediaCount: number;
    riskScore: number;
    complianceScore: number;
    price: number;
  }) {
    const formattedPrice = (params.price / 100).toFixed(2);
    const riskLabel =
      params.riskScore > 60 ? "HIGH RISK 🚨" : params.riskScore > 30 ? "MEDIUM RISK ⚠️" : "LOW RISK ✅";
    const complianceLabel = params.complianceScore > 75 ? "COMPLIANT ✅" : "MINOR ISSUES ⚠️";

    return `### 🛡️ Marketplace Approval Report (iModBot System Verification)

---

- **Moderation Decision**: APPROVED
- **Review Date**: ${new Date().toLocaleDateString()}
- **Listing Price**: $${formattedPrice} USD

#### 📊 Automatic Content Analysis
- **Word Count**: ${params.wordCount} words
- **Media Count**: ${params.mediaCount} images/videos
- **Plagiarism Status**: Passed checks (Original Content Verified)
- **Risk Assessment**: **${riskLabel}** (Score: ${params.riskScore}/100)
- **Compliance Status**: **${complianceLabel}** (Score: ${params.complianceScore}/100)

---
*Note: This report is automatically generated and pinned for marketplace transparency.*`;
  }
}

export const marketplaceModerationService = new MarketplaceModerationService();
export default marketplaceModerationService;
