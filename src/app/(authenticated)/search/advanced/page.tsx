import React from "react";
import { SearchDashboard } from "@/modules/search/components";

export const metadata = {
  title: "Advanced Search | BHW PAS",
  description: "Advanced search filters and options for community forums.",
};

export default function AdvancedSearchPage() {
  return (
    <div className="container max-w-4xl py-8">
      <SearchDashboard />
    </div>
  );
}
