import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { conversationService } from "@/services/conversation";
import { ConversationSidebar } from "@/modules/conversations/components";

export default async function ConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch initial active conversations
  const result = await conversationService.getConversations(session.user.id, {
    isArchived: false,
    limit: 50,
  });

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-lg border bg-card shadow-sm">
      <ConversationSidebar initialConversations={result.items as any} />
      <div className="flex flex-1 flex-col overflow-hidden bg-background">
        {children}
      </div>
    </div>
  );
}
