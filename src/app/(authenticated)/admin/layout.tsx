import { redirect } from "next/navigation";
import { Header, Footer } from "@/components/design-system";
import { AdminSidebar } from "@/components/admin/sidebar";
import { auth } from "@/lib/auth";
import { requireRole } from "@/modules/auth/guards";
import { RoleName } from "@/types/rbac";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  await requireRole(RoleName.ADMIN).catch(() => {
    redirect("/");
  });

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto max-w-screen-2xl px-4 py-6">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
