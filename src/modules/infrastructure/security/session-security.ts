import "server-only";

import { cache } from "@/lib/redis";
import { getDatabase, schema } from "@/db";
import { eq } from "drizzle-orm";

export class SessionSecurityService {
  private getRedisClient() {
    return (cache as any).client;
  }

  /**
   * Blacklist a session token (revocation list).
   */
  async revokeSession(
    sessionToken: string,
    expirySeconds = 86400 * 30,
  ): Promise<void> {
    // 1. Delete from database next-auth session table
    try {
      const db = getDatabase();
      await db
        .delete(schema.sessions)
        .where(eq(schema.sessions.sessionToken, sessionToken));
    } catch (dbError) {
      console.error(
        "[SessionSecurity] Failed to delete session from DB:",
        dbError,
      );
    }

    // 2. Put into Redis blacklist
    const client = this.getRedisClient();
    if (!client) return;

    try {
      const key = `session:blacklist:${sessionToken}`;
      await client.set(key, "revoked", "EX", expirySeconds);
    } catch (redisError) {
      console.error(
        "[SessionSecurity] Failed to blacklist session in Redis:",
        redisError,
      );
    }
  }

  /**
   * Check if a session token is blacklisted.
   */
  async isSessionRevoked(sessionToken: string): Promise<boolean> {
    const client = this.getRedisClient();
    if (!client) return false;

    try {
      const key = `session:blacklist:${sessionToken}`;
      const status = await client.get(key);
      return status === "revoked";
    } catch {
      return false; // Fallback to allowing in case Redis fails
    }
  }

  /**
   * Revoke all active sessions for a specific user.
   */
  async revokeAllUserSessions(userId: string): Promise<void> {
    const db = getDatabase();

    try {
      // Find all session tokens
      const activeSessions = await db
        .select({ token: schema.sessions.sessionToken })
        .from(schema.sessions)
        .where(eq(schema.sessions.userId, userId));

      // Revoke in DB
      await db
        .delete(schema.sessions)
        .where(eq(schema.sessions.userId, userId));

      // Blacklist in Redis
      for (const sess of activeSessions) {
        await this.revokeSession(sess.token);
      }
    } catch (error) {
      console.error(
        "[SessionSecurity] Failed to revoke all sessions for user:",
        userId,
        error,
      );
    }
  }
}

export const sessionSecurityService = new SessionSecurityService();
export default sessionSecurityService;
