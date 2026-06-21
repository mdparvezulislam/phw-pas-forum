import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AIAssistant } from "@/modules/ai/components/AIAssistant";

export const metadata: Metadata = {
  title: "AI Assistant",
  description: "Get instant platform assistance and VIP answers.",
};

export default async function AIAssistantPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          AI Assistant
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          BHW PAS smart chat assistance. Discover listings, ask help questions,
          or summarize resources.
        </p>
      </div>
      <AIAssistant />
    </div>
  );
}
