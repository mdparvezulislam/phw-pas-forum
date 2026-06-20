import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDatabase, schema } from "@/db";
import { eq, and, ne } from "drizzle-orm";
import { conversationService } from "@/services/conversation";
import {
  ConversationHeader,
  ConversationMessages,
  MessageComposer,
} from "@/modules/conversations/components";

interface ConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ConversationDetailPage({ params }: ConversationPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { conversationId } = await params;
  const userId = session.user.id;

  const db = getDatabase();

  // 1. Fetch participation details to verify membership
  const participation = await db.query.conversationParticipants.findFirst({
    where: and(
      eq(schema.conversationParticipants.conversationId, conversationId),
      eq(schema.conversationParticipants.userId, userId),
      eq(schema.conversationParticipants.isLeft, false)
    ),
    with: {
      conversation: true,
    },
  });

  if (!participation || !participation.conversation) {
    notFound();
  }

  // 2. Fetch conversation messages
  const messageResult = await conversationService.getMessages(conversationId, userId, {
    limit: 50,
  });

  // 3. Fetch active participants
  const participantRecords = await db.query.conversationParticipants.findMany({
    where: and(
      eq(schema.conversationParticipants.conversationId, conversationId),
      eq(schema.conversationParticipants.isLeft, false)
    ),
    with: {
      user: {
        columns: { id: true, username: true, displayName: true, image: true },
      },
    },
  });

  const participantsList = participantRecords.map((r) => r.user);

  // 4. Determine title
  const otherParticipants = participantsList.filter((p) => p.id !== userId);
  const conversationTitle = participation.conversation.title
    ? participation.conversation.title
    : otherParticipants.map((p) => p.displayName || p.username).join(", ") || "Direct Message";

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Chat Room Header */}
      <ConversationHeader
        conversationId={conversationId}
        title={conversationTitle}
        type={participation.conversation.type}
        participants={participantsList as any}
        isMuted={participation.isMuted}
        isArchived={participation.isArchived}
      />

      {/* Messages List Stream */}
      <ConversationMessages
        conversationId={conversationId}
        initialMessages={messageResult.items as any}
        currentUserId={userId}
      />

      {/* Chat Room Composer Footer */}
      <MessageComposer conversationId={conversationId} />
    </div>
  );
}
