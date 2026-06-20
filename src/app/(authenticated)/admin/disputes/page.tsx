import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminDisputeManagement } from "@/modules/marketplace/components/admin-dispute-management";

export default async function AdminDisputesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return <AdminDisputeManagement />;
}
