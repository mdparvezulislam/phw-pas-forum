import "server-only";
import { redisService } from "@/modules/performance/cache/redis-service";
import { logger } from "@/lib/logger";
import { getEnv } from "@/validations/env";

type AlertSeverity = "critical" | "warning" | "info";
type AlertChannel = "slack" | "email" | "webhook" | "log";

interface AlertRule {
  name: string;
  description: string;
  severity: AlertSeverity;
  channels: AlertChannel[];
  threshold: number;
  windowMs: number;
  cooldownMs: number;
  check: () => Promise<{ triggered: boolean; value: number; message: string }>;
}

interface AlertEvent {
  id: string;
  ruleName: string;
  severity: AlertSeverity;
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
  acknowledged: boolean;
}

class AlertingService {
  private rules: AlertRule[] = [];
  private cooldowns: Map<string, number> = new Map();
  private alertHistory: AlertEvent[] = [];
  private maxHistorySize = 1000;

  registerRule(rule: AlertRule): void {
    this.rules.push(rule);
    logger.info("[Alerting] Rule registered", {
      rule: rule.name,
      severity: rule.severity,
    });
  }

  registerDefaultRules(): void {
    this.registerRule({
      name: "database_down",
      description: "Database is unreachable",
      severity: "critical",
      channels: ["slack", "email"],
      threshold: 0,
      windowMs: 60000,
      cooldownMs: 300000,
      check: async () => {
        try {
          const { getDatabase } = await import("@/db");
          const db = getDatabase();
          await db.execute("SELECT 1");
          return { triggered: false, value: 0, message: "Database is healthy" };
        } catch (err) {
          return {
            triggered: true,
            value: 1,
            message: `Database unreachable: ${(err as Error).message}`,
          };
        }
      },
    });

    this.registerRule({
      name: "redis_down",
      description: "Redis is unreachable",
      severity: "critical",
      channels: ["slack", "email"],
      threshold: 0,
      windowMs: 60000,
      cooldownMs: 300000,
      check: async () => {
        const health = await redisService.getCacheHealth();
        return {
          triggered: !health.connected,
          value: health.connected ? 0 : 1,
          message: health.connected
            ? "Redis is healthy"
            : "Redis is disconnected",
        };
      },
    });

    this.registerRule({
      name: "high_error_rate",
      description: "Error rate exceeds threshold",
      severity: "warning",
      channels: ["slack"],
      threshold: 0.05,
      windowMs: 300000,
      cooldownMs: 600000,
      check: async () => {
        const errorRate =
          (await redisService.get<number>("monitoring:error_rate")) ?? 0;
        return {
          triggered: errorRate > 0.05,
          value: errorRate,
          message: `Error rate: ${(errorRate * 100).toFixed(1)}% (threshold: 5%)`,
        };
      },
    });

    this.registerRule({
      name: "queue_failure",
      description: "Queue failure rate is high",
      severity: "warning",
      channels: ["slack"],
      threshold: 50,
      windowMs: 300000,
      cooldownMs: 600000,
      check: async () => {
        const { queueService } = await import("@/modules/performance/queue");
        const metrics = await queueService.getAllQueueMetrics();
        let totalFailed = 0;
        for (const [, m] of Object.entries(metrics)) {
          totalFailed += m.failed;
        }
        return {
          triggered: totalFailed > 50,
          value: totalFailed,
          message: `Total failed jobs across all queues: ${totalFailed}`,
        };
      },
    });

    this.registerRule({
      name: "search_down",
      description: "Typesense search is unavailable",
      severity: "warning",
      channels: ["slack"],
      threshold: 0,
      windowMs: 120000,
      cooldownMs: 600000,
      check: async () => {
        try {
          const { search } = await import("@/lib/typesense");
          const healthy = await search.health();
          return {
            triggered: !healthy,
            value: healthy ? 0 : 1,
            message: healthy ? "Search is healthy" : "Search is unavailable",
          };
        } catch (err) {
          return {
            triggered: true,
            value: 1,
            message: `Search error: ${(err as Error).message}`,
          };
        }
      },
    });

    this.registerRule({
      name: "security_incident",
      description: "Security events detected",
      severity: "critical",
      channels: ["slack", "email"],
      threshold: 5,
      windowMs: 3600000,
      cooldownMs: 600000,
      check: async () => {
        const count =
          (await redisService.get<number>(
            "monitoring:security_events_hourly",
          )) ?? 0;
        return {
          triggered: count > 5,
          value: count,
          message: `Security events in last hour: ${count}`,
        };
      },
    });

    this.registerRule({
      name: "ai_failure",
      description: "AI provider failures detected",
      severity: "warning",
      channels: ["slack"],
      threshold: 10,
      windowMs: 300000,
      cooldownMs: 600000,
      check: async () => {
        const failures =
          (await redisService.get<number>("monitoring:ai_failures")) ?? 0;
        return {
          triggered: failures > 10,
          value: failures,
          message: `AI failures: ${failures}`,
        };
      },
    });

    this.registerRule({
      name: "storage_failure",
      description: "Storage (R2) access failures",
      severity: "warning",
      channels: ["slack"],
      threshold: 5,
      windowMs: 300000,
      cooldownMs: 600000,
      check: async () => {
        const failures =
          (await redisService.get<number>("monitoring:storage_failures")) ?? 0;
        return {
          triggered: failures > 5,
          value: failures,
          message: `Storage failures: ${failures}`,
        };
      },
    });
  }

  async evaluateRules(): Promise<AlertEvent[]> {
    const triggeredAlerts: AlertEvent[] = [];
    const now = Date.now();

    for (const rule of this.rules) {
      const lastAlert = this.cooldowns.get(rule.name);
      if (lastAlert && now - lastAlert < rule.cooldownMs) continue;

      try {
        const result = await rule.check();

        if (result.triggered && result.value > rule.threshold) {
          const event: AlertEvent = {
            id: crypto.randomUUID(),
            ruleName: rule.name,
            severity: rule.severity,
            message: result.message,
            value: result.value,
            threshold: rule.threshold,
            timestamp: new Date(),
            acknowledged: false,
          };

          triggeredAlerts.push(event);
          this.alertHistory.push(event);
          this.cooldowns.set(rule.name, now);

          if (this.alertHistory.length > this.maxHistorySize) {
            this.alertHistory = this.alertHistory.slice(-this.maxHistorySize);
          }

          await this.sendAlert(event, rule.channels);

          logger.warn("[Alerting] Alert triggered", {
            rule: rule.name,
            severity: rule.severity,
            value: result.value,
            message: result.message,
          });
        }
      } catch (err) {
        logger.error("[Alerting] Rule evaluation failed", err as Error, {
          rule: rule.name,
        });
      }
    }

    return triggeredAlerts;
  }

  private async sendAlert(
    event: AlertEvent,
    channels: AlertChannel[],
  ): Promise<void> {
    for (const channel of channels) {
      try {
        await this.sendToChannel(channel, event);
      } catch (err) {
        logger.error("[Alerting] Channel send failed", err as Error, {
          channel,
          rule: event.ruleName,
        });
      }
    }
  }

  private async sendToChannel(
    channel: AlertChannel,
    event: AlertEvent,
  ): Promise<void> {
    const env = getEnv();

    switch (channel) {
      case "slack": {
        const webhook = process.env.SLACK_WEBHOOK_URL;
        if (!webhook) break;
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `[${event.severity.toUpperCase()}] ${event.ruleName}: ${event.message}`,
            attachments: [
              {
                color: event.severity === "critical" ? "danger" : "warning",
                fields: [
                  { title: "Value", value: String(event.value), short: true },
                  {
                    title: "Threshold",
                    value: String(event.threshold),
                    short: true,
                  },
                  {
                    title: "Time",
                    value: event.timestamp.toISOString(),
                    short: true,
                  },
                ],
              },
            ],
          }),
        });
        break;
      }

      case "email": {
        const { sendEmail } = await import("@/services/email");
        await sendEmail({
          to: env.NEXT_PUBLIC_APP_URL?.includes("localhost")
            ? ""
            : "ops@bhw-pas.com",
          subject: `[${event.severity.toUpperCase()}] Alert: ${event.ruleName}`,
          html: `<h2>Alert: ${event.ruleName}</h2>
                 <p><strong>Severity:</strong> ${event.severity}</p>
                 <p><strong>Message:</strong> ${event.message}</p>
                 <p><strong>Value:</strong> ${event.value} (threshold: ${event.threshold})</p>
                 <p><strong>Time:</strong> ${event.timestamp.toISOString()}</p>`,
        });
        break;
      }

      case "webhook": {
        const webhookUrl = process.env.ALERT_WEBHOOK_URL;
        if (!webhookUrl) break;
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event),
        });
        break;
      }

      case "log": {
        logger.warn("[Alerting] Channel:log", {
          rule: event.ruleName,
          severity: event.severity,
          message: event.message,
        });
        break;
      }
    }
  }

  async evaluateAll(): Promise<AlertEvent[]> {
    return this.evaluateRules();
  }

  getAlertHistory(limit = 50): AlertEvent[] {
    return this.alertHistory.slice(-limit).reverse();
  }

  acknowledgeAlert(id: string): boolean {
    const alert = this.alertHistory.find((a) => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  getUnacknowledgedCount(): number {
    return this.alertHistory.filter((a) => !a.acknowledged).length;
  }

  getRules(): AlertRule[] {
    return this.rules;
  }

  async getHealth(): Promise<{
    rules: number;
    activeAlerts: number;
    lastEvaluation: string | null;
  }> {
    return {
      rules: this.rules.length,
      activeAlerts: this.alertHistory.filter((a) => !a.acknowledged).length,
      lastEvaluation:
        this.alertHistory[
          this.alertHistory.length - 1
        ]?.timestamp.toISOString() ?? null,
    };
  }
}

export const alertingService = new AlertingService();
