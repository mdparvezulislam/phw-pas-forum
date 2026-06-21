import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/layout/admin-shell";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const u = session.user;

  return (
    <AdminShell
      user={{
        displayName: u.displayName ?? null,
        username: u.username ?? null,
        email: u.email ?? null,
        image: u.image ?? null,
        role: u.role ?? null,
      }}
    >
      {children}
    </AdminShell>
  );
}
