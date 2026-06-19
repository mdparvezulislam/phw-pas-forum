import type {
  Thread,
  ThreadStatus,
  ThreadVisibility,
} from "@/db/schema/threads";

export interface ThreadWithRelations extends Thread {
  author: {
    id: string;
    username: string | null;
    displayName: string | null;
    image: string | null;
  };
  tags: { tag: string }[];
  isWatched?: boolean;
  isBookmarked?: boolean;
}

export interface ThreadListOptions {
  forumId?: string;
  authorId?: string;
  status?: ThreadStatus;
  visibility?: ThreadVisibility;
  isPinned?: boolean;
  isFeatured?: boolean;
  page: number;
  perPage: number;
  sort: "latest" | "oldest" | "most_viewed" | "most_replies";
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
