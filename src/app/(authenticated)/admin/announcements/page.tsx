import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Megaphone, Plus, Calendar } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { canModerate } from "@/config/rbac";
import { auth } from "@/lib/auth";
import { announcementService } from "@/services/announcement";
import type { AnnouncementType } from "@/db/schema/announcements";

export const metadata: Metadata = {
  title: "Announcements",
};

const TYPE_VARIANT_MAP: Record<
  AnnouncementType,
  "info" | "warning" | "destructive" | "success"
> = {
  INFO: "info",
  WARNING: "warning",
  DANGER: "destructive",
  SUCCESS: "success",
};

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
    <div className="space-y-8">
      <PageHeader
        title="Announcements"
        description="Manage community announcements and broadcasts"
        icon={<Megaphone className="h-5 w-5" />}
        actions={
          <Button asChild>
            <a href="/admin/announcements/new">
              <Plus className="mr-2 h-4 w-4" />
              New Announcement
            </a>
          </Button>
        }
      />

      <SectionCard
        title="All Announcements"
        description={`${announcements.length} total`}
      >
        {announcements.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No announcements yet. Create your first announcement to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{announcement.title}</h3>
                    <Badge
                      variant={TYPE_VARIANT_MAP[announcement.type]}
                      size="sm"
                    >
                      {announcement.type}
                    </Badge>
                    <Badge
                      variant={announcement.isActive ? "success" : "secondary"}
                      size="sm"
                    >
                      {announcement.isActive ? "Active" : "Draft"}
                    </Badge>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {announcement.content}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {announcement.isPermanent ? (
                      <span>Permanent</span>
                    ) : announcement.startsAt && announcement.endsAt ? (
                      <span>
                        {announcement.startsAt.toLocaleDateString()} &ndash;{" "}
                        {announcement.endsAt.toLocaleDateString()}
                      </span>
                    ) : (
                      <span>No schedule</span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/admin/announcements/${announcement.id}`}>Edit</a>
                  </Button>
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
                      <Button variant="outline" size="sm" type="submit">
                        Unpublish
                      </Button>
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
                      <Button variant="default" size="sm" type="submit">
                        Publish
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
