import React from "react";
import { SearchDashboard } from "@/modules/search/components";

export const metadata = {
  title: "Search | BHW PAS",
  description: "Advanced community forum search engine.",
};

export default function SearchPage() {
  return (
    <div className="container max-w-4xl py-8">
      <SearchDashboard />
    </div>
  );
}
