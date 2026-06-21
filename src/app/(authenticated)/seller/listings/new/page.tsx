import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMarketplaceCategories } from "@/services/marketplace";
import { CreateListingForm } from "./CreateListingForm";

export const metadata: Metadata = {
  title: "Create New Listing | Marketplace",
  description:
    "Create digital products, services, or software packages on BHW marketplace.",
};

export default async function NewListingPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const categories = await getMarketplaceCategories();

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-4 px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create a New Service Listing
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Draft your marketplace package listing. Enhance your copy and optimize
          metadata using AI Copilot scan suggestions on the right side.
        </p>
      </div>

      <CreateListingForm categories={categories} />
    </div>
  );
}
