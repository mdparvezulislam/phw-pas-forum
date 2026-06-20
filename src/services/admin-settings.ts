import "server-only";

import { and, eq } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import { auditService } from "@/services/audit";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";

export class AdminSettingsService {
  async getSetting(key: string) {
    const db = getDatabase();
    return db.query.systemSettings.findFirst({
      where: eq(schema.systemSettings.key, key),
    });
  }

  async getSettingsByCategory(category: string) {
    const db = getDatabase();
    return db.query.systemSettings.findMany({
      where: eq(schema.systemSettings.category, category),
    });
  }

  async getAllSettings() {
    const db = getDatabase();
    return db.query.systemSettings.findMany({
      orderBy: (s, { asc }) => [asc(s.category), asc(s.key)],
    });
  }

  async setSetting(params: {
    key: string;
    value: unknown;
    category: string;
    description?: string;
    isEncrypted?: boolean;
    userId: string;
  }) {
    const db = getDatabase();

    const existing = await db.query.systemSettings.findFirst({
      where: eq(schema.systemSettings.key, params.key),
    });

    if (existing) {
      await db
        .update(schema.systemSettings)
        .set({
          value: params.value as Record<string, unknown>,
          description: params.description ?? existing.description,
          updatedAt: new Date(),
        })
        .where(eq(schema.systemSettings.key, params.key));
    } else {
      await db.insert(schema.systemSettings).values({
        key: params.key,
        value: params.value as Record<string, unknown>,
        category: params.category,
        description: params.description ?? null,
        isEncrypted: params.isEncrypted ?? false,
      });
    }

    await auditService.log(params.userId, AUDIT_ACTIONS.ADMIN_SETTINGS_UPDATE, {
      resource: "settings",
      resourceId: params.key,
      metadata: { category: params.category },
    });
  }

  // Feature Flags
  async getFeatureFlags() {
    const db = getDatabase();
    return db.query.featureFlags.findMany({
      orderBy: (f, { asc }) => [asc(f.key)],
    });
  }

  async getFeatureFlag(key: string) {
    const db = getDatabase();
    return db.query.featureFlags.findFirst({
      where: eq(schema.featureFlags.key, key),
    });
  }

  async isFeatureEnabled(key: string): Promise<boolean> {
    const db = getDatabase();
    const flag = await db.query.featureFlags.findFirst({
      where: eq(schema.featureFlags.key, key),
    });
    return flag?.enabled ?? false;
  }

  async createFeatureFlag(params: {
    key: string;
    name: string;
    description?: string;
    enabled?: boolean;
    isKillSwitch?: boolean;
    userId: string;
  }) {
    const db = getDatabase();

    const [flag] = await db
      .insert(schema.featureFlags)
      .values({
        key: params.key,
        name: params.name,
        description: params.description ?? null,
        enabled: params.enabled ?? false,
        isKillSwitch: params.isKillSwitch ?? false,
      })
      .returning();

    await auditService.log(params.userId, AUDIT_ACTIONS.FEATURE_FLAG_CREATED, {
      resource: "feature_flag",
      resourceId: flag.id,
      metadata: { key: params.key, name: params.name },
    });

    return flag;
  }

  async toggleFeatureFlag(flagId: string, enabled: boolean, userId: string) {
    const db = getDatabase();

    await db
      .update(schema.featureFlags)
      .set({ enabled, updatedAt: new Date() })
      .where(eq(schema.featureFlags.id, flagId));

    await auditService.log(userId, AUDIT_ACTIONS.FEATURE_FLAG_TOGGLED, {
      resource: "feature_flag",
      resourceId: flagId,
      metadata: { enabled },
    });
  }

  async deleteFeatureFlag(flagId: string, userId: string) {
    const db = getDatabase();

    const flag = await db.query.featureFlags.findFirst({
      where: eq(schema.featureFlags.id, flagId),
    });

    await db.delete(schema.featureFlags).where(eq(schema.featureFlags.id, flagId));

    await auditService.log(userId, AUDIT_ACTIONS.FEATURE_FLAG_DELETED, {
      resource: "feature_flag",
      resourceId: flagId,
      metadata: { key: flag?.key },
    });
  }
}

export const adminSettingsService = new AdminSettingsService();
