import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDatabase, schema } from "@/db";
import { desc } from "drizzle-orm";
import { AdminTransactionManagement } from "@/modules/marketplace/components/admin-transaction-management";

export default async function AdminTransactionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const db = getDatabase();
  const items = await db.query.transactions.findMany({
    orderBy: [desc(schema.transactions.createdAt)],
    limit: 50,
    with: { order: true, buyer: true, seller: true },
  });

  const serializedItems = items.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));

  return <AdminTransactionManagement initialTransactions={serializedItems} />;
}
