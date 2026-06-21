import { redirect } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/admin";
import { AdminOrderManagement } from "@/modules/marketplace/components/admin-order-management";

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage marketplace orders, payments, and fulfillment"
        icon={<ShoppingCart />}
      />
      <AdminOrderManagement />
    </div>
  );
}
