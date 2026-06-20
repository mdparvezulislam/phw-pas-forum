import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminTransactionManagement } from "@/modules/marketplace/components/admin-transaction-management";

export default async function AdminTransactionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return <AdminTransactionManagement />;
}
