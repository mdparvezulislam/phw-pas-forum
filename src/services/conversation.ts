import "server-only";
import { and, desc, eq, inArray, lt, ne, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import { emitEvent } from "@/lib/event-bus";
import { realtimeService } from "@/lib/realtime";
import { auditService } from "./audit";

export class ConversationService {
  // 1. Create a conversation
  async createConversation(params: {
    title?: string;
    type?: "PRIVATE" | "GROUP" | "SUPPORT" | "MARKETPLACE" | "SYSTEM";
    creatorId: string;
    participantIds: string[]; // does NOT include creatorId, we add it automatically
    firstMessageJson: any;
  }) {
    const db = getDatabase();
    const type = params.type ?? "PRIVATE";
    const allParticipantIds = Array.from(new Set([params.creatorId, ...params.participantIds]));

    // Check if a direct message conversation already exists between the two users
    if (type === "PRIVATE" && allParticipantIds.length === 2) {
      const existing = await this.findExistingPrivateConversation(allParticipantIds[0], allParticipantIds[1]);
      if (existing) {
        // If it exists, just send the message to the existing one!
        await this.sendMessage({
          conversationId: existing.id,
          senderId: params.creatorId,
          contentJson: params.firstMessageJson,
        });
        return existing;
      }
    }

    return await db.transaction(async (tx) => {
      // Create conversation
      const [conv] = await tx
        .insert(schema.conversations)
        .values({
          title: params.title || null,
          type,
          createdBy: params.creatorId,
          participantCount: allParticipantIds.length,
          lastActivityAt: new Date(),
        })
        .returning();

      // Create participants
      await tx.insert(schema.conversationParticipants).values(
        allParticipantIds.map((userId) => ({
          conversationId: conv.id,
          userId,
          isArchived: false,
          isMuted: false,
          isLeft: false,
        }))
      );

      // Create first message
      const [msg] = await tx
        .insert(schema.conversationMessages)
        .values({
          conversationId: conv.id,
          senderId: params.creatorId,
          contentJson: params.firstMessageJson,
        })
        .returning();

      // Update lastMessageId on conversation
      await tx
        .update(schema.conversations)
        .set({
          lastMessageId: msg.id,
        })
        .where(eq(schema.conversations.id, conv.id));

      // Mark first message as read for the sender
      await tx
        .insert(schema.messageReadReceipts)
        .values({
          messageId: msg.id,
          userId: params.creatorId,
        });

      await tx
        .update(schema.conversationParticipants)
        .set({
          lastReadMessageId: msg.id,
        })
        .where(
          and(
            eq(schema.conversationParticipants.conversationId, conv.id),
            eq(schema.conversationParticipants.userId, params.creatorId)
          )
        );

      // Auditing
      await auditService.log(params.creatorId, "conversation:create", {
        resource: "conversation",
        resourceId: conv.id,
        metadata: { type, participantCount: allParticipantIds.length },
      });

      // Emit events for notification service
      for (const participantId of allParticipantIds) {
        if (participantId === params.creatorId) continue;
        await emitEvent({
          id: crypto.randomUUID(),
          type: "CONVERSATION_INVITE" as any,
          timestamp: new Date(),
          actorId: params.creatorId,
          conversationId: conv.id,
          userId: participantId,
        } as any);
      }

      // Emit private message event
      await emitEvent({
        id: crypto.randomUUID(),
        type: "PRIVATE_MESSAGE",
        timestamp: new Date(),
        actorId: params.creatorId,
        messageId: msg.id,
        conversationId: conv.id,
      } as any);

      // Realtime notification to all participants
      const sender = await tx.query.users.findFirst({
        where: eq(schema.users.id, params.creatorId),
        columns: { id: true, username: true, displayName: true, image: true },
      });

      const messageWithSender = {
        ...msg,
        sender,
        attachments: [],
        readReceipts: [{ userId: params.creatorId, readAt: new Date() }],
      };

      for (const participantId of allParticipantIds) {
        // Publish to user channel about new conversation
        realtimeService.publish(`user:${participantId}`, {
          type: "CONVERSATION_NEW",
          payload: {
            conversation: {
              ...conv,
              lastMessageId: msg.id,
              lastMessage: messageWithSender,
            },
          },
        });
      }

      return conv;
    });
  }

  // Find private conversation between two users
  async findExistingPrivateConversation(userId1: string, userId2: string) {
    const db = getDatabase();
    const result = await db
      .select({ id: schema.conversations.id })
      .from(schema.conversations)
      .innerJoin(
        schema.conversationParticipants,
        eq(schema.conversations.id, schema.conversationParticipants.conversationId)
      )
      .where(
        and(
          eq(schema.conversations.type, "PRIVATE"),
          eq(schema.conversationParticipants.isLeft, false)
        )
      )
      .groupBy(schema.conversations.id)
      .having(
        sql`count(case when ${schema.conversationParticipants.userId} in (${userId1}, ${userId2}) then 1 end) = 2`
      );

    if (result.length > 0) {
      return await db.query.conversations.findFirst({
        where: eq(schema.conversations.id, result[0].id),
      });
    }
    return null;
  }

  // 2. Send message
  async sendMessage(params: {
    conversationId: string;
    senderId: string;
    contentJson: any;
    attachmentIds?: string[];
  }) {
    const db = getDatabase();

    // Verify sender is participant and has not left
    const participant = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(schema.conversationParticipants.conversationId, params.conversationId),
        eq(schema.conversationParticipants.userId, params.senderId),
        eq(schema.conversationParticipants.isLeft, false)
      ),
    });

    if (!participant) {
      throw new Error("Unauthorized: Sender is not a participant of this conversation");
    }

    const hasAttachments = !!params.attachmentIds && params.attachmentIds.length > 0;

    return await db.transaction(async (tx) => {
      const [msg] = await tx
        .insert(schema.conversationMessages)
        .values({
          conversationId: params.conversationId,
          senderId: params.senderId,
          contentJson: params.contentJson,
          hasAttachments,
        })
        .returning();

      // If attachments, insert attachments relations
      let attachmentsList: any[] = [];
      if (hasAttachments && params.attachmentIds) {
        await tx.insert(schema.conversationAttachments).values(
          params.attachmentIds.map((attId) => ({
            messageId: msg.id,
            attachmentId: attId,
          }))
        );

        attachmentsList = await tx
          .select({
            id: schema.attachments.id,
            fileName: schema.attachments.fileName,
            originalName: schema.attachments.originalName,
            mimeType: schema.attachments.mimeType,
            fileSize: schema.attachments.fileSize,
            url: schema.attachments.url,
          })
          .from(schema.conversationAttachments)
          .innerJoin(
            schema.attachments,
            eq(schema.conversationAttachments.attachmentId, schema.attachments.id)
          )
          .where(eq(schema.conversationAttachments.messageId, msg.id));
      }

      // Update conversation last activity
      await tx
        .update(schema.conversations)
        .set({
          lastMessageId: msg.id,
          lastActivityAt: new Date(),
        })
        .where(eq(schema.conversations.id, params.conversationId));

      // Mark as read for sender
      await tx
        .insert(schema.messageReadReceipts)
        .values({
          messageId: msg.id,
          userId: params.senderId,
        });

      await tx
        .update(schema.conversationParticipants)
        .set({
          lastReadMessageId: msg.id,
          isArchived: false,
        })
        .where(
          and(
            eq(schema.conversationParticipants.conversationId, params.conversationId),
            eq(schema.conversationParticipants.userId, params.senderId)
          )
        );

      // For other participants, reset archived flag if they are active
      await tx
        .update(schema.conversationParticipants)
        .set({
          isArchived: false,
        })
        .where(
          and(
            eq(schema.conversationParticipants.conversationId, params.conversationId),
            ne(schema.conversationParticipants.userId, params.senderId),
            eq(schema.conversationParticipants.isLeft, false)
          )
        );

      // Audit log
      await auditService.log(params.senderId, "conversation:message_send", {
        resource: "conversation_message",
        resourceId: msg.id,
        metadata: { conversationId: params.conversationId },
      });

      // Emit event for notifications
      await emitEvent({
        id: crypto.randomUUID(),
        type: "PRIVATE_MESSAGE",
        timestamp: new Date(),
        actorId: params.senderId,
        messageId: msg.id,
        conversationId: params.conversationId,
      } as any);

      const sender = await tx.query.users.findFirst({
        where: eq(schema.users.id, params.senderId),
        columns: { id: true, username: true, displayName: true, image: true },
      });

      const messageWithSender = {
        ...msg,
        sender,
        attachments: attachmentsList,
        readReceipts: [{ userId: params.senderId, readAt: new Date() }],
      };

      // Realtime publish to conversation channel
      realtimeService.publish(`conversation:${params.conversationId}`, {
        type: "MESSAGE_NEW",
        payload: messageWithSender,
      });

      // Refresh conversations list for all participants
      const activeParticipants = await tx.query.conversationParticipants.findMany({
        where: and(
          eq(schema.conversationParticipants.conversationId, params.conversationId),
          eq(schema.conversationParticipants.isLeft, false)
        ),
      });

      for (const part of activeParticipants) {
        realtimeService.publish(`user:${part.userId}`, {
          type: "CONVERSATION_UPDATE",
          payload: {
            conversationId: params.conversationId,
            lastMessage: messageWithSender,
            lastActivityAt: new Date(),
          },
        });
      }

      return messageWithSender;
    });
  }

  // 3. Edit message
  async editMessage(messageId: string, userId: string, newContentJson: any) {
    const db = getDatabase();

    const msg = await db.query.conversationMessages.findFirst({
      where: eq(schema.conversationMessages.id, messageId),
    });

    if (!msg) throw new Error("Message not found");
    if (msg.senderId !== userId) throw new Error("Unauthorized to edit this message");
    if (msg.isDeleted) throw new Error("Cannot edit a deleted message");

    await db.transaction(async (tx) => {
      // Save in history
      await tx.insert(schema.conversationMessageEditHistory).values({
        messageId,
        previousContentJson: msg.contentJson,
        editedBy: userId,
      });

      // Update message
      await tx
        .update(schema.conversationMessages)
        .set({
          contentJson: newContentJson,
          isEdited: true,
          editedAt: new Date(),
        })
        .where(eq(schema.conversationMessages.id, messageId));

      // Audit log
      await auditService.log(userId, "conversation:message_edit", {
        resource: "conversation_message",
        resourceId: messageId,
        metadata: { conversationId: msg.conversationId },
      });

      // Realtime update
      realtimeService.publish(`conversation:${msg.conversationId}`, {
        type: "MESSAGE_EDIT",
        payload: {
          messageId,
          contentJson: newContentJson,
          isEdited: true,
          editedAt: new Date(),
        },
      });
    });
  }

  // 4. Delete message (soft delete)
  async deleteMessage(messageId: string, userId: string, isModerator = false) {
    const db = getDatabase();

    const msg = await db.query.conversationMessages.findFirst({
      where: eq(schema.conversationMessages.id, messageId),
    });

    if (!msg) throw new Error("Message not found");
    if (msg.senderId !== userId && !isModerator) {
      throw new Error("Unauthorized to delete this message");
    }

    await db.transaction(async (tx) => {
      // Soft delete: clear attachments relations, flag isDeleted
      await tx
        .update(schema.conversationMessages)
        .set({
          isDeleted: true,
          contentJson: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "This message was deleted." }] }] },
        })
        .where(eq(schema.conversationMessages.id, messageId));

      // Delete attachments linked to this message
      await tx.delete(schema.conversationAttachments).where(eq(schema.conversationAttachments.messageId, messageId));

      // Audit log
      await auditService.log(userId, "conversation:message_delete", {
        resource: "conversation_message",
        resourceId: messageId,
        metadata: { conversationId: msg.conversationId, moderatorAction: isModerator && msg.senderId !== userId },
      });

      // Realtime update
      realtimeService.publish(`conversation:${msg.conversationId}`, {
        type: "MESSAGE_DELETE",
        payload: {
          messageId,
        },
      });
    });
  }

  // 5. Mark as read
  async markAsRead(conversationId: string, userId: string, messageId: string) {
    const db = getDatabase();

    const participant = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(schema.conversationParticipants.conversationId, conversationId),
        eq(schema.conversationParticipants.userId, userId),
        eq(schema.conversationParticipants.isLeft, false)
      ),
    });

    if (!participant) return;

    await db.transaction(async (tx) => {
      // Check if read receipt already exists
      const existing = await tx.query.messageReadReceipts.findFirst({
        where: and(
          eq(schema.messageReadReceipts.messageId, messageId),
          eq(schema.messageReadReceipts.userId, userId)
        ),
      });

      if (!existing) {
        await tx.insert(schema.messageReadReceipts).values({
          messageId,
          userId,
        });
      }

      await tx
        .update(schema.conversationParticipants)
        .set({
          lastReadMessageId: messageId,
        })
        .where(
          and(
            eq(schema.conversationParticipants.conversationId, conversationId),
            eq(schema.conversationParticipants.userId, userId)
          )
        );

      const user = await tx.query.users.findFirst({
        where: eq(schema.users.id, userId),
        columns: { id: true, username: true, displayName: true },
      });

      // Realtime receipt broadcast
      realtimeService.publish(`conversation:${conversationId}`, {
        type: "READ_RECEIPT",
        payload: {
          conversationId,
          messageId,
          userId,
          displayName: user?.displayName ?? user?.username ?? "Unknown",
          readAt: new Date(),
        },
      });

      // Publish unread count updates
      const unreadCount = await this.getUnreadCountForUser(userId);
      realtimeService.publish(`user:${userId}`, {
        type: "UNREAD_PM_COUNT",
        payload: { count: unreadCount },
      });
    });
  }

  // Get total unread conversations count for user
  async getUnreadCountForUser(userId: string): Promise<number> {
    const db = getDatabase();

    const participants = await db.query.conversationParticipants.findMany({
      where: and(
        eq(schema.conversationParticipants.userId, userId),
        eq(schema.conversationParticipants.isLeft, false)
      ),
      with: {
        conversation: true,
      },
    });

    let unreadCount = 0;
    for (const part of participants) {
      if (!part.conversation) continue;
      if (part.lastReadMessageId !== part.conversation.lastMessageId) {
        unreadCount++;
      }
    }
    return unreadCount;
  }

  // 6. Add Participant
  async addParticipant(conversationId: string, userId: string, actorId: string) {
    const db = getDatabase();

    // Verify actor is participant
    const actorPart = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(schema.conversationParticipants.conversationId, conversationId),
        eq(schema.conversationParticipants.userId, actorId),
        eq(schema.conversationParticipants.isLeft, false)
      ),
    });

    if (!actorPart) throw new Error("Unauthorized: Actor is not in conversation");

    // Check if already participant
    const existing = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(schema.conversationParticipants.conversationId, conversationId),
        eq(schema.conversationParticipants.userId, userId)
      ),
    });

    await db.transaction(async (tx) => {
      if (existing) {
        if (!existing.isLeft) return; // already active
        // rejoin
        await tx
          .update(schema.conversationParticipants)
          .set({
            isLeft: false,
            joinedAt: new Date(),
          })
          .where(eq(schema.conversationParticipants.id, existing.id));
      } else {
        await tx.insert(schema.conversationParticipants).values({
          conversationId,
          userId,
        });
      }

      // Update participant count
      await tx
        .update(schema.conversations)
        .set({
          participantCount: sql`${schema.conversations.participantCount} + 1`,
        })
        .where(eq(schema.conversations.id, conversationId));

      // Audit log
      await auditService.log(actorId, "conversation:participant_add", {
        resource: "conversation",
        resourceId: conversationId,
        metadata: { addedUserId: userId },
      });

      // Emit event
      await emitEvent({
        id: crypto.randomUUID(),
        type: "CONVERSATION_INVITE" as any,
        timestamp: new Date(),
        actorId,
        conversationId,
        userId,
      } as any);
    });
  }

  // 7. Leave Conversation
  async leaveConversation(conversationId: string, userId: string) {
    const db = getDatabase();

    const participant = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(schema.conversationParticipants.conversationId, conversationId),
        eq(schema.conversationParticipants.userId, userId),
        eq(schema.conversationParticipants.isLeft, false)
      ),
    });

    if (!participant) return;

    await db.transaction(async (tx) => {
      await tx
        .update(schema.conversationParticipants)
        .set({
          isLeft: true,
        })
        .where(eq(schema.conversationParticipants.id, participant.id));

      await tx
        .update(schema.conversations)
        .set({
          participantCount: sql`greatest(${schema.conversations.participantCount} - 1, 0)`,
        })
        .where(eq(schema.conversations.id, conversationId));

      // Audit log
      await auditService.log(userId, "conversation:participant_leave", {
        resource: "conversation",
        resourceId: conversationId,
      });
    });
  }

  // 8. Archive Conversation
  async archiveConversation(conversationId: string, userId: string, isArchived: boolean) {
    const db = getDatabase();
    await db
      .update(schema.conversationParticipants)
      .set({ isArchived })
      .where(
        and(
          eq(schema.conversationParticipants.conversationId, conversationId),
          eq(schema.conversationParticipants.userId, userId)
        )
      );

    await auditService.log(userId, "conversation:archive", {
      resource: "conversation",
      resourceId: conversationId,
      metadata: { isArchived },
    });
  }

  // 9. Mute Conversation
  async muteConversation(conversationId: string, userId: string, isMuted: boolean) {
    const db = getDatabase();
    await db
      .update(schema.conversationParticipants)
      .set({ isMuted })
      .where(
        and(
          eq(schema.conversationParticipants.conversationId, conversationId),
          eq(schema.conversationParticipants.userId, userId)
        )
      );
  }

  // 10. Query messages
  async getMessages(
    conversationId: string,
    userId: string,
    options: { limit?: number; cursor?: string } = {}
  ) {
    const db = getDatabase();
    const limit = options.limit ?? 50;

    // Verify participant
    const part = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(schema.conversationParticipants.conversationId, conversationId),
        eq(schema.conversationParticipants.userId, userId),
        eq(schema.conversationParticipants.isLeft, false)
      ),
    });

    if (!part) throw new Error("Unauthorized: You are not a participant in this conversation");

    const whereConditions = [eq(schema.conversationMessages.conversationId, conversationId)];
    if (options.cursor) {
      whereConditions.push(lt(schema.conversationMessages.createdAt, new Date(options.cursor)));
    }

    const items = await db.query.conversationMessages.findMany({
      where: and(...whereConditions),
      orderBy: [desc(schema.conversationMessages.createdAt)],
      limit: limit + 1, // Fetch 1 extra to check next cursor
      with: {
        sender: {
          columns: { id: true, username: true, displayName: true, image: true },
        },
        attachments: {
          with: {
            attachment: {
              columns: { id: true, fileName: true, originalName: true, mimeType: true, fileSize: true, url: true },
            },
          },
        },
        readReceipts: {
          with: {
            user: {
              columns: { id: true, username: true, displayName: true },
            },
          },
        },
      },
    });

    const hasMore = items.length > limit;
    const paginatedItems = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? paginatedItems[paginatedItems.length - 1].createdAt.toISOString() : null;

    // Normalize attachments
    const normalizedItems = paginatedItems.map((item) => ({
      ...item,
      attachments: item.attachments.map((a) => a.attachment),
      readReceipts: item.readReceipts.map((r) => ({
        userId: r.userId,
        username: r.user.username,
        displayName: r.user.displayName,
        readAt: r.readAt,
      })),
    }));

    // Return in chronological order
    return {
      items: normalizedItems.reverse(),
      nextCursor,
    };
  }

  // 11. Query conversations list
  async getConversations(
    userId: string,
    options: { limit?: number; cursor?: string; isArchived?: boolean } = {}
  ) {
    const db = getDatabase();
    const limit = options.limit ?? 20;
    const isArchived = options.isArchived ?? false;

    const participantConditions = [
      eq(schema.conversationParticipants.userId, userId),
      eq(schema.conversationParticipants.isArchived, isArchived),
      eq(schema.conversationParticipants.isLeft, false),
    ];

    if (options.cursor) {
      participantConditions.push(lt(schema.conversationParticipants.joinedAt, new Date(options.cursor)));
    }

    const participations = await db.query.conversationParticipants.findMany({
      where: and(...participantConditions),
      orderBy: [desc(schema.conversationParticipants.joinedAt)],
      with: {
        conversation: {
          with: {
            creator: {
              columns: { id: true, username: true, displayName: true, image: true },
            },
          },
        },
      },
    });

    // Hydrate each conversation with last message details and participants
    const resultItems = [];
    for (const part of participations) {
      const conv = part.conversation;
      if (!conv) continue;

      // Find last message details
      let lastMessage = null;
      if (conv.lastMessageId) {
        const msg = await db.query.conversationMessages.findFirst({
          where: eq(schema.conversationMessages.id, conv.lastMessageId),
          with: {
            sender: {
              columns: { id: true, username: true, displayName: true },
            },
          },
        });
        if (msg) {
          lastMessage = {
            ...msg,
            sender: msg.sender,
          };
        }
      }

      // Find other participants
      const otherParts = await db.query.conversationParticipants.findMany({
        where: and(
          eq(schema.conversationParticipants.conversationId, conv.id),
          ne(schema.conversationParticipants.userId, userId),
          eq(schema.conversationParticipants.isLeft, false)
        ),
        with: {
          user: {
            columns: { id: true, username: true, displayName: true, image: true },
          },
        },
      });

      const otherUsers = otherParts.map((p) => p.user);

      resultItems.push({
        ...conv,
        isMuted: part.isMuted,
        isArchived: part.isArchived,
        lastReadMessageId: part.lastReadMessageId,
        unread: part.lastReadMessageId !== conv.lastMessageId,
        lastMessage,
        participants: otherUsers,
      });
    }

    // Sort by lastActivityAt descending
    resultItems.sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());

    const hasMore = resultItems.length > limit;
    const paginatedItems = hasMore ? resultItems.slice(0, limit) : resultItems;
    const nextCursor = hasMore ? participations[limit - 1].joinedAt.toISOString() : null;

    return {
      items: paginatedItems,
      nextCursor,
    };
  }
}

export const conversationService = new ConversationService();
export default conversationService;
