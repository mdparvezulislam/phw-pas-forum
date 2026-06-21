import { redirect } from "next/navigation";
import { Footer, Header } from "@/components/design-system";
import { auth } from "@/lib/auth";

export default async function ForumsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Desktop view */}
      <div className="hidden md:flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto max-w-screen-2xl px-4 py-6">
            {children}
          </div>
        </main>
        <Footer />
      </div>

      {/* Mobile view */}
      <div className="block md:hidden">{children}</div>
    </div>
  );
}
