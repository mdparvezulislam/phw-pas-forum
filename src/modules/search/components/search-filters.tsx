"use client";

import type React from "react";
import { useState } from "react";
import { Input, Label } from "@/components/ui";

export interface SearchFilterState {
  contentType:
    | "all"
    | "threads"
    | "posts"
    | "users"
    | "forums"
    | "badges"
    | "trophies";
  author: string;
  minReputation: string;
  sortBy:
    | "relevance"
    | "newest"
    | "oldest"
    | "most_viewed"
    | "most_replies"
    | "reputation";
  startDate: string;
  endDate: string;
  tagsString: string;
}

interface SearchFiltersProps {
  filters: SearchFilterState;
  onChange: (updates: Partial<SearchFilterState>) => void;
  onApply: () => void;
}

export function SearchFilters({
  filters,
  onChange,
  onApply,
}: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <div className="border bg-card/60 backdrop-blur-md rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚙️</span>
          <h3 className="font-semibold text-foreground">
            Advanced Search Options
          </h3>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="text-xs text-primary font-medium hover:underline cursor-pointer"
        >
          {isOpen ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {isOpen && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-2 border-t border-muted/50 animate-slide-down">
          {/* Content Type */}
          <div className="space-y-1.5">
            <Label htmlFor="contentType">Content Type</Label>
            <select
              id="contentType"
              name="contentType"
              value={filters.contentType}
              onChange={handleSelectChange}
              className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All Content</option>
              <option value="threads">Threads</option>
              <option value="posts">Posts</option>
              <option value="users">Members</option>
              <option value="forums">Forums</option>
              <option value="badges">Badges</option>
              <option value="trophies">Trophies</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="space-y-1.5">
            <Label htmlFor="sortBy">Sort Results By</Label>
            <select
              id="sortBy"
              name="sortBy"
              value={filters.sortBy}
              onChange={handleSelectChange}
              className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              {filters.contentType === "threads" && (
                <>
                  <option value="most_viewed">Most Viewed</option>
                  <option value="most_replies">Most Replies</option>
                </>
              )}
              {filters.contentType === "users" && (
                <option value="reputation">Reputation Points</option>
              )}
            </select>
          </div>

          {/* Author */}
          <div className="space-y-1.5">
            <Label htmlFor="author">Posted by User</Label>
            <Input
              id="author"
              name="author"
              type="text"
              placeholder="Username"
              value={filters.author}
              onChange={handleInputChange}
            />
          </div>

          {/* Min Reputation */}
          {filters.contentType === "users" && (
            <div className="space-y-1.5">
              <Label htmlFor="minReputation">Min Reputation Points</Label>
              <Input
                id="minReputation"
                name="minReputation"
                type="number"
                placeholder="e.g. 50"
                value={filters.minReputation}
                onChange={handleInputChange}
              />
            </div>
          )}

          {/* Tags */}
          {(filters.contentType === "all" ||
            filters.contentType === "threads") && (
            <div className="space-y-1.5">
              <Label htmlFor="tagsString">Tags</Label>
              <Input
                id="tagsString"
                name="tagsString"
                type="text"
                placeholder="seo, backlinks, google (comma-separated)"
                value={filters.tagsString}
                onChange={handleInputChange}
              />
            </div>
          )}

          {/* Start Date */}
          <div className="space-y-1.5">
            <Label htmlFor="startDate">From Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={filters.startDate}
              onChange={handleInputChange}
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <Label htmlFor="endDate">To Date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={filters.endDate}
              onChange={handleInputChange}
            />
          </div>
        </div>
      )}

      {isOpen && (
        <div className="flex justify-end pt-2">
          <button
            onClick={onApply}
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
}
