import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canModerate } from "@/config/rbac";
import { announcementService } from "@/services/announcement";

export default async function AdminAnnouncementsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = session.user;
  if (!canModerate(user)) {
    redirect("/forums");
  }

  const announcements = await announcementService.getAnnouncements();

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-muted-foreground mt-1">
            Manage community announcements
          </p>
        </div>
        <a
          href="/admin/announcements/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          New Announcement
        </a>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`border rounded-lg p-4 ${
                announcement.isActive ? "border-green-500" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{announcement.title}</h3>
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        announcement.type === "DANGER"
                          ? "bg-red-100 text-red-800"
                          : announcement.type === "WARNING"
                            ? "bg-yellow-100 text-yellow-800"
                            : announcement.type === "SUCCESS"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {announcement.type}
                    </span>
                    {!announcement.isActive && (
                      <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-800">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {announcement.isPermanent
                      ? "Permanent"
                      : announcement.startsAt && announcement.endsAt
                        ? `${announcement.startsAt.toLocaleDateString()} - ${announcement.endsAt.toLocaleDateString()}`
                        : "No schedule"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/admin/announcements/${announcement.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit
                  </a>
                  {announcement.isActive ? (
                    <form
                      action={async () => {
                        "use server";
                        await announcementService.unpublishAnnouncement(
                          announcement.id,
                          session.user.id,
                        );
                      }}
                    >
                      <button
                        type="submit"
                        className="text-sm text-yellow-600 hover:underline"
                      >
                        Unpublish
                      </button>
                    </form>
                  ) : (
                    <form
                      action={async () => {
                        "use server";
                        await announcementService.publishAnnouncement(
                          announcement.id,
                          session.user.id,
                        );
                      }}
                    >
                      <button
                        type="submit"
                        className="text-sm text-green-600 hover:underline"
                      >
                        Publish
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
