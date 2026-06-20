import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { OrderDashboard } from "@/modules/marketplace/components/order-dashboard";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return <OrderDashboard userId={session.user.id!} />;
}
