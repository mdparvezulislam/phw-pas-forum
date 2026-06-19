import type { icons } from "lucide-react";

export interface ForumWithChildren {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  position: number;
  isVisible: boolean;
  isLocked: boolean;
  isPremiumOnly: boolean;
  threadCount: number;
  postCount: number;
  lastActivityAt: Date | null;
  parentForumId: string | null;
  children: ForumWithChildren[];
}

export interface CategoryWithForums {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  position: number;
  isVisible: boolean;
  isPremiumOnly: boolean;
  forums: ForumWithChildren[];
}
