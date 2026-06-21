import { auth } from "@/lib/auth";
import { notificationService } from "@/services/notification";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  const [unreadCount, notifications] = await Promise.all([
    notificationService.getUnreadCount(userId),
    notificationService.getNotifications(userId, { limit: 10, isRead: false }),
  ]);

  return Response.json({
    unreadCount,
    notifications,
  });
}
