"use client";

import { usePathname } from "next/navigation";
import { ConversationSidebar } from "@/modules/conversations/components";
import { cn } from "@/lib/utils";

interface ConversationsResponsiveWrapperProps {
  initialConversations: any[];
  children: React.ReactNode;
}

export function ConversationsResponsiveWrapper({
  initialConversations,
  children,
}: ConversationsResponsiveWrapperProps) {
  const pathname = usePathname();
  // Check if a specific conversation ID route is active
  const isChatRoomActive = pathname !== "/conversations";

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-lg border bg-card shadow-sm w-full">
      {/* Conversations List Pane */}
      <div
        className={cn(
          "w-full md:w-80 shrink-0 border-r md:block",
          isChatRoomActive ? "hidden" : "block",
        )}
      >
        <ConversationSidebar initialConversations={initialConversations} />
      </div>

      {/* Chat Room Detail Pane */}
      <div
        className={cn(
          "flex-1 flex flex-col overflow-hidden bg-background md:block",
          isChatRoomActive ? "block" : "hidden",
        )}
      >
        {children}
      </div>
    </div>
  );
}
