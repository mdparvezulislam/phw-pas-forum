"use client";

import { useState } from "react";
import { sendOrderMessageAction } from "@/actions";
import type { OrderMessage, User } from "@/db/schema";

interface MessageWithSender extends OrderMessage {
  sender: User;
}

export function OrderChat({
  orderId,
  userId,
  messages,
}: {
  orderId: string;
  userId: string;
  messages: MessageWithSender[];
}) {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await sendOrderMessageAction({
        orderId,
        contentJson: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: newMessage }],
            },
          ],
        },
      });
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
    setSending(false);
  };

  return (
    <div className="flex h-80 flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.senderId === userId
                  ? "bg-primary text-primary-foreground"
                  : msg.isSystem
                    ? "bg-muted text-muted-foreground italic"
                    : "bg-muted"
              }`}
            >
              {!msg.isSystem && msg.senderId !== userId && (
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  {msg.sender.displayName ?? msg.sender.username}
                </p>
              )}
              {msg.contentJson &&
              typeof msg.contentJson === "object" &&
              "content" in (msg as any).contentJson ? (
                <p>
                  {(msg as any).contentJson.content?.[0]?.content?.[0]?.text ??
                    "Message"}
                </p>
              ) : (
                <p>Message</p>
              )}
              <p className="mt-1 text-[10px] opacity-70">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t p-3">
        <div className="flex gap-2">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
