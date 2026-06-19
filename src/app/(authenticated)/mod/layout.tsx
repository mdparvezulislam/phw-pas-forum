import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireRole } from "@/modules/auth/guards";
import { RoleName } from "@/types/rbac";
import { Header, Footer } from "@/components/design-system";
import Link from "next/link";

export default async function ModLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  await requireRole(RoleName.MODERATOR).catch(() => {
    redirect("/");
  });

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-screen-2xl px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Moderator Panel</h1>
            <p className="text-sm text-muted-foreground">
              Moderate community content
            </p>
          </div>
          <div className="mb-6 flex gap-4 border-b">
            <Link
              href="/mod/threads"
              className="border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Threads
            </Link>
            <Link
              href="/mod/reports"
              className="border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Reports
            </Link>
          </div>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
