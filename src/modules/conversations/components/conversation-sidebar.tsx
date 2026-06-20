"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useRealtime } from "@/hooks";
import { useAuth } from "@/hooks";
import { createConversationAction, searchUsersAction } from "../actions/conversations";
import type { ConversationWithDetails } from "../types";
import { Search, Plus, MessageSquare, Archive, BellOff } from "lucide-react";
import { Button } from "@/components/ui";

interface ConversationSidebarProps {
  initialConversations: ConversationWithDetails[];
}

export function ConversationSidebar({ initialConversations }: ConversationSidebarProps) {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const activeId = params.conversationId as string;

  const [conversations, setConversations] = useState<ConversationWithDetails[]>(initialConversations);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"PRIVATE" | "GROUP">("PRIVATE");
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [firstMessageText, setFirstMessageText] = useState("");
  const [isPending, startTransition] = useTransition();

  // Keep internal state in sync with server component props initial values
  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  // Realtime updates using SSE hook
  useRealtime(user?.id ? [`user:${user.id}`] : [], (event) => {
    if (event.type === "CONVERSATION_UPDATE") {
      const payload = event.payload as { conversationId: string; lastMessage: any; lastActivityAt: string };
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === payload.conversationId);
        if (index === -1) return prev;

        const updated = [...prev];
        const oldConv = updated[index];
        updated[index] = {
          ...oldConv,
          lastActivityAt: new Date(payload.lastActivityAt),
          lastMessage: payload.lastMessage,
          unread: oldConv.id !== activeId, // Unread if not currently viewing
        };
        // Re-sort descending by activity
        return updated.sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());
      });
    } else if (event.type === "CONVERSATION_NEW") {
      const payload = event.payload as { conversation: any };
      setConversations((prev) => {
        if (prev.some((c) => c.id === payload.conversation.id)) return prev;
        const newConv: ConversationWithDetails = {
          ...payload.conversation,
          isMuted: false,
          isArchived: false,
          lastReadMessageId: null,
          unread: payload.conversation.id !== activeId,
          participants: payload.conversation.participants || [],
        };
        return [newConv, ...prev].sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());
      });
    }
  });

  // Client-side search user autocomplete
  useEffect(() => {
    if (userSearchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await searchUsersAction(userSearchQuery);
      if (res.success && res.data) {
        // Exclude already selected users and self
        const filtered = res.data.filter(
          (u) => u.id !== user?.id && !selectedUsers.some((su) => su.id === u.id)
        );
        setSearchResults(filtered);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearchQuery, selectedUsers, user?.id]);

  const handleCreateConversation = () => {
    if (selectedUsers.length === 0 || !firstMessageText.trim()) return;

    startTransition(async () => {
      const contentJson = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: firstMessageText }],
          },
        ],
      };

      const res = await createConversationAction({
        title: newType === "GROUP" ? newTitle || undefined : undefined,
        type: newType,
        participantIds: selectedUsers.map((u) => u.id),
        firstMessageJson: contentJson,
      });

      if (res.success && res.data) {
        setIsNewModalOpen(false);
        setNewTitle("");
        setSelectedUsers([]);
        setFirstMessageText("");
        router.push(`/conversations/${res.data.id}`);
      } else {
        alert(res.error || "Failed to create conversation");
      }
    });
  };

  // Filter conversations based on tab and search query
  const filteredConversations = conversations.filter((c) => {
    const matchesTab = activeTab === "archived" ? c.isArchived : !c.isArchived;
    if (!matchesTab) return false;

    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const titleMatch = c.title?.toLowerCase().includes(query);
    const participantMatch = c.participants.some(
      (p) => p.displayName?.toLowerCase().includes(query) || p.username?.toLowerCase().includes(query)
    );
    return titleMatch || participantMatch;
  });

  const getConversationTitle = (c: ConversationWithDetails) => {
    if (c.title) return c.title;
    if (c.participants.length === 0) return "Direct Message";
    return c.participants.map((p) => p.displayName || p.username).join(", ");
  };

  const getRelativeTime = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="flex h-full w-full flex-col border-r bg-background md:w-80 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h1 className="text-xl font-bold tracking-tight">Conversations</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsNewModalOpen(true)} title="New Message">
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search PMs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border bg-muted/50 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 border-b text-center text-sm font-medium text-muted-foreground">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`py-2 focus:outline-none ${
            activeTab === "active" ? "border-b-2 border-primary text-foreground" : "hover:text-foreground"
          }`}
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("archived")}
          className={`py-2 focus:outline-none ${
            activeTab === "archived" ? "border-b-2 border-primary text-foreground" : "hover:text-foreground"
          }`}
        >
          Archived
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y">
        {filteredConversations.map((c) => (
          <Link
            key={c.id}
            href={`/conversations/${c.id}`}
            className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${
              c.id === activeId ? "bg-muted" : ""
            } ${c.unread ? "font-semibold" : ""}`}
          >
            {/* Avatar or Group Icon */}
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
              {c.type === "PRIVATE" ? (
                (c.participants[0]?.displayName || c.participants[0]?.username || "?").charAt(0).toUpperCase()
              ) : (
                <MessageSquare className="h-5 w-5" />
              )}
              {c.unread && (
                <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-primary border-2 border-background" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="truncate text-sm font-medium text-foreground">
                  {getConversationTitle(c)}
                </p>
                <span className="text-xs text-muted-foreground shrink-0">
                  {getRelativeTime(c.lastActivityAt)}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground mt-0.5">
                {c.lastMessage
                  ? `${c.lastMessage.sender?.displayName || c.lastMessage.sender?.username || "System"}: ${
                      typeof c.lastMessage.contentJson === "string"
                        ? c.lastMessage.contentJson
                        : (c.lastMessage.contentJson as any)?.content?.[0]?.content?.[0]?.text || "Sent attachment"
                    }`
                  : "No messages yet"}
              </p>
              <div className="flex gap-2 mt-1">
                {c.isMuted && <BellOff className="h-3.5 w-3.5 text-muted-foreground" />}
                {c.isArchived && <Archive className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
            </div>
          </Link>
        ))}

        {filteredConversations.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No conversations found
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="text-lg font-bold mb-4">New Conversation</h2>

            {/* Type Switcher */}
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="radio"
                  checked={newType === "PRIVATE"}
                  onChange={() => {
                    setNewType("PRIVATE");
                    setSelectedUsers([]);
                  }}
                  className="accent-primary"
                />
                Direct Message
              </label>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="radio"
                  checked={newType === "GROUP"}
                  onChange={() => setNewType("GROUP")}
                  className="accent-primary"
                />
                Group Chat
              </label>
            </div>

            {/* Title (Only for group chats) */}
            {newType === "GROUP" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Group Title (Optional)</label>
                <input
                  type="text"
                  placeholder="Marketing Team, SEO Project..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}

            {/* Recipient User lookup */}
            <div className="mb-4 relative">
              <label className="block text-sm font-medium mb-1">
                {newType === "PRIVATE" ? "Recipient" : "Participants"}
              </label>
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedUsers.map((u) => (
                    <span
                      key={u.id}
                      className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
                    >
                      {u.displayName || u.username}
                      <button
                        type="button"
                        onClick={() => setSelectedUsers((prev) => prev.filter((x) => x.id !== u.id))}
                        className="hover:text-red-500 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {(newType === "GROUP" || selectedUsers.length === 0) && (
                <input
                  type="text"
                  placeholder="Type username..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              )}

              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 z-10 mt-1 max-h-40 overflow-y-auto rounded-lg border bg-popover shadow-md divide-y">
                  {searchResults.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedUsers((prev) => [...prev, u]);
                        setUserSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                      {u.displayName || u.username} (@{u.username})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* First Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                placeholder="Write your first message..."
                value={firstMessageText}
                onChange={(e) => setFirstMessageText(e.target.value)}
                rows={3}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsNewModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateConversation}
                disabled={isPending || selectedUsers.length === 0 || !firstMessageText.trim()}
              >
                {isPending ? "Creating..." : "Start Chat"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ConversationSidebar;
