import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SellerOrderDashboard } from "@/modules/marketplace/components/seller-order-dashboard";

export default async function SellerOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return <SellerOrderDashboard userId={session.user.id!} />;
}
