import "server-only";

import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import type {
  Announcement,
  AnnouncementType,
  NewAnnouncement,
} from "@/db/schema/announcements";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { auditService } from "./audit";

class AnnouncementService {
  async getAnnouncements(options?: {
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Announcement[]> {
    const db = getDatabase();
    const conditions: any[] = [];

    if (options?.isActive !== undefined) {
      conditions.push(eq(schema.announcements.isActive, options.isActive));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    return db.query.announcements.findMany({
      where,
      orderBy: [desc(schema.announcements.createdAt)],
      limit: options?.limit ?? 50,
      offset: options?.offset ?? 0,
    }) as Promise<Announcement[]>;
  }

  async getActiveAnnouncements(): Promise<Announcement[]> {
    const db = getDatabase();
    const now = new Date();

    return db.query.announcements.findMany({
      where: (a, { and, eq, gte: gteFn, lte: lteFn }) =>
        and(
          eq(a.isActive, true),
          and(gteFn(a.startsAt, now), lteFn(a.endsAt, now)),
        ),
      orderBy: [desc(schema.announcements.createdAt)],
    }) as Promise<Announcement[]>;
  }

  async getCurrentAnnouncement(): Promise<Announcement | null> {
    const db = getDatabase();
    const now = new Date();

    const announcement = await db.query.announcements.findFirst({
      where: (a, { and, eq, or, isNull }) =>
        and(
          eq(a.isActive, true),
          or(
            and(gte(a.startsAt, now), lte(a.endsAt, now)),
            and(eq(a.isPermanent, true), isNull(a.startsAt), isNull(a.endsAt)),
          ),
        ),
      orderBy: [desc(schema.announcements.createdAt)],
    });

    return announcement as Announcement | null;
  }

  async createAnnouncement(
    data: Omit<NewAnnouncement, "id" | "createdAt" | "updatedAt">,
    userId: string,
  ): Promise<Announcement> {
    const db = getDatabase();

    const [announcement] = await db
      .insert(schema.announcements)
      .values({
        ...data,
        createdBy: userId,
      })
      .returning();

    await auditService.log(userId, "announcement:created", {
      resource: "announcement",
      resourceId: announcement.id,
      metadata: { title: announcement.title, type: announcement.type },
    });

    return announcement;
  }

  async updateAnnouncement(
    id: string,
    data: Partial<NewAnnouncement>,
    userId: string,
  ): Promise<Announcement> {
    const db = getDatabase();

    const [announcement] = await db
      .update(schema.announcements)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.announcements.id, id))
      .returning();

    await auditService.log(userId, "announcement:updated", {
      resource: "announcement",
      resourceId: announcement.id,
      metadata: { title: announcement.title, type: announcement.type },
    });

    return announcement;
  }

  async deleteAnnouncement(id: string, userId: string): Promise<void> {
    const db = getDatabase();

    await db
      .delete(schema.announcements)
      .where(eq(schema.announcements.id, id));

    await auditService.log(userId, "announcement:deleted", {
      resource: "announcement",
      resourceId: id,
    });
  }

  async publishAnnouncement(id: string, userId: string): Promise<Announcement> {
    const db = getDatabase();

    const [announcement] = await db
      .update(schema.announcements)
      .set({
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.announcements.id, id))
      .returning();

    await auditService.log(userId, "announcement:published", {
      resource: "announcement",
      resourceId: announcement.id,
      metadata: { title: announcement.title, type: announcement.type },
    });

    return announcement;
  }

  async unpublishAnnouncement(
    id: string,
    userId: string,
  ): Promise<Announcement> {
    const db = getDatabase();

    const [announcement] = await db
      .update(schema.announcements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(schema.announcements.id, id))
      .returning();

    await auditService.log(userId, "announcement:unpublished", {
      resource: "announcement",
      resourceId: announcement.id,
      metadata: { title: announcement.title, type: announcement.type },
    });

    return announcement;
  }
}

export const announcementService = new AnnouncementService();
