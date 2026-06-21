import {
  Activity,
  Database,
  HardDrive,
  Search,
  Cloud,
  Cpu,
  Radio,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import type { Metadata } from "next";
import { PageHeader, KpiCard, SectionCard } from "@/components/admin";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Operations Center",
};

type ServiceStatus = "operational" | "degraded" | "down";

interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  lastChecked: string;
  icon: React.ReactNode;
}

const services: ServiceHealth[] = [
  {
    name: "PostgreSQL Database",
    status: "operational",
    lastChecked: "2 min ago",
    icon: <Database className="h-4 w-4" />,
  },
  {
    name: "Redis Cache",
    status: "operational",
    lastChecked: "1 min ago",
    icon: <HardDrive className="h-4 w-4" />,
  },
  {
    name: "Typesense Search",
    status: "operational",
    lastChecked: "3 min ago",
    icon: <Search className="h-4 w-4" />,
  },
  {
    name: "Cloudflare R2 Storage",
    status: "operational",
    lastChecked: "2 min ago",
    icon: <Cloud className="h-4 w-4" />,
  },
  {
    name: "AI Providers",
    status: "operational",
    lastChecked: "5 min ago",
    icon: <Cpu className="h-4 w-4" />,
  },
  {
    name: "Ably Realtime",
    status: "operational",
    lastChecked: "1 min ago",
    icon: <Radio className="h-4 w-4" />,
  },
];

const statusConfig: Record<
  ServiceStatus,
  { label: string; badge: "success" | "warning" | "destructive"; icon: React.ReactNode; dotColor: string }
> = {
  operational: {
    label: "Operational",
    badge: "success",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    dotColor: "bg-success",
  },
  degraded: {
    label: "Degraded",
    badge: "warning",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    dotColor: "bg-warning",
  },
  down: {
    label: "Down",
    badge: "destructive",
    icon: <XCircle className="h-3.5 w-3.5" />,
    dotColor: "bg-destructive",
  },
};

function getStatusInfo(status: ServiceStatus) {
  return statusConfig[status];
}

export default function AdminOperationsPage() {
  const allOperational = services.every((s) => s.status === "operational");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Center"
        description="System health, infrastructure status, and service monitoring"
        icon={<Activity className="h-5 w-5" />}
        actions={
          <Badge variant={allOperational ? "success" : "warning"} size="lg">
            {allOperational ? "All Systems Operational" : "Degraded Performance"}
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="System Status"
          value={allOperational ? "Operational" : "Degraded"}
          icon={Activity}
          description="Overall platform health"
          accent={allOperational ? "success" : "warning"}
        />
        <KpiCard
          title="Uptime"
          value="99.98%"
          icon={CheckCircle}
          description="Last 30 days"
          accent="success"
        />
        <KpiCard
          title="Response Time"
          value="142ms"
          icon={Activity}
          description="Average API latency"
          accent="info"
        />
        <KpiCard
          title="Error Rate"
          value="0.02%"
          icon={AlertTriangle}
          description="Last 24 hours"
          accent="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Service Health"
          description="Status of all platform services"
          icon={<CheckCircle className="h-4 w-4" />}
          className="lg:col-span-2"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {services.map((service) => {
              const statusInfo = getStatusInfo(service.status);
              return (
                <div
                  key={service.name}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      {service.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Last checked {service.lastChecked}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${statusInfo.dotColor}`} />
                    <Badge variant={statusInfo.badge} size="sm">
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="System Metrics"
          description="Infrastructure performance"
          icon={<Cpu className="h-4 w-4" />}
        >
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm font-semibold tabular-nums">12%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div className="h-2 w-[12%] rounded-full bg-success" />
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm font-semibold tabular-nums">64%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div className="h-2 w-[64%] rounded-full bg-info" />
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Disk Usage</span>
                <span className="text-sm font-semibold tabular-nums">43%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div className="h-2 w-[43%] rounded-full bg-info" />
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Connections</span>
                <span className="text-sm font-semibold tabular-nums">1,247</span>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Queue Depth</span>
                <span className="text-sm font-semibold tabular-nums">0</span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
