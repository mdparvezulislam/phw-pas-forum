import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SellerDashboard } from "@/modules/marketplace/components/seller-dashboard";

export default async function SellerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return <SellerDashboard userId={session.user.id!} />;
}
