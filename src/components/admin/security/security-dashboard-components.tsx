"use client";

import React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Ban,
  AlertTriangle,
  UserCheck,
  ServerCrash,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/admin";
import { formatDistanceToNow } from "date-fns";

interface SecurityEvent {
  id: string;
  userId: string | null;
  action: string;
  resource: string | null;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: any;
  createdAt: Date;
}

export function IncidentTimeline({ events }: { events: SecurityEvent[] }) {
  const getEventIcon = (action: string) => {
    switch (action) {
      case "auth:login_failed":
        return <Lock className="h-4 w-4 text-destructive" />;
      case "security:suspicious_login":
        return <ShieldAlert className="h-4 w-4 text-warning" />;
      case "admin:user_ban":
        return <Ban className="h-4 w-4 text-destructive" />;
      case "queue:job_failed":
        return <ServerCrash className="h-4 w-4 text-destructive" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventBadge = (action: string) => {
    switch (action) {
      case "auth:login_failed":
        return <Badge variant="destructive">Brute Force Risk</Badge>;
      case "security:suspicious_login":
        return <Badge variant="warning">Anomalous Signin</Badge>;
      case "admin:user_ban":
        return <Badge variant="destructive">User Banned</Badge>;
      case "queue:job_failed":
        return <Badge variant="outline">DLQ Alert</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  return (
    <SectionCard
      title="Security Incident Timeline"
      description="Live feed of suspicious logins, login failures, and admin actions"
      icon={<ShieldAlert className="h-4 w-4" />}
    >
      {events.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center text-center">
          <div>
            <ShieldCheck className="mx-auto h-12 w-12 text-success/50" />
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              No recent security incidents detected.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative border-l pl-4 space-y-6">
          {events.map((event) => (
            <div key={event.id} className="relative">
              {/* Timeline dot */}
              <span className="absolute -left-[25px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-background border">
                {getEventIcon(event.action)}
              </span>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {event.action
                        .replace("auth:", "")
                        .replace("security:", "")
                        .replace("_", " ")
                        .toUpperCase()}
                    </span>
                    {getEventBadge(event.action)}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    IP: {event.ipAddress || "Unknown"} | OS/Agent:{" "}
                    {event.userAgent
                      ? event.userAgent.slice(0, 70) + "..."
                      : "Unknown"}
                  </p>
                  {event.metadata && (
                    <div className="mt-2 rounded-lg bg-muted p-2.5 text-xs font-mono overflow-x-auto max-w-full">
                      {JSON.stringify(event.metadata)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground self-start sm:self-center shrink-0">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(event.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
