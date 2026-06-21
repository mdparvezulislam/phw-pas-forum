import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support Center",
};

export default async function AdminSupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support Center</h1>
        <p className="text-sm text-muted-foreground">
          Manage support tickets and inquiries
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Open Tickets</p>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Unread Messages</p>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Avg Response Time</p>
          <p className="text-2xl font-bold">-</p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">Recent Tickets</h2>
        <div className="flex min-h-[200px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No support tickets yet
          </p>
        </div>
      </div>
    </div>
  );
}
