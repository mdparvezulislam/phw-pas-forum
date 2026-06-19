import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsSidebar } from "@/modules/users/components/settings-sidebar";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="grid gap-8 md:grid-cols-[200px_1fr]">
      <aside>
        <SettingsSidebar />
      </aside>
      <div>{children}</div>
    </div>
  );
}
