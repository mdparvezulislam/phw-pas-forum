"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  archiveConversationAction,
  muteConversationAction,
  leaveConversationAction,
  addParticipantAction,
  searchUsersAction,
} from "../actions/conversations";
import { Button } from "@/components/ui";
import { Users, Bell, BellOff, Archive, LogOut, Plus, X } from "lucide-react";

interface Participant {
  id: string;
  username: string | null;
  displayName: string | null;
  image: string | null;
}

interface ConversationHeaderProps {
  conversationId: string;
  title: string;
  type: string;
  participants: Participant[];
  isMuted: boolean;
  isArchived: boolean;
}

export function ConversationHeader({
  conversationId,
  title,
  type,
  participants,
  isMuted,
  isArchived,
}: ConversationHeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Toggle Mute
  const handleToggleMute = () => {
    startTransition(async () => {
      const res = await muteConversationAction(conversationId, !isMuted);
      if (res.success) {
        router.refresh();
      }
    });
  };

  // Toggle Archive
  const handleToggleArchive = () => {
    startTransition(async () => {
      const res = await archiveConversationAction(conversationId, !isArchived);
      if (res.success) {
        router.refresh();
      }
    });
  };

  // Leave Conversation
  const handleLeave = () => {
    if (!confirm("Are you sure you want to leave this conversation?")) return;

    startTransition(async () => {
      const res = await leaveConversationAction(conversationId);
      if (res.success) {
        router.push("/conversations");
      }
    });
  };

  // Autocomplete for adding participant
  useEffect(() => {
    if (userSearchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await searchUsersAction(userSearchQuery);
      if (res.success && res.data) {
        // Exclude current participants
        const filtered = res.data.filter(
          (u) => !participants.some((p) => p.id === u.id)
        );
        setSearchResults(filtered);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearchQuery, participants]);

  const handleAddParticipant = (userId: string) => {
    startTransition(async () => {
      const res = await addParticipantAction(conversationId, userId);
      if (res.success) {
        setIsInviteOpen(false);
        setUserSearchQuery("");
        setSearchResults([]);
        router.refresh();
      } else {
        alert(res.error || "Failed to add participant");
      }
    });
  };

  return (
    <div className="flex items-center justify-between border-b px-6 py-3 bg-card shrink-0">
      {/* Title & Participants */}
      <div className="min-w-0">
        <h2 className="text-base font-bold truncate text-foreground">{title}</h2>
        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span className="truncate">
            {participants.map((p) => p.displayName || p.username).join(", ")}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        {type === "GROUP" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsInviteOpen(true)}
            title="Add Person"
            disabled={isPending}
          >
            <Plus className="h-4.5 w-4.5" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleMute}
          title={isMuted ? "Unmute" : "Mute"}
          disabled={isPending}
        >
          {isMuted ? (
            <BellOff className="h-4.5 w-4.5 text-muted-foreground" />
          ) : (
            <Bell className="h-4.5 w-4.5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleArchive}
          title={isArchived ? "Unarchive" : "Archive"}
          disabled={isPending}
        >
          <Archive className={`h-4.5 w-4.5 ${isArchived ? "text-primary" : ""}`} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLeave}
          title="Leave Chat"
          className="text-destructive hover:bg-destructive/10"
          disabled={isPending}
        >
          <LogOut className="h-4.5 w-4.5" />
        </Button>
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg relative">
            <button
              type="button"
              onClick={() => setIsInviteOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">Add Participant</h2>

            <div className="mb-6 relative">
              <input
                type="text"
                placeholder="Search username to invite..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />

              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 z-10 mt-1 max-h-40 overflow-y-auto rounded-lg border bg-popover shadow-md divide-y">
                  {searchResults.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleAddParticipant(u.id)}
                      className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-muted font-medium"
                    >
                      {u.displayName || u.username} (@{u.username})
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setIsInviteOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ConversationHeader;
