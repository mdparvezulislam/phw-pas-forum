import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { OrderDetailPage } from "@/modules/marketplace/components/order-detail-page";

export default async function OrderDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const { id } = await params;

  return <OrderDetailPage orderId={id} userId={session.user.id!} />;
}
