import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, Mail, Clock, MessageSquare } from "lucide-react";
import { PageHeader, KpiCard, SectionCard } from "@/components/admin";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Support Center",
};

export default async function AdminSupportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Center"
        description="Manage support tickets and user inquiries"
        icon={<LifeBuoy className="h-5 w-5" />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Open Tickets"
          value={0}
          icon={MessageSquare}
          accent="warning"
          description="Awaiting response"
        />
        <KpiCard
          title="Unread Messages"
          value={0}
          icon={Mail}
          accent="info"
          description="New inquiries"
        />
        <KpiCard
          title="Avg Response Time"
          value="-"
          icon={Clock}
          accent="default"
          description="No data yet"
        />
      </div>

      <SectionCard
        title="Recent Tickets"
        description="Latest support requests from users"
        icon={<MessageSquare className="h-4 w-4" />}
        actions={
          <Link
            href="/admin/support/tickets"
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </Link>
        }
      >
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="text-center">
            <LifeBuoy className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              No support tickets yet
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Quick Actions"
        description="Common support tasks"
        icon={<LifeBuoy className="h-4 w-4" />}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/admin/support/tickets"
            className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
          >
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">All Tickets</p>
              <p className="text-xs text-muted-foreground">
                Browse all support tickets
              </p>
            </div>
          </Link>
          <Link
            href="/admin/support/faq"
            className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
          >
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Manage FAQ</p>
              <p className="text-xs text-muted-foreground">
                Update help articles
              </p>
            </div>
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
