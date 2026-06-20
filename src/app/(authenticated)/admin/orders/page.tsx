import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminOrderManagement } from "@/modules/marketplace/components/admin-order-management";

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return <AdminOrderManagement />;
}
