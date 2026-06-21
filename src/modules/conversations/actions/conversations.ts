"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDatabase, schema } from "@/db";
import { realtimeService } from "@/lib/realtime";
import { requireAuth } from "@/modules/auth/guards";
import { conversationService } from "@/services/conversation";

export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function createConversationAction(params: {
  title?: string;
  type?: "PRIVATE" | "GROUP" | "SUPPORT" | "MARKETPLACE" | "SYSTEM";
  participantIds: string[];
  firstMessageJson: any;
}): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const result = await conversationService.createConversation({
      ...params,
      creatorId: user.id,
    });
    revalidatePath("/conversations");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[createConversationAction] failed:", error);
    return {
      success: false,
      error: error.message || "Failed to create conversation",
    };
  }
}

export async function sendMessageAction(
  conversationId: string,
  contentJson: any,
  attachmentIds?: string[],
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const result = await conversationService.sendMessage({
      conversationId,
      senderId: user.id,
      contentJson,
      attachmentIds,
    });
    revalidatePath(`/conversations/${conversationId}`);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[sendMessageAction] failed:", error);
    return { success: false, error: error.message || "Failed to send message" };
  }
}

export async function editMessageAction(
  messageId: string,
  contentJson: any,
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();
    await conversationService.editMessage(messageId, user.id, contentJson);
    return { success: true };
  } catch (error: any) {
    console.error("[editMessageAction] failed:", error);
    return { success: false, error: error.message || "Failed to edit message" };
  }
}

export async function deleteMessageAction(
  messageId: string,
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();
    await conversationService.deleteMessage(messageId, user.id);
    return { success: true };
  } catch (error: any) {
    console.error("[deleteMessageAction] failed:", error);
    return {
      success: false,
      error: error.message || "Failed to delete message",
    };
  }
}

export async function addParticipantAction(
  conversationId: string,
  userId: string,
): Promise<ActionResponse> {
  try {
    const actor = await requireAuth();
    await conversationService.addParticipant(conversationId, userId, actor.id);
    revalidatePath(`/conversations/${conversationId}`);
    return { success: true };
  } catch (error: any) {
    console.error("[addParticipantAction] failed:", error);
    return {
      success: false,
      error: error.message || "Failed to add participant",
    };
  }
}

export async function leaveConversationAction(
  conversationId: string,
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();
    await conversationService.leaveConversation(conversationId, user.id);
    revalidatePath("/conversations");
    return { success: true };
  } catch (error: any) {
    console.error("[leaveConversationAction] failed:", error);
    return {
      success: false,
      error: error.message || "Failed to leave conversation",
    };
  }
}

export async function archiveConversationAction(
  conversationId: string,
  isArchived: boolean,
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();
    await conversationService.archiveConversation(
      conversationId,
      user.id,
      isArchived,
    );
    revalidatePath("/conversations");
    return { success: true };
  } catch (error: any) {
    console.error("[archiveConversationAction] failed:", error);
    return {
      success: false,
      error: error.message || "Failed to archive conversation",
    };
  }
}

export async function muteConversationAction(
  conversationId: string,
  isMuted: boolean,
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();
    await conversationService.muteConversation(
      conversationId,
      user.id,
      isMuted,
    );
    revalidatePath(`/conversations/${conversationId}`);
    return { success: true };
  } catch (error: any) {
    console.error("[muteConversationAction] failed:", error);
    return {
      success: false,
      error: error.message || "Failed to mute conversation",
    };
  }
}

export async function markAsReadAction(
  conversationId: string,
  messageId: string,
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();
    await conversationService.markAsRead(conversationId, user.id, messageId);
    return { success: true };
  } catch (error: any) {
    console.error("[markAsReadAction] failed:", error);
    return {
      success: false,
      error: error.message || "Failed to mark message as read",
    };
  }
}

export async function sendTypingAction(
  conversationId: string,
  isTyping: boolean,
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    // Security check: Verify user is active participant
    const db = getDatabase();
    const participant = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(schema.conversationParticipants.conversationId, conversationId),
        eq(schema.conversationParticipants.userId, user.id),
        eq(schema.conversationParticipants.isLeft, false),
      ),
    });

    if (!participant) {
      return { success: false, error: "Unauthorized" };
    }

    realtimeService.publish(`conversation:${conversationId}`, {
      type: "TYPING_STATUS",
      payload: {
        userId: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        isTyping,
      },
    });

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to send typing status",
    };
  }
}

export async function searchUsersAction(
  query: string,
): Promise<ActionResponse<any[]>> {
  try {
    await requireAuth();
    if (!query || query.length < 2) return { success: true, data: [] };

    const { searchService } = await import("@/services/search");
    const results = await searchService.executeSearch(query, {
      contentType: "users",
      perPage: 10,
    });

    const users = results.hits.map((h: any) => ({
      id: h.document.id,
      username: h.document.username,
      displayName: h.document.displayName,
      image: null,
    }));

    return { success: true, data: users };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
