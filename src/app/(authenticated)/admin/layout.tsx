import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer, Header } from "@/components/design-system";
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

  const tabs = [
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/forums", label: "Forums" },
    { href: "/admin/threads", label: "Threads" },
    { href: "/admin/reputation", label: "Reputation" },
    { href: "/admin/badges", label: "Badges" },
    { href: "/admin/trophies", label: "Trophies" },
    { href: "/admin/search", label: "Search Index" },
    { href: "/admin/marketplace", label: "Marketplace Rules" },
  ];

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-screen-2xl px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">
              Manage your community
            </p>
          </div>
          <div className="mb-6 flex flex-wrap gap-4 border-b">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className="border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-muted-foreground hover:text-foreground data-[active=true]:border-primary data-[active=true]:text-foreground"
              >
                {tab.label}
              </Link>
            ))}
          </div>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
