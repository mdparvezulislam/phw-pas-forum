import { redirect } from "next/navigation";
import { Gavel } from "lucide-react";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/admin";
import { AdminDisputeManagement } from "@/modules/marketplace/components/admin-dispute-management";

export default async function AdminDisputesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Disputes"
        description="Resolve marketplace disputes and manage claims"
        icon={<Gavel className="h-5 w-5" />}
      />
      <AdminDisputeManagement />
    </div>
  );
}
