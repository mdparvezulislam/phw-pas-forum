import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header, Footer } from "@/components/design-system";

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
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-screen-2xl px-4 py-6">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
