import { auth } from "@/lib/auth";
import { realtimeService } from "@/lib/realtime";
import { getDatabase, schema } from "@/db";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const channelsParam = searchParams.get("channels") || "";
  const requestedChannels = channelsParam.split(",").map(c => c.trim()).filter(Boolean);

  if (requestedChannels.length === 0) {
    return new Response("Channels required", { status: 400 });
  }

  const db = getDatabase();
  const userId = session.user.id;

  // Security checks: Validate that the user is authorized to subscribe to these channels
  for (const channel of requestedChannels) {
    if (channel.startsWith("user:")) {
      const targetUserId = channel.substring(5);
      if (targetUserId !== userId) {
        return new Response("Forbidden: Cannot subscribe to another user's channel", { status: 403 });
      }
    } else if (channel.startsWith("conversation:")) {
      const conversationId = channel.substring(13);
      // Verify user is active participant in this conversation
      const participant = await db.query.conversationParticipants.findFirst({
        where: and(
          eq(schema.conversationParticipants.conversationId, conversationId),
          eq(schema.conversationParticipants.userId, userId),
          eq(schema.conversationParticipants.isLeft, false)
        )
      });
      if (!participant) {
        return new Response("Forbidden: You are not a participant in this conversation", { status: 403 });
      }
    } else if (channel !== "global:notifications" && channel !== "global:announcements") {
      // Allow global notifications/announcements but reject any other channel type
      return new Response("Forbidden: Invalid channel", { status: 403 });
    }
  }

  // Setup SSE readable stream
  const responseStream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Helper to write event
      const sendEvent = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          // Client might have disconnected
        }
      };

      // Send connection established event
      sendEvent({ type: "CONNECTED", payload: { channels: requestedChannels } });

      // Keep connection alive with periodic pings (every 15s)
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          // Cleanup handled below
        }
      }, 15000);

      // Subscribe to all channels
      const unsubscribers = requestedChannels.map(channel => {
        return realtimeService.subscribe(channel, (message) => {
          sendEvent({ channel, ...message });
        });
      });

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        unsubscribers.forEach(unsub => unsub());
        try {
          controller.close();
        } catch {}
      });
    }
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
export default GET;
