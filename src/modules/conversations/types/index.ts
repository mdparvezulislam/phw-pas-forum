import type { Conversation, ConversationMessage } from "@/db/schema";

export interface ConversationWithDetails extends Conversation {
  isMuted: boolean;
  isArchived: boolean;
  lastReadMessageId: string | null;
  unread: boolean;
  lastMessage:
    | (ConversationMessage & {
        sender: {
          id: string;
          username: string | null;
          displayName: string | null;
        } | null;
      })
    | null;
  participants: {
    id: string;
    username: string | null;
    displayName: string | null;
    image: string | null;
  }[];
}
