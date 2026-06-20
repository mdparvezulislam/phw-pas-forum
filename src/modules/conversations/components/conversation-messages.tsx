"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRealtime } from "@/hooks";
import { markAsReadAction } from "../actions/conversations";
import { ConversationMessage } from "./conversation-message";

interface Message {
  id: string;
  senderId: string;
  contentJson: any;
  hasAttachments: boolean;
  isEdited: boolean;
  editedAt: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  sender: {
    id: string;
    username: string | null;
    displayName: string | null;
    image: string | null;
  };
  attachments: {
    id: string;
    fileName: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    url: string;
  }[];
  readReceipts: {
    userId: string;
    username: string | null;
    displayName: string | null;
    readAt: Date;
  }[];
}

interface ConversationMessagesProps {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
}

export function ConversationMessages({
  conversationId,
  initialMessages,
  currentUserId,
}: ConversationMessagesProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [typingUsers, setTypingUsers] = useState<Record<string, { name: string; expiresAt: number }>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [_, startTransition] = useTransition();

  // Scroll to bottom on mount or when messages change
  const scrollToBottom = (behavior: "smooth" | "instant" = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    setMessages(initialMessages);
    scrollToBottom("instant");

    // Mark latest message as read on load
    if (initialMessages.length > 0) {
      const latestMsg = initialMessages[initialMessages.length - 1];
      if (latestMsg.senderId !== currentUserId) {
        startTransition(async () => {
          await markAsReadAction(conversationId, latestMsg.id);
        });
      }
    }
  }, [initialMessages, conversationId, currentUserId]);

  // Clean up typing status interval on unmount
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers((prev) => {
        const now = Date.now();
        const updated = { ...prev };
        let changed = false;

        for (const [userId, data] of Object.entries(updated)) {
          if (data.expiresAt < now) {
            delete updated[userId];
            changed = true;
          }
        }
        return changed ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen to realtime conversation events
  useRealtime([`conversation:${conversationId}`], (event) => {
    if (event.type === "MESSAGE_NEW") {
      const payload = event.payload as any;
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        return [...prev, {
          ...payload,
          createdAt: new Date(payload.createdAt),
          editedAt: payload.editedAt ? new Date(payload.editedAt) : null,
          readReceipts: payload.readReceipts.map((r: any) => ({ ...r, readAt: new Date(r.readAt) })),
        }];
      });

      // Remove typing indicator if sender was typing
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[payload.senderId];
        return updated;
      });

      // Auto scroll to bottom
      setTimeout(() => scrollToBottom("smooth"), 50);

      // Auto mark as read if user is looking at this page
      if (payload.senderId !== currentUserId) {
        startTransition(async () => {
          await markAsReadAction(conversationId, payload.id);
        });
      }
    } else if (event.type === "MESSAGE_EDIT") {
      const payload = event.payload as { messageId: string; contentJson: any; isEdited: boolean; editedAt: string };
      setMessages((prev) =>
        prev.map((m) =>
          m.id === payload.messageId
            ? {
                ...m,
                contentJson: payload.contentJson,
                isEdited: payload.isEdited,
                editedAt: payload.editedAt ? new Date(payload.editedAt) : null,
              }
            : m
        )
      );
    } else if (event.type === "MESSAGE_DELETE") {
      const payload = event.payload as { messageId: string };
      setMessages((prev) =>
        prev.map((m) =>
          m.id === payload.messageId
            ? {
                ...m,
                isDeleted: true,
                contentJson: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "This message was deleted." }] }] },
                attachments: [],
              }
            : m
        )
      );
    } else if (event.type === "READ_RECEIPT") {
      const payload = event.payload as { messageId: string; userId: string; displayName: string; readAt: string };
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== payload.messageId) return m;
          // Avoid duplicate read receipts in list
          if (m.readReceipts.some((r) => r.userId === payload.userId)) return m;
          return {
            ...m,
            readReceipts: [
              ...m.readReceipts,
              {
                userId: payload.userId,
                username: null,
                displayName: payload.displayName,
                readAt: new Date(payload.readAt),
              },
            ],
          };
        })
      );
    } else if (event.type === "TYPING_STATUS") {
      const payload = event.payload as { userId: string; username: string; displayName: string; isTyping: boolean };
      if (payload.userId === currentUserId) return;

      setTypingUsers((prev) => {
        const updated = { ...prev };
        if (payload.isTyping) {
          updated[payload.userId] = {
            name: payload.displayName || payload.username,
            expiresAt: Date.now() + 3500, // Expire after 3.5s of inactivity
          };
        } else {
          delete updated[payload.userId];
        }
        return updated;
      });
    }
  });

  const getTypingText = () => {
    const users = Object.values(typingUsers);
    if (users.length === 0) return "";
    if (users.length === 1) return `${users[0].name} is typing...`;
    if (users.length === 2) return `${users[0].name} and ${users[1].name} are typing...`;
    return "Several people are typing...";
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Scrollable Messages Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {messages.map((message) => (
          <ConversationMessage
            key={message.id}
            message={message}
            currentUserId={currentUserId}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicators & Info status */}
      {Object.keys(typingUsers).length > 0 && (
        <div className="px-4 py-1.5 text-xs text-muted-foreground italic bg-background/95">
          {getTypingText()}
        </div>
      )}
    </div>
  );
}
export default ConversationMessages;
