import "server-only";

import { getDatabase, schema } from "@/db";
import { and, desc, eq } from "drizzle-orm";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";

export interface SuspiciousLoginCheckResult {
  isSuspicious: boolean;
  reasons: string[];
}

export class SuspiciousLoginDetector {
  /**
   * Evaluates current login details against the user's previous 15 successful login logs.
   */
  async checkLogin(
    userId: string,
    currentIp: string,
    currentUserAgent: string,
  ): Promise<SuspiciousLoginCheckResult> {
    const db = getDatabase();

    // Fetch historical successful login events
    const history = await db.query.auditLogs.findMany({
      where: and(
        eq(schema.auditLogs.userId, userId),
        eq(schema.auditLogs.action, AUDIT_ACTIONS.LOGIN),
      ),
      orderBy: [desc(schema.auditLogs.createdAt)],
      limit: 15,
    });

    // If first-ever login, it is not flagged as suspicious yet
    if (history.length === 0) {
      return { isSuspicious: false, reasons: [] };
    }

    const reasons: string[] = [];

    // 1. IP Check (Strict match & Class C subnet match)
    const knownIps = new Set(
      history.map((log) => log.ipAddress).filter(Boolean),
    );
    const ipMatch = knownIps.has(currentIp);

    let subnetMatch = false;
    const getSubnet = (ip: string) => {
      const parts = ip.split(".");
      return parts.length === 4 ? `${parts[0]}.${parts[1]}.${parts[2]}` : ip;
    };

    const currentSubnet = getSubnet(currentIp);
    for (const ip of knownIps) {
      if (getSubnet(ip!) === currentSubnet) {
        subnetMatch = true;
        break;
      }
    }

    // 2. User Agent Check (Strict match & OS/Browser parser match)
    const knownUserAgents = new Set(
      history.map((log) => log.userAgent).filter(Boolean),
    );
    const uaMatch = knownUserAgents.has(currentUserAgent);

    // Simple OS/Browser heuristics
    const getPlatform = (ua: string) => {
      if (ua.includes("Windows")) return "Windows";
      if (ua.includes("Macintosh") || ua.includes("Mac OS")) return "macOS";
      if (ua.includes("Linux")) return "Linux";
      if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
      if (ua.includes("Android")) return "Android";
      return "Unknown";
    };

    const currentPlatform = getPlatform(currentUserAgent);
    let platformMatch = false;
    for (const ua of knownUserAgents) {
      if (getPlatform(ua!) === currentPlatform) {
        platformMatch = true;
        break;
      }
    }

    if (!ipMatch && !subnetMatch) {
      reasons.push(
        `Login from an unrecognized location / IP subnet: ${currentIp}`,
      );
    }

    if (!uaMatch && !platformMatch) {
      reasons.push(
        `Login from an unrecognized OS platform: ${currentPlatform}`,
      );
    }

    const isSuspicious = reasons.length >= 2; // Flag if both IP subnet AND OS/browser are unfamiliar

    // Log suspicious activity
    if (isSuspicious) {
      await db.insert(schema.auditLogs).values({
        userId,
        action: "security:suspicious_login",
        resource: "user",
        resourceId: userId,
        ipAddress: currentIp,
        userAgent: currentUserAgent,
        metadata: {
          reasons,
          currentIp,
          currentUserAgent,
          knownIpsCount: knownIps.size,
        },
      });
    }

    return {
      isSuspicious,
      reasons,
    };
  }
}

export const suspiciousLoginDetector = new SuspiciousLoginDetector();
export default suspiciousLoginDetector;
